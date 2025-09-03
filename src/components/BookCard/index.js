import React, { useState } from 'react';
import { useBooks } from '../../contexts/BookContext';
import { useUser } from '../../contexts/UserContext';
import Rating from '../Rating';
import BookModal from '../BookModal';
import PremiumModal from '../PremiumModal';
import DownloadModal from '../DownloadModal';
import { 
  Calendar, 
  FileText, 
  Star, 
  Plus, 
  Check, 
  Eye, 
  BookOpen,
  Clock,
  Download,
  Crown
} from 'lucide-react';
import { calculateReadingTime, getReadingDifficulty, getBookImage } from '../../utils/helpers';
import './BookCard.css';

const BookCard = ({ book, showAddToList = true, showRating = true }) => {
  const { addToReadingList, removeFromReadingList, readingList, rateBook, ratings } = useBooks();
  const { isPremium, upgradeToPremium } = useUser(); // FIXED: Move useUser to top level
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  
  const isInReadingList = readingList.some(b => b.id === book.id);
  const userRating = ratings[book.id] || 0;
  const bookInList = readingList.find(b => b.id === book.id);
  const bookImage = getBookImage(book);

  const readingTime = calculateReadingTime(book.pageCount);
  const difficulty = getReadingDifficulty(book.pageCount);

  const handleToggleReadingList = (e) => {
    e.stopPropagation();
    if (isInReadingList) {
      removeFromReadingList(book.id);
    } else {
      addToReadingList(book);
    }
  };

  const handleRate = (rating) => {
    rateBook(book.id, rating);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (isPremium) {
      setIsDownloadModalOpen(true);
    } else {
      setIsPremiumModalOpen(true);
    }
  };

  // FIXED: Remove useUser call from inside this function
  const handlePremiumUpgrade = () => {
    if (typeof upgradeToPremium === 'function') {
      upgradeToPremium();
      setIsPremiumModalOpen(false);
      setIsDownloadModalOpen(true);
    }
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return 'No description available';
    const cleanText = text.replace(/<[^>]*>/g, '');
    return cleanText.length > maxLength ? cleanText.substring(0, maxLength) + '...' : cleanText;
  };

  const getReadingStatusBadge = () => {
    if (!bookInList) return null;
    
    const status = bookInList.readingStatus || 'want-to-read';
    const statusConfig = {
      'want-to-read': { label: 'Want to Read', color: '#ffc107', icon: BookOpen },
      'currently-reading': { label: 'Reading', color: '#28a745', icon: BookOpen },
      'finished': { label: 'Finished', color: '#007bff', icon: Check }
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;
    
    return (
      <div 
        className="reading-status-badge"
        style={{ backgroundColor: config.color }}
      >
        <IconComponent size={12} />
        {config.label}
      </div>
    );
  };

  return (
    <>
      <div className="book-card" onClick={() => setIsModalOpen(true)}>
        <div className="book-image">
          {bookImage ? (
            <img src={bookImage} alt={book.title} />
          ) : (
            <div className="no-image">
              <BookOpen size={48} />
            </div>
          )}
          {getReadingStatusBadge()}
          {book.recommendationReason && (
            <div className="recommendation-reason">
              {book.recommendationReason}
            </div>
          )}
        </div>
        
        <div className="book-info">
          <h4 className="book-title">{book.title}</h4>
          <p className="book-author">by {book.authors.join(', ')}</p>
          
          <div className="book-metadata">
            {book.publishedDate && (
              <span className="metadata-item">
                <Calendar size={14} />
                {book.publishedDate.substring(0, 4)}
              </span>
            )}
            {book.pageCount > 0 && (
              <span className="metadata-item">
                <FileText size={14} />
                {book.pageCount} pages
              </span>
            )}
            {book.averageRating > 0 && (
              <span className="metadata-item">
                <Star size={14} />
                {book.averageRating.toFixed(1)}
              </span>
            )}
            {book.pageCount > 0 && (
              <>
                <span className="metadata-item">
                  <Clock size={14} />
                  {readingTime}
                </span>
                <span 
                  className="metadata-item difficulty-badge"
                  style={{ backgroundColor: difficulty.color }}
                >
                  {difficulty.level}
                </span>
              </>
            )}
          </div>

          <p className="book-description">
            {truncateText(book.description)}
          </p>

          {book.categories && book.categories.length > 0 && (
            <div className="book-categories">
              {book.categories.slice(0, 2).map((category, index) => (
                <span key={index} className="category-tag">
                  {category}
                </span>
              ))}
            </div>
          )}

          <div className="book-actions">
            {showRating && (
              <Rating 
                bookId={book.id}
                currentRating={userRating}
                onRate={handleRate}
              />
            )}
            
            {showAddToList && (
              <button 
                className={`action-button primary ${isInReadingList ? 'in-list' : 'add'}`}
                onClick={handleToggleReadingList}
              >
                {isInReadingList ? <Check size={16} /> : <Plus size={16} />}
                <span>{isInReadingList ? 'In Reading List' : 'Add to Reading List'}</span>
              </button>
            )}

            <button 
              className={`action-button download ${isPremium ? 'premium' : 'upgrade'}`}
              onClick={handleDownload}
            >
              {isPremium ? <Download size={16} /> : <Crown size={16} />}
              <span>{isPremium ? 'Get Book' : 'Get Book (Premium)'}</span>
            </button>

            <button 
              className="action-button secondary"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
            >
              <Eye size={16} />
              <span>View Details</span>
            </button>
          </div>
        </div>
      </div>

      <BookModal 
        book={book}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        onUpgrade={handlePremiumUpgrade}
        bookTitle={book.title}
      />

      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        book={book}
      />
    </>
  );
};

export default BookCard;