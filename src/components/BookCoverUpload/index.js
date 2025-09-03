import React, { useState } from 'react';
import { Upload, Image, X } from 'lucide-react';
import { saveCustomBookCover, removeCustomBookCover, hasCustomCover } from '../../utils/helpers';
import './BookCoverUpload.css';

const BookCoverUpload = ({ book, onCoverUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [hasCustom, setHasCustom] = useState(hasCustomCover(book.id));

  React.useEffect(() => {
    setHasCustom(hasCustomCover(book.id));
  }, [book.id]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      setPreview(imageUrl);
      
      const success = saveCustomBookCover(book.id, imageUrl);
      if (success) {
        setHasCustom(true);
        if (onCoverUpdate) {
          onCoverUpdate(book.id, imageUrl);
        }
      }
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const removeCover = () => {
    const success = removeCustomBookCover(book.id);
    if (success) {
      setPreview(null);
      setHasCustom(false);
      if (onCoverUpdate) {
        onCoverUpdate(book.id, null);
      }
    }
  };

  return (
    <div className="book-cover-upload">
      <div className="upload-area">
        {preview || hasCustom ? (
          <div className="preview-container">
            <img 
              src={preview || (hasCustom ? JSON.parse(localStorage.getItem('customBookCovers') || '{}')[book.id] : null)} 
              alt="Cover preview" 
              className="cover-preview" 
            />
            <button className="remove-cover" onClick={removeCover}>
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="upload-label">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="upload-input"
              disabled={isUploading}
            />
            <div className="upload-content">
              <Upload size={32} />
              <span>{isUploading ? 'Uploading...' : 'Upload Cover Image'}</span>
              <small>JPG, PNG up to 5MB</small>
            </div>
          </label>
        )}
      </div>
    </div>
  );
};

export default BookCoverUpload;