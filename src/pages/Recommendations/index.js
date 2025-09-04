import { useState, useEffect, useCallback } from 'react';
import { useBooks } from '../../contexts/BookContext';
import { useUser } from '../../contexts/UserContext';
import BookCard from '../../components/BookCard';
import { searchBooks, getPopularBooks } from '../../services/bookAPI';
import { GENRE_OPTIONS } from '../../utils/helpers';
import { 
  Sparkles, 
  TrendingUp, 
  RefreshCw, 
  BookOpen, 
  Star, 
  Target,
  AlertCircle,
  ChevronRight,
  Filter,
  X,
  Home
} from 'lucide-react';
import './Recommendations.css';

const Recommendations = () => {
  const { 
    readingList, 
    ratings, 
    getBookStats, 
    selectedGenresForHome, 
    updateHomepageGenres 
  } = useBooks();
  const { preferences } = useUser();
  
  const [personalizedRecs, setPersonalizedRecs] = useState([]);
  const [genreRecs, setGenreRecs] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [activeTab, setActiveTab] = useState('for-you');
  const [loading, setLoading] = useState(false);
  const [genreLoading, setGenreLoading] = useState(false);
  const [error, setError] = useState(null);

  const stats = getBookStats();
  const hasPreferences = (preferences?.genres?.length > 0) || (preferences?.authors?.length > 0);
  const hasRatings = Object.keys(ratings || {}).length > 0;

  // Initialize selected genres from context
  useEffect(() => {
    if (selectedGenresForHome && selectedGenresForHome.length > 0) {
      setSelectedGenres(selectedGenresForHome);
    }
  }, [selectedGenresForHome]);

  const loadTrendingBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const trending = await getPopularBooks(12);
      setTrendingBooks(trending || []);
    } catch (error) {
      console.error('Error loading trending books:', error);
      setError('Failed to load trending books');
      setTrendingBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalizedRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let recommendations = [];

      // Load based on user preferences
      if (preferences?.genres?.length > 0) {
        for (const genre of preferences.genres.slice(0, 3)) {
          try {
            const genreBooks = await searchBooks(`subject:${genre}`, 4);
            const filteredBooks = (genreBooks || []).filter(book => 
              !(readingList || []).some(rb => rb.id === book.id)
            );
            
            filteredBooks.forEach(book => {
              book.recommendationReason = `Because you like ${genre}`;
            });
            
            recommendations = [...recommendations, ...filteredBooks.slice(0, 2)];
          } catch (error) {
            console.error(`Error loading ${genre} books:`, error);
          }
        }
      }

      // Load based on favorite authors
      if (preferences?.authors?.length > 0) {
        for (const author of preferences.authors.slice(0, 2)) {
          try {
            const authorBooks = await searchBooks(`inauthor:"${author}"`, 4);
            const filteredBooks = (authorBooks || []).filter(book => {
              const inReadingList = (readingList || []).some(rb => rb.id === book.id);
              const alreadyRecommended = recommendations.some(rb => rb.id === book.id);
              return !inReadingList && !alreadyRecommended;
            });
            
            filteredBooks.forEach(book => {
              book.recommendationReason = `More books by ${author}`;
            });
            
            recommendations = [...recommendations, ...filteredBooks.slice(0, 2)];
          } catch (error) {
            console.error(`Error loading books by ${author}:`, error);
          }
        }
      }

      const uniqueRecommendations = recommendations
        .filter((book, index, self) => self.findIndex(b => b.id === book.id) === index)
        .slice(0, 12);

      setPersonalizedRecs(uniqueRecommendations);
      
    } catch (error) {
      console.error('Error loading personalized recommendations:', error);
      setError('Failed to load personalized recommendations');
      setPersonalizedRecs([]);
    } finally {
      setLoading(false);
    }
  }, [preferences, readingList]);

const loadGenreBasedRecommendations = useCallback(async () => {
  try {
    setGenreLoading(true);
    let allGenreBooks = [];

    for (const genre of selectedGenres) {
      try {
        // Use regular searchBooks with subject query
        const genreBooks = await searchBooks(`subject:${genre}`, 8);
        const filteredBooks = genreBooks.filter(book => 
          !readingList.some(rb => rb.id === book.id)
        );
        
        filteredBooks.forEach(book => {
          book.recommendationReason = `${genre} books for you`;
        });
        
        allGenreBooks = [...allGenreBooks, ...filteredBooks];
      } catch (error) {
        console.error(`Error loading ${genre} books:`, error);
      }
    }

    const uniqueBooks = allGenreBooks
      .filter((book, index, self) => self.findIndex(b => b.id === book.id) === index)
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);

    setGenreRecs(uniqueBooks);
    
  } catch (error) {
    console.error('Error loading genre recommendations:', error);
    setError('Failed to load genre recommendations');
  } finally {
    setGenreLoading(false);
  }
}, [selectedGenres, readingList]);

  useEffect(() => {
    loadTrendingBooks();
    if (hasPreferences || hasRatings) {
      loadPersonalizedRecommendations();
    }
  }, [hasPreferences, hasRatings, loadPersonalizedRecommendations]);

  useEffect(() => {
    if (selectedGenres.length > 0) {
      loadGenreBasedRecommendations();
      // Update homepage to show books from selected genres
      if (updateHomepageGenres) {
        updateHomepageGenres(selectedGenres);
      }
    } else {
      setGenreRecs([]);
      // Clear homepage genre filter
      if (updateHomepageGenres) {
        updateHomepageGenres([]);
      }
    }
  }, [selectedGenres, updateHomepageGenres, loadGenreBasedRecommendations]);

  const handleGenreToggle = (genre) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else if (prev.length < 5) {
        return [...prev, genre];
      }
      return prev;
    });
  };

  const clearSelectedGenres = () => {
    setSelectedGenres([]);
  };

  const handleRefreshRecommendations = () => {
    if (hasPreferences || hasRatings) {
      loadPersonalizedRecommendations();
    }
    if (selectedGenres.length > 0) {
      loadGenreBasedRecommendations();
    }
    loadTrendingBooks();
  };

  const renderEmptyState = () => (
    <div className="recommendation-empty-state">
      <AlertCircle size={64} />
      <h3>Building your recommendations...</h3>
      <p>We need a bit more information to create perfect recommendations for you!</p>
      
      <div className="recommendation-tips">
        <h4>Help us recommend better books:</h4>
        
        <div className="tip-item">
          <div className="tip-icon">
            <Star size={24} />
          </div>
          <div className="tip-content">
            <h5>Rate some books</h5>
            <p>Rate books in your library to help us understand your taste</p>
          </div>
        </div>

        <div className="tip-item">
          <div className="tip-icon">
            <Target size={24} />
          </div>
          <div className="tip-content">
            <h5>Add favorite genres</h5>
            <p>Update your preferences to get genre-based recommendations</p>
          </div>
        </div>

        <div className="tip-item">
          <div className="tip-icon">
            <BookOpen size={24} />
          </div>
          <div className="tip-content">
            <h5>Add more books</h5>
            <p>Build your reading list from our book collection</p>
          </div>
        </div>
      </div>

      <button 
        className="setup-preferences-button"
        onClick={() => window.location.href = '/profile'}
      >
        Set up preferences <ChevronRight size={16} />
      </button>
    </div>
  );

  const renderGenreFilter = () => (
    <div className="genre-filter-section">
      <div className="filter-header">
        <h4>
          <Filter size={20} />
          Choose Genres to Explore
        </h4>
        <div className="filter-actions">
          {selectedGenres.length > 0 && (
            <>
              <span className="homepage-indicator">
                <Home size={16} />
                Also showing on Homepage
              </span>
              <button className="clear-filters" onClick={clearSelectedGenres}>
                <X size={16} />
                Clear All
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="genre-selection-grid">
        {(GENRE_OPTIONS || []).map((genre) => (
          <button
            key={genre}
            onClick={() => handleGenreToggle(genre)}
            className={`genre-chip ${selectedGenres.includes(genre) ? 'selected' : ''}`}
            disabled={!selectedGenres.includes(genre) && selectedGenres.length >= 5}
          >
            {genre}
          </button>
        ))}
      </div>
      
      {selectedGenres.length > 0 && (
        <div className="selected-info">
          {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''} selected
          {selectedGenres.length >= 5 && ' (max reached)'}
        </div>
      )}
    </div>
  );

  const renderBookGrid = (books, showReason = false) => (
    <div className="recommendation-grid">
      {books.map((book) => (
        <div key={book.id} className="recommendation-card-wrapper">
          <BookCard book={book} />
          {showReason && book.recommendationReason && (
            <p className="recommendation-reason">{book.recommendationReason}</p>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="recommendations">
      <div className="recommendation-header">
        <h1>
          <Sparkles size={32} />
          Discover Books
        </h1>
        
        {stats && (
          <div className="reading-stats">
            <div className="stat">
              <BookOpen size={16} />
              <span>{stats.totalBooks} books in library</span>
            </div>
            <div className="stat">
              <Star size={16} />
              <span>{stats.ratedBooks} books rated</span>
            </div>
          </div>
        )}
      </div>

      <div className="recommendation-tabs">
        <button
          className={`tab ${activeTab === 'for-you' ? 'active' : ''}`}
          onClick={() => setActiveTab('for-you')}
        >
          <Target size={20} />
          For You
        </button>
        <button
          className={`tab ${activeTab === 'trending' ? 'active' : ''}`}
          onClick={() => setActiveTab('trending')}
        >
          <TrendingUp size={20} />
          Trending
        </button>
        <button
          className={`tab ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => setActiveTab('explore')}
        >
          <Filter size={20} />
          Explore by Genre
        </button>
      </div>

      <div className="recommendation-content">
        {activeTab === 'for-you' && (
          <>
            {(!hasPreferences && !hasRatings) ? (
              renderEmptyState()
            ) : (
              <>
                <div className="section-header">
                  <h3>
                    <Target size={24} />
                    Personalized for You
                  </h3>
                  <button 
                    className="refresh-button" 
                    onClick={handleRefreshRecommendations}
                    disabled={loading}
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>
                
                {loading ? (
                  <div className="loading-state">
                    <RefreshCw className="spinning" size={48} />
                    <p>Finding great books for you...</p>
                  </div>
                ) : personalizedRecs.length > 0 ? (
                  renderBookGrid(personalizedRecs, true)
                ) : (
                  <p className="no-results">
                    No recommendations yet. Try rating more books or updating your preferences!
                  </p>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'trending' && (
          <>
            <div className="section-header">
              <h3>
                <TrendingUp size={24} />
                Trending Now
              </h3>
              <button 
                className="refresh-button" 
                onClick={loadTrendingBooks}
                disabled={loading}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
            
            {loading ? (
              <div className="loading-state">
                <RefreshCw className="spinning" size={48} />
                <p>Loading trending books...</p>
              </div>
            ) : trendingBooks.length > 0 ? (
              renderBookGrid(trendingBooks)
            ) : (
              <p className="no-results">No trending books found. Check back later!</p>
            )}
          </>
        )}

        {activeTab === 'explore' && (
          <>
            <div className="section-header">
              <h3>
                <Filter size={24} />
                Explore by Genre
              </h3>
            </div>
            
            {renderGenreFilter()}
            
            {selectedGenres.length > 0 && (
              <>
                {genreLoading ? (
                  <div className="loading-state">
                    <RefreshCw className="spinning" size={48} />
                    <p>Loading {selectedGenres.join(', ')} books...</p>
                  </div>
                ) : genreRecs.length > 0 ? (
                  renderBookGrid(genreRecs, true)
                ) : (
                  <p className="no-results">
                    No books found for selected genres. Try different genres!
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Recommendations;