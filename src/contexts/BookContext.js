import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const BookContext = createContext();

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within BookProvider');
  }
  return context;
};

export const BookProvider = ({ children }) => {
  const [readingList, setReadingList] = useState([]);
  const [ratings, setRatings] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGenresForHome, setSelectedGenresForHome] = useState([]); // New state

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedReadingList = localStorage.getItem('bookApp_readingList');
      const savedRatings = localStorage.getItem('bookApp_ratings');
      const savedGenres = localStorage.getItem('bookApp_selectedGenres');

      if (savedReadingList) {
        setReadingList(JSON.parse(savedReadingList));
      }

      if (savedRatings) {
        setRatings(JSON.parse(savedRatings));
      }

      if (savedGenres) {
        setSelectedGenresForHome(JSON.parse(savedGenres));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bookApp_readingList', JSON.stringify(readingList));
  }, [readingList]);

  useEffect(() => {
    localStorage.setItem('bookApp_ratings', JSON.stringify(ratings));
  }, [ratings]);

  useEffect(() => {
    localStorage.setItem('bookApp_selectedGenres', JSON.stringify(selectedGenresForHome));
  }, [selectedGenresForHome]);

  const addToReadingList = useCallback((book) => {
    setReadingList(prev => {
      const exists = prev.find(b => b.id === book.id);
      if (exists) return prev;
      return [...prev, { 
        ...book, 
        dateAdded: new Date().toISOString(),
        readingStatus: 'want-to-read'
      }];
    });
  }, []);

  const removeFromReadingList = useCallback((bookId) => {
    setReadingList(prev => prev.filter(book => book.id !== bookId));
  }, []);

  const updateReadingStatus = useCallback((bookId, status) => {
    setReadingList(prev => 
      prev.map(book => 
        book.id === bookId 
          ? { ...book, readingStatus: status, statusUpdated: new Date().toISOString() }
          : book
      )
    );
  }, []);

  const rateBook = useCallback((bookId, rating) => {
    setRatings(prev => ({ ...prev, [bookId]: rating }));
  }, []);

  const getBookStats = useCallback(() => {
    const totalBooks = readingList?.length || 0;
    const totalRated = Object.keys(ratings || {}).length;
    const finishedBooks = readingList?.filter(book => book.readingStatus === 'finished').length || 0;
    const currentlyReading = readingList?.filter(book => book.readingStatus === 'currently-reading').length || 0;
    const ratingsArray = Object.values(ratings || {});

    return {
      totalBooks,
      totalRated,
      finishedBooks,
      currentlyReading,
      averageRating: ratingsArray.length > 0 ? 
        ratingsArray.reduce((sum, rating) => sum + rating, 0) / ratingsArray.length : 0
    };
  }, [readingList, ratings]);

  // New function to update homepage genre preferences
  const updateHomepageGenres = useCallback((genres) => {
    setSelectedGenresForHome(genres || []);
  }, []);

  const value = {
    readingList: readingList || [],
    ratings: ratings || {},
    searchResults: searchResults || [],
    loading: loading || false,
    error,
    selectedGenresForHome: selectedGenresForHome || [], // Ensure it's always an array
    addToReadingList,
    removeFromReadingList,
    updateReadingStatus,
    rateBook,
    getBookStats,
    setSearchResults,
    setLoading,
    setError,
    updateHomepageGenres, // New function
  };

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
};