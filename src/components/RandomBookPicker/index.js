import React, { useState } from 'react';
import { useBooks } from '../../contexts/BookContext';
import BookCard from '../BookCard';
import { Shuffle, RefreshCw } from 'lucide-react';
import './RandomBookPicker.css';

const RandomBookPicker = () => {
  const { readingList } = useBooks();
  const [randomBook, setRandomBook] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const pickRandomBook = () => {
    if (readingList.length === 0) return;
    
    setIsSpinning(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * readingList.length);
      setRandomBook(readingList[randomIndex]);
      setIsSpinning(false);
    }, 500);
  };

  const getUnreadBooks = () => {
    return readingList.filter(book => book.readingStatus !== 'finished');
  };

  const pickUnreadBook = () => {
    const unreadBooks = getUnreadBooks();
    if (unreadBooks.length === 0) return;
    
    setIsSpinning(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * unreadBooks.length);
      setRandomBook(unreadBooks[randomIndex]);
      setIsSpinning(false);
    }, 500);
  };

  if (readingList.length === 0) {
    return (
      <div className="random-picker-empty">
        <Shuffle size={48} />
        <h4>No books to pick from</h4>
        <p>Add some books to your reading list first!</p>
      </div>
    );
  }

  return (
    <div className="random-book-picker">
      <div className="picker-header">
        <h3>
          <Shuffle size={24} />
          Random Book Picker
        </h3>
        <div className="picker-buttons">
          <button 
            className="pick-button"
            onClick={pickRandomBook}
            disabled={isSpinning}
          >
            <RefreshCw size={16} className={isSpinning ? 'spinning' : ''} />
            Pick Any Book
          </button>
          <button 
            className="pick-button unread"
            onClick={pickUnreadBook}
            disabled={isSpinning || getUnreadBooks().length === 0}
          >
            <Shuffle size={16} />
            Pick Unread Book
          </button>
        </div>
      </div>

      {randomBook && (
        <div className="random-book-result">
          <h4>Your random pick:</h4>
          <div className="random-book-card">
            <BookCard book={randomBook} showAddToList={false} />
          </div>
        </div>
      )}

      <div className="picker-stats">
        <span>Total books: {readingList.length}</span>
        <span>Unread: {getUnreadBooks().length}</span>
      </div>
    </div>
  );
};

export default RandomBookPicker;