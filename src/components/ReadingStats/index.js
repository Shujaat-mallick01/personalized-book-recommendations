import React from 'react';
import { useBooks } from '../../contexts/BookContext';
import { Clock, Calendar, Target, BookOpen, Star, TrendingUp } from 'lucide-react';
import { calculateReadingTime } from '../../utils/helpers';
import './ReadingStats.css';

const ReadingStats = () => {
  const { readingList, ratings } = useBooks();

  const calculateStats = () => {
    const totalBooks = readingList.length;
    const ratedBooks = Object.keys(ratings).length;
    const finishedBooks = readingList.filter(book => book.readingStatus === 'finished').length;
    const currentlyReading = readingList.filter(book => book.readingStatus === 'currently-reading').length;
    
    const totalPages = readingList
      .filter(book => book.pageCount > 0)
      .reduce((sum, book) => sum + book.pageCount, 0);
    
    const estimatedReadingTime = calculateReadingTime(totalPages);
    
    const genreCount = {};
    readingList.forEach(book => {
      if (book.categories) {
        book.categories.forEach(category => {
          genreCount[category] = (genreCount[category] || 0) + 1;
        });
      }
    });
    
    const favoriteGenre = Object.entries(genreCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None yet';

    const averageRating = ratedBooks > 0 
      ? (Object.values(ratings).reduce((sum, rating) => sum + rating, 0) / ratedBooks).toFixed(1)
      : 0;

    return {
      totalBooks,
      ratedBooks,
      finishedBooks,
      currentlyReading,
      totalPages,
      estimatedReadingTime,
      favoriteGenre,
      averageRating
    };
  };

  const stats = calculateStats();

  return (
    <div className="reading-stats">
      <h3>
        <TrendingUp size={24} />
        Your Reading Statistics
      </h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <BookOpen size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.totalBooks}</span>
            <span className="stat-label">Total Books</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Star size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.averageRating}/5</span>
            <span className="stat-label">Avg Rating</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Target size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.finishedBooks}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.totalPages.toLocaleString()}</span>
            <span className="stat-label">Pages Read</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.estimatedReadingTime}</span>
            <span className="stat-label">Reading Time</span>
          </div>
        </div>

        <div className="stat-card wide">
          <div className="stat-icon">
            <BookOpen size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.favoriteGenre}</span>
            <span className="stat-label">Favorite Genre</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingStats;