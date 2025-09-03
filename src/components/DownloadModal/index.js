import React from 'react';
import { Download, ExternalLink, BookOpen, X, ShoppingCart } from 'lucide-react';
import './DownloadModal.css';

const DownloadModal = ({ isOpen, onClose, book }) => {
  if (!isOpen || !book) return null;

  const handleDownloadClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="download-modal-overlay" onClick={onClose}>
      <div className="download-modal" onClick={e => e.stopPropagation()}>
        <div className="download-header">
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
          <h2>
            <Download size={24} />
            Get "{book.title}"
          </h2>
          <p>Choose from legal sources to purchase or borrow this book</p>
        </div>

        <div className="download-options">
          <div className="option-section">
            <h3>Purchase Options</h3>
            <div className="options-grid">
              <button
                className="download-option"
                onClick={() => handleDownloadClick(`https://www.amazon.com/s?k=${encodeURIComponent(book.title + ' ' + book.authors.join(' '))}`)}
                style={{ borderColor: '#ff9900' }}
              >
                <ShoppingCart size={20} style={{ color: '#ff9900' }} />
                <span>Amazon Kindle</span>
                <ExternalLink size={16} />
              </button>

              <button
                className="download-option"
                onClick={() => handleDownloadClick(book.saleInfo?.buyLink || `https://play.google.com/store/search?q=${encodeURIComponent(book.title)}`)}
                style={{ borderColor: '#4285f4' }}
              >
                <ShoppingCart size={20} style={{ color: '#4285f4' }} />
                <span>Google Play Books</span>
                <ExternalLink size={16} />
              </button>

              <button
                className="download-option"
                onClick={() => handleDownloadClick(`https://books.apple.com/search?term=${encodeURIComponent(book.title)}`)}
                style={{ borderColor: '#000000' }}
              >
                <ShoppingCart size={20} style={{ color: '#000000' }} />
                <span>Apple Books</span>
                <ExternalLink size={16} />
              </button>

              <button
                className="download-option"
                onClick={() => handleDownloadClick(`https://bookshop.org/search?keywords=${encodeURIComponent(book.title)}`)}
                style={{ borderColor: '#2f7bb8' }}
              >
                <ShoppingCart size={20} style={{ color: '#2f7bb8' }} />
                <span>Bookshop.org</span>
                <ExternalLink size={16} />
              </button>
            </div>
          </div>

          <div className="option-section">
            <h3>Library & Free Options</h3>
            <div className="options-grid">
              <button
                className="download-option"
                onClick={() => handleDownloadClick(`https://www.worldcat.org/search?q=${encodeURIComponent(book.title)}`)}
                style={{ borderColor: '#28a745' }}
              >
                <BookOpen size={20} style={{ color: '#28a745' }} />
                <span>WorldCat (Find in Library)</span>
                <ExternalLink size={16} />
              </button>

              <button
                className="download-option"
                onClick={() => handleDownloadClick(`https://openlibrary.org/search?q=${encodeURIComponent(book.title)}`)}
                style={{ borderColor: '#326c87' }}
              >
                <BookOpen size={20} style={{ color: '#326c87' }} />
                <span>Open Library</span>
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="download-footer">
          <p>
            <strong>Legal Notice:</strong> We only provide links to legitimate retailers 
            and libraries. All purchases support authors and publishers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;