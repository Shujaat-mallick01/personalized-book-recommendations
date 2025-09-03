import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { GENRE_OPTIONS } from '../../utils/helpers';
import './BookFilter.css';

const BookFilter = ({ onFilterChange, activeFilters = {} }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleGenreChange = (genre) => {
    onFilterChange({
      ...activeFilters,
      genre: activeFilters.genre === genre ? '' : genre
    });
  };

  const handleRatingChange = (rating) => {
    onFilterChange({
      ...activeFilters,
      minRating: activeFilters.minRating === rating ? 0 : rating
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = activeFilters.genre || activeFilters.minRating > 0;

  return (
    <div className="book-filter">
      <button 
        className="filter-toggle"
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter size={16} />
        Filters
        {hasActiveFilters && <span className="filter-count">!</span>}
      </button>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-section">
            <h4>Genre</h4>
            <div className="genre-options">
              {GENRE_OPTIONS.slice(0, 8).map((genre) => (
                <button
                  key={genre}
                  className={`genre-filter-button ${activeFilters.genre === genre ? 'active' : ''}`}
                  onClick={() => handleGenreChange(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Minimum Rating</h4>
            <div className="rating-options">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  className={`rating-filter-button ${activeFilters.minRating === rating ? 'active' : ''}`}
                  onClick={() => handleRatingChange(rating)}
                >
                  {rating}+ Stars
                </button>
              ))}
            </div>
          </div>

          <button className="clear-filters-button" onClick={clearFilters}>
            <X size={16} />
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default BookFilter;