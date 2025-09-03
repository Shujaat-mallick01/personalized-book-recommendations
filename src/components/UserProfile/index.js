import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { GENRE_OPTIONS } from '../../utils/helpers';
import { BookOpen, PenTool, Plus, X, Target } from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
  const { preferences, updatePreferences } = useUser();
  const [selectedGenres, setSelectedGenres] = useState(preferences.genres || []);
  const [favoriteAuthors, setFavoriteAuthors] = useState(preferences.authors || []);
  const [authorInput, setAuthorInput] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const handleGenreToggle = (genre) => {
    const newGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];
    
    setSelectedGenres(newGenres);
    setHasChanges(true);
  };

  const handleAddAuthor = (e) => {
    e.preventDefault();
    if (authorInput.trim() && !favoriteAuthors.includes(authorInput.trim())) {
      const newAuthors = [...favoriteAuthors, authorInput.trim()];
      setFavoriteAuthors(newAuthors);
      setAuthorInput('');
      setHasChanges(true);
    }
  };

  const handleRemoveAuthor = (author) => {
    const newAuthors = favoriteAuthors.filter(a => a !== author);
    setFavoriteAuthors(newAuthors);
    setHasChanges(true);
  };

  const handleSave = () => {
    updatePreferences({
      ...preferences,
      genres: selectedGenres,
      authors: favoriteAuthors
    });
    setHasChanges(false);
  };

  return (
    <div className="user-profile-setup">
      <div className="preference-section">
        <h3>
          <BookOpen size={24} />
          Favorite Genres
        </h3>
        <p>Select genres you enjoy reading (choose 3-5 for best results)</p>
        <div className="genres-grid">
          {GENRE_OPTIONS.map((genre) => (
            <button
              key={genre}
              type="button"
              className={`genre-tag ${selectedGenres.includes(genre) ? 'selected' : ''}`}
              onClick={() => handleGenreToggle(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
        <div className="genre-counter">
          {selectedGenres.length} genres selected
        </div>
      </div>

      <div className="preference-section">
        <h3>
          <PenTool size={24} />
          Favorite Authors
        </h3>
        <p>Add authors you enjoy reading</p>
        <form onSubmit={handleAddAuthor} className="author-input-form">
          <input
            type="text"
            value={authorInput}
            onChange={(e) => setAuthorInput(e.target.value)}
            placeholder="Enter author name..."
            className="author-input"
          />
          <button type="submit" className="add-author-button">
            <Plus size={16} />
            Add
          </button>
        </form>
        
        <div className="authors-list">
          {favoriteAuthors.map((author) => (
            <span key={author} className="author-tag">
              {author}
              <button
                type="button"
                onClick={() => handleRemoveAuthor(author)}
                className="remove-author"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {hasChanges && (
        <div className="save-section">
          <button onClick={handleSave} className="save-preferences-button">
            <Target size={16} />
            Save Preferences
          </button>
        </div>
      )}

      {selectedGenres.length === 0 && favoriteAuthors.length === 0 && (
        <div className="empty-preferences">
          <Target size={48} />
          <h4>Get Started!</h4>
          <p>Select some genres and authors to get personalized book recommendations.</p>
        </div>
      )}
    </div>
  );
};

export default UserProfile;