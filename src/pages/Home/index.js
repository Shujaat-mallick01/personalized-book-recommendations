import { useState, useEffect } from 'react';
import { useBooks } from '../../contexts/BookContext';
import { useAuth } from '../../contexts/AuthContext';
import SearchBar from '../../components/SearchBar';
import BookCard from '../../components/BookCard';
import GoogleSignIn from '../../components/GoogleSignIn';
import { getPopularBooks, searchBooks } from '../../services/bookAPI';
import { TrendingUp, Search, Filter, BookOpen } from 'lucide-react';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const { 
    searchResults = [], 
    loading, 
    setLoading, 
    setError, 
    error, 
    selectedGenresForHome = [] 
  } = useBooks();
  
  const [popularBooks, setPopularBooks] = useState([]);
  const [genreBooks, setGenreBooks] = useState([]);

  useEffect(() => {
  if (user) {
    if (selectedGenresForHome && selectedGenresForHome.length > 0) {
      loadGenreBasedPopularBooks();
    } else {
      loadPopularBooks();
    }
  }
}, [selectedGenresForHome, user, loadGenreBasedPopularBooks, loadPopularBooks]);


  const loadPopularBooks = async () => {
    try {
      setLoading(true);
      const books = await getPopularBooks(12);
      setPopularBooks(books);
      setGenreBooks([]);
    } catch (error) {
      setError('Failed to load popular books');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadGenreBasedPopularBooks = async () => {
    try {
      setLoading(true);
      let allGenreBooks = [];

      for (const genre of selectedGenresForHome) {
        try {
          const books = await searchBooks(`subject:${genre}`, 6);
          allGenreBooks = [...allGenreBooks, ...books];
        } catch (error) {
          console.error(`Error loading ${genre} books:`, error);
        }
      }

      const uniqueBooks = allGenreBooks
        .filter((book, index, self) => self.findIndex(b => b.id === book.id) === index)
        .sort(() => Math.random() - 0.5)
        .slice(0, 12);

      setGenreBooks(uniqueBooks);
      setPopularBooks([]);
    } catch (error) {
      setError('Failed to load genre books');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getPopularBooksTitle = () => {
    if (selectedGenresForHome && selectedGenresForHome.length > 0) {
      return `${selectedGenresForHome.join(' & ')} Books`;
    }
    return 'Popular Books';
  };

  const getPopularBooksIcon = () => {
    if (selectedGenresForHome && selectedGenresForHome.length > 0) {
      return <Filter className="section-icon" size={24} />;
    }
    return <TrendingUp className="section-icon" size={24} />;
  };

  const booksToShow = (selectedGenresForHome && selectedGenresForHome.length > 0) ? genreBooks : popularBooks;

  // Show only sign-in component if not authenticated
  if (!user) {
    return (
      <div className="home">
        <GoogleSignIn />
      </div>
    );
  }

  // Show full home page if authenticated
  return (
    <div className="home">
      <section className="hero">
        <h2>Discover Your Next Great Read</h2>
        <p>Search for books or explore our recommendations</p>
        <SearchBar />
      </section>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      {searchResults.length > 0 && (
        <section className="search-results">
          <h3>
            <Search className="section-icon" size={24} />
            Search Results ({searchResults.length} found)
          </h3>
          <div className="books-grid">
            {searchResults.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}
      
      <section className="popular-books">
        <div className="section-header">
          <h3>
            {getPopularBooksIcon()}
            {getPopularBooksTitle()}
          </h3>
          {selectedGenresForHome && selectedGenresForHome.length > 0 && (
            <div className="genre-indicator">
              <span>Based on your recommendations preferences</span>
              <button 
                className="clear-genre-filter"
                onClick={() => window.location.href = '/recommendations'}
              >
                Change Genres
              </button>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading amazing books...</p>
          </div>
        ) : booksToShow.length > 0 ? (
          <div className="books-grid">
            {booksToShow.slice(0, 8).map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="no-books-message">
            <BookOpen size={48} />
            <p>No books available</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;