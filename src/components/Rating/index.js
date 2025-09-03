import React, { useState } from 'react';
import { Star } from 'lucide-react';
import './Rating.css';

const Rating = ({ bookId, currentRating = 0, onRate, size = 'medium' }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isRating, setIsRating] = useState(false);

  const handleClick = (rating) => {
    setIsRating(true);
    onRate(rating);
    setTimeout(() => setIsRating(false), 300);
  };

  const handleMouseEnter = (rating) => {
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const getStarClass = (starIndex) => {
    const rating = hoverRating || currentRating;
    return starIndex <= rating ? 'star filled' : 'star';
  };

  const getStarSize = () => {
    switch (size) {
      case 'small': return 14;
      case 'large': return 24;
      default: return 18;
    }
  };

  return (
    <div className={`rating-container ${size} ${isRating ? 'animating' : ''}`}>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((starIndex) => (
          <button
            key={starIndex}
            type="button"
            className={getStarClass(starIndex)}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onMouseLeave={handleMouseLeave}
            aria-label={`Rate ${starIndex} stars`}
          >
            <Star size={getStarSize()} fill={starIndex <= (hoverRating || currentRating) ? '#ffc107' : 'none'} />
          </button>
        ))}
      </div>
      {currentRating > 0 && (
        <span className="rating-text">
          {currentRating}/5
        </span>
      )}
    </div>
  );
};

export default Rating;