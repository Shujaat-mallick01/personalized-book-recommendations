import { useState, useEffect } from 'react';
import { useBooks } from '../../contexts/BookContext';
import BookCoverUpload from '../BookCoverUpload';
import Rating from '../Rating';
import { 
  X, 
  Calendar, 
  FileText, 
  Star, 
  Plus, 
  Check, 
  ExternalLink,
  ChevronDown,
  BookOpen,
  User,
  Hash
} from 'lucide-react';
import './BookModal.css';

const BookModal = ({ book, isOpen, onClose }) => {
  const { addToReadingList, removeFromReadingList, readingList, rateBook, ratings, updateReadingStatus } = useBooks();
  const [readingStatus, setReadingStatus] = useState('want-to-read');
  const [review, setReview] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  const isInReadingList = readingList.some(b => b.id === book.id);
  const userRating = ratings[book.id] || 0;
  const bookInList = readingList.find(b => b.id === book.id);

  useEffect(() => {
    if (bookInList) {
      setReadingStatus(bookInList.readingStatus || 'want-to-read');
      setReview(bookInList.review || '');
    }
  }, [bookInList]);

  const statusOptions = [
    { value: 'want-to-read', label: 'Want to Read', icon: BookOpen, color: '#ffc107' },
    { value: 'currently-reading', label: 'Currently Reading', icon: BookOpen, color: '#28a745' },
    { value: 'finished', label: 'Finished', icon: Check, color: '#007bff' }
  ];

  const currentStatus = statusOptions.find(s => s.value === readingStatus);

  const handleToggleReadingList = () => {
    if (isInReadingList) {
      removeFromReadingList(book.id);
    } else {
      addToReadingList({
        ...book,
        readingStatus,
        review,
        dateAdded: new Date().toISOString()
      });
    }
  };

  const handleStatusChange = (status) => {
    setReadingStatus(status);
    setShowStatusDropdown(false);
    if (isInReadingList) {
      updateReadingStatus(book.id, status);
    }
  };

  const handleReviewSubmit = () => {
    if (isInReadingList) {
      // You can add a updateBookReview method to BookContext
      console.log('Review updated:', review);
    }
  };

  const handleRate = (rating) => {
    rateBook(book.id, rating);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="book-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-content">
          <div className="modal-left">
            <div className="book-cover">
              {book.thumbnail ? (
                <img src={book.thumbnail} alt={book.title} />
              ) : (
                <div className="no-cover">
                  <BookOpen size={64} />
                </div>
              )}
            </div>

            <div className="reading-controls">
              <div className="status-section">
                <label>Reading Status:</label>
                <div className="status-dropdown">
                  <button 
                    className="status-button"
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    style={{ backgroundColor: currentStatus.color }}
                  >
                    <currentStatus.icon size={16} />
                    {currentStatus.label}
                    <ChevronDown size={16} />
                  </button>
                  
                  {showStatusDropdown && (
                    <div className="status-options">
                      {statusOptions.map((status) => (
                        <button
                          key={status.value}
                          onClick={() => handleStatusChange(status.value)}
                          className="status-option"
                        >
                          <status.icon size={16} />
                          {status.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button 
                className={`library-button ${isInReadingList ? 'in-library' : 'add-library'}`}
                onClick={handleToggleReadingList}
              >
                {isInReadingList ? <Check size={16} /> : <Plus size={16} />}
                {isInReadingList ? 'In Your Library' : 'Add to Library'}
              </button>

              <div className="rating-section">
                <label>Your Rating:</label>
                <Rating 
                  bookId={book.id}
                  currentRating={userRating}
                  onRate={handleRate}
                  size="large"
                />
              </div>
            </div>
          </div>

          <div className="modal-right">
            <div className="book-header">
              <h2>{book.title}</h2>
              <p className="book-author">
                <User size={16} />
                by {book.authors.join(', ')}
              </p>
            </div>

            <div className="book-metadata-detailed">
              {book.publishedDate && (
                <div className="metadata-row">
                  <Calendar size={16} />
                  <span>Published: {book.publishedDate.substring(0, 4)}</span>
                </div>
              )}
              {book.pageCount > 0 && (
                <div className="metadata-row">
                  <FileText size={16} />
                  <span>Pages: {book.pageCount}</span>
                </div>
              )}
              {book.averageRating > 0 && (
                <div className="metadata-row">
                  <Star size={16} />
                  <span>Average Rating: {book.averageRating.toFixed(1)}</span>
                </div>
              )}
              {book.isbn && (
                <div className="metadata-row">
                  <Hash size={16} />
                  <span>ISBN: {book.isbn}</span>
                </div>
              )}
            </div>

            {book.categories && book.categories.length > 0 && (
              <div className="categories-section">
                <h4>Categories:</h4>
                <div className="categories-list">
                  {book.categories.map((category, index) => (
                    <span key={index} className="category-badge">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="description-section">
              <h4>Description:</h4>
              <p className="full-description">
                {book.description ? 
                  book.description.replace(/<[^>]*>/g, '') : 
                  'No description available for this book.'
                }
              </p>
            </div>

            <div className="review-section">
              <h4>Your Thoughts:</h4>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Add your thoughts about this book..."
                className="review-textarea"
                rows={4}
              />
              {review && (
                <button 
                  className="save-review-button"
                  onClick={handleReviewSubmit}
                >
                  Save Review
                </button>
              )}
            </div>

            {book.previewLink && (
              <div className="external-links">
                <a 
                  href={book.previewLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  <ExternalLink size={16} />
                  View on Google Books
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    
  );
  {/* Add this after the book cover section */}
};

export default BookModal;