import { useState, useEffect } from 'react';
import { useBooks } from '../contexts/BookContext';
import { useUser } from '../contexts/UserContext';
import { generateRecommendations, getRecommendationReason } from '../utils/helpers';
import { getBooksByGenre, getTrendingBooks, getPopularBooks } from '../services/bookAPI';

export const useRecommendations = () => {
  const { ratings, readingList, searchResults } = useBooks();
  const { preferences } = useUser();
  const [recommendations, setRecommendations] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generatePersonalizedRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Generating recommendations...', {
        ratingsCount: Object.keys(ratings).length,
        genresCount: preferences.genres?.length || 0,
        readingListCount: readingList.length
      });

      // If user has ratings, use rating-based recommendations
      if (Object.keys(ratings).length > 0) {
        await generateRatingBasedRecommendations();
      } 
      // If user has genre preferences but no ratings
      else if (preferences.genres && preferences.genres.length > 0) {
        await generateGenreBasedRecommendations();
      }
      // If user has books in reading list but no preferences
      else if (readingList.length > 0) {
        await generateReadingListBasedRecommendations();
      }
      // Fallback to popular books
      else {
        await generatePopularRecommendations();
      }
    } catch (err) {
      setError('Failed to generate recommendations');
      console.error('Recommendation error:', err);
      // Fallback to popular books on error
      await generatePopularRecommendations();
    } finally {
      setLoading(false);
    }
  };

  const generateRatingBasedRecommendations = async () => {
    try {
      // Get genres from highly rated books
      const highlyRatedGenres = getGenresFromRatedBooks();
      
      if (highlyRatedGenres.length === 0) {
        await generateGenreBasedRecommendations();
        return;
      }

      // Fetch books from top genres
      const genrePromises = highlyRatedGenres.slice(0, 3).map(genre => 
        getBooksByGenre(genre, 8)
      );
      
      const genreResults = await Promise.all(genrePromises);
      const allBooks = genreResults.flat();
      
      // Remove duplicates and books already in reading list
      const filteredBooks = filterAndDeduplicateBooks(allBooks);
      
      const recsWithReasons = filteredBooks.slice(0, 20).map(book => ({
        ...book,
        recommendationReason: `You rated ${highlyRatedGenres[0]} books highly`
      }));

      setRecommendations(recsWithReasons);
    } catch (error) {
      console.error('Rating-based recommendations error:', error);
      throw error;
    }
  };

  const generateGenreBasedRecommendations = async () => {
    try {
      const genrePromises = preferences.genres.slice(0, 3).map(genre => 
        getBooksByGenre(genre, 10)
      );
      
      const genreResults = await Promise.all(genrePromises);
      const allBooks = genreResults.flat();
      
      const filteredBooks = filterAndDeduplicateBooks(allBooks);
      
      const recsWithReasons = filteredBooks.slice(0, 20).map(book => ({
        ...book,
        recommendationReason: `Based on your interest in ${preferences.genres.slice(0, 2).join(' and ')}`
      }));

      setRecommendations(recsWithReasons);
    } catch (error) {
      console.error('Genre-based recommendations error:', error);
      throw error;
    }
  };

  const generateReadingListBasedRecommendations = async () => {
    try {
      // Extract genres from reading list
      const genres = [...new Set(
        readingList
          .flatMap(book => book.categories || [])
          .filter(Boolean)
      )].slice(0, 3);

      if (genres.length === 0) {
        await generatePopularRecommendations();
        return;
      }

      const genrePromises = genres.map(genre => getBooksByGenre(genre, 8));
      const genreResults = await Promise.all(genrePromises);
      const allBooks = genreResults.flat();
      
      const filteredBooks = filterAndDeduplicateBooks(allBooks);
      
      const recsWithReasons = filteredBooks.slice(0, 20).map(book => ({
        ...book,
        recommendationReason: `Similar to books in your library`
      }));

      setRecommendations(recsWithReasons);
    } catch (error) {
      console.error('Reading list based recommendations error:', error);
      throw error;
    }
  };

  const generatePopularRecommendations = async () => {
    try {
      const popularBooks = await getPopularBooks(20);
      const filteredBooks = filterAndDeduplicateBooks(popularBooks);
      
      const recsWithReasons = filteredBooks.map(book => ({
        ...book,
        recommendationReason: 'Popular with other readers'
      }));

      setRecommendations(recsWithReasons);
    } catch (error) {
      console.error('Popular recommendations error:', error);
      setRecommendations([]);
    }
  };

  const getGenresFromRatedBooks = () => {
    const genres = [];
    Object.entries(ratings).forEach(([bookId, rating]) => {
      if (rating >= 4) {
        const book = readingList.find(b => b.id === bookId);
        if (book && book.categories) {
          genres.push(...book.categories);
        }
      }
    });
    
    // Count genre frequency and return top genres
    const genreCount = {};
    genres.forEach(genre => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });
    
    return Object.entries(genreCount)
      .sort(([,a], [,b]) => b - a)
      .map(([genre]) => genre)
      .slice(0, 3);
  };

  const filterAndDeduplicateBooks = (books) => {
    const readingListIds = readingList.map(book => book.id);
    const seen = new Set();
    
    return books.filter(book => {
      if (seen.has(book.id) || readingListIds.includes(book.id)) {
        return false;
      }
      seen.add(book.id);
      return true;
    });
  };

  const loadTrendingBooks = async () => {
    try {
      const trending = await getTrendingBooks(12);
      const filteredTrending = filterAndDeduplicateBooks(trending);
      setTrendingBooks(filteredTrending);
    } catch (err) {
      console.error('Trending books error:', err);
      // Fallback to popular books
      try {
        const popular = await getPopularBooks(12);
        const filteredPopular = filterAndDeduplicateBooks(popular);
        setTrendingBooks(filteredPopular);
      } catch (fallbackErr) {
        console.error('Fallback trending books error:', fallbackErr);
      }
    }
  };

  useEffect(() => {
    generatePersonalizedRecommendations();
  }, [ratings, preferences.genres, preferences.authors, readingList.length]);

  useEffect(() => {
    loadTrendingBooks();
  }, [readingList.length]);

  return {
    recommendations,
    trendingBooks,
    loading,
    error,
    refreshRecommendations: generatePersonalizedRecommendations
  };
};