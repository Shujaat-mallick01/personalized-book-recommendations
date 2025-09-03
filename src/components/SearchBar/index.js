import React, { useState } from 'react';
import { useBooks } from '../../contexts/BookContext';
import { searchBooks } from '../../services/bookAPI';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const { setSearchResults, setLoading, setError } = useBooks();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const results = await searchBooks(query, 24);
      setSearchResults(results);
      
      setTimeout(() => {
        const resultsSection = document.querySelector('.search-results');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
    } catch (error) {
      setError('Failed to search books. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearchResults([]);
  };

  return (
    <div className="search-bar-container">
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for books, authors, or genres..."
          className="search-input"
        />
        {query && (
          <button 
            type="button" 
            onClick={handleClear}
            className="clear-button"
          >
            <X size={16} />
          </button>
        )}
        <button type="submit" className="search-button">
          <Search size={16} />
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;