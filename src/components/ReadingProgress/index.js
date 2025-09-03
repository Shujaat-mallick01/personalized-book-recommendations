import React, { useState } from 'react';
import './ReadingProgress.css';

const ReadingProgress = ({ book, onUpdateProgress }) => {
  const [currentPage, setCurrentPage] = useState(book.currentPage || 0);
  const [progressPercent, setProgressPercent] = useState(book.progressPercent || 0);
  const [readingGoal, setReadingGoal] = useState(book.dailyGoal || 20);
  const [showProgress, setShowProgress] = useState(false);

  const totalPages = book.pageCount || 0;

  const handlePageUpdate = (pages) => {
    const newCurrentPage = Math.max(0, Math.min(pages, totalPages));
    const newProgressPercent = totalPages > 0 ? (newCurrentPage / totalPages) * 100 : 0;
    
    setCurrentPage(newCurrentPage);
    setProgressPercent(newProgressPercent);
    
    onUpdateProgress({
      currentPage: newCurrentPage,
      progressPercent: newProgressPercent,
      lastUpdated: new Date().toISOString()
    });
  };

  const handlePercentUpdate = (percent) => {
    const newPercent = Math.max(0, Math.min(percent, 100));
    const newCurrentPage = totalPages > 0 ? Math.round((newPercent / 100) * totalPages) : 0;
    
    setProgressPercent(newPercent);
    setCurrentPage(newCurrentPage);
    
    onUpdateProgress({
      currentPage: newCurrentPage,
      progressPercent: newPercent,
      lastUpdated: new Date().toISOString()
    });
  };

  const getProgressColor = (percent) => {
    if (percent >= 100) return '#28a745';
    if (percent >= 75) return '#17a2b8';
    if (percent >= 50) return '#ffc107';
    if (percent >= 25) return '#fd7e14';
    return '#dc3545';
  };

  const getPagesLeft = () => totalPages - currentPage;
  const getDaysToFinish = () => {
    const pagesLeft = getPagesLeft();
    return readingGoal > 0 ? Math.ceil(pagesLeft / readingGoal) : '∞';
  };

  if (!showProgress) {
    return (
      <button 
        className="show-progress-button"
        onClick={() => setShowProgress(true)}
      >
        📊 Track Reading Progress
      </button>
    );
  }

  return (
    <div className="reading-progress">
      <div className="progress-header">
        <h4>📖 Reading Progress</h4>
        <button 
          className="hide-progress"
          onClick={() => setShowProgress(false)}
        >
          ✕
        </button>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${progressPercent}%`,
              backgroundColor: getProgressColor(progressPercent)
            }}
          />
        </div>
        <span className="progress-text">
          {progressPercent.toFixed(1)}% complete
        </span>
      </div>

      <div className="progress-inputs">
        <div className="input-group">
          <label>Current Page:</label>
          <div className="page-input-container">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => handlePageUpdate(parseInt(e.target.value) || 0)}
              min="0"
              max={totalPages}
            />
            <span className="total-pages">/ {totalPages}</span>
          </div>
        </div>

        <div className="input-group">
          <label>Progress %:</label>
          <input
            type="number"
            value={Math.round(progressPercent)}
            onChange={(e) => handlePercentUpdate(parseInt(e.target.value) || 0)}
            min="0"
            max="100"
          />
        </div>
      </div>

      <div className="progress-stats">
        <div className="stat-item">
          <span className="stat-label">Pages Left:</span>
          <span className="stat-value">{getPagesLeft()}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Daily Goal:</span>
          <input
            type="number"
            value={readingGoal}
            onChange={(e) => setReadingGoal(parseInt(e.target.value) || 20)}
            min="1"
            className="goal-input"
          />
          <span>pages/day</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Days to Finish:</span>
          <span className="stat-value">{getDaysToFinish()}</span>
        </div>
      </div>

      <div className="quick-actions">
        <button 
          onClick={() => handlePageUpdate(currentPage + 10)}
          className="quick-button"
        >
          +10 pages
        </button>
        <button 
          onClick={() => handlePageUpdate(currentPage + 25)}
          className="quick-button"
        >
          +25 pages
        </button>
        <button 
          onClick={() => handlePercentUpdate(100)}
          className="quick-button finish-button"
        >
          📚 Mark as Finished
        </button>
      </div>
    </div>
  );
};

export default ReadingProgress;