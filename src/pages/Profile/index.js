import ReadingStats from '../../components/ReadingStats';
import RandomBookPicker from '../../components/RandomBookPicker';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { useBooks } from '../../contexts/BookContext';
import BookCard from '../../components/BookCard';
import { 
  User, 
  BookOpen, 
  Star, 
  Target, 
  Edit3, 
  Save 
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user: authUser } = useAuth(); // Get authenticated user
  const { user, preferences, updateUser, updatePreferences } = useUser();
  const { readingList, ratings } = useBooks();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    readingGoal: 12
  });

  // Auto-fill form data when component mounts or user changes
  useEffect(() => {
    setFormData({
      name: user?.name || authUser?.name || '',
      email: user?.email || authUser?.email || '',
      readingGoal: preferences?.readingGoal || 12
    });
  }, [user, authUser, preferences]);

  const handleSave = () => {
    updateUser({
      name: formData.name || authUser?.name,
      email: formData.email || authUser?.email,
      isSetup: true
    });
    updatePreferences({
      ...preferences,
      readingGoal: formData.readingGoal
    });
    setIsEditing(false);
  };

  const ratedBooks = readingList.filter(book => ratings[book.id]);
  const displayName = formData.name || authUser?.name || 'Not set';
  const displayEmail = formData.email || authUser?.email || 'Not set';

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2>
          <User size={32} />
          Your Profile
        </h2>
        <div className="tab-navigation">
          <button 
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={activeTab === 'reading-list' ? 'active' : ''}
            onClick={() => setActiveTab('reading-list')}
          >
            Reading List ({readingList.length})
          </button>
          <button 
            className={activeTab === 'ratings' ? 'active' : ''}
            onClick={() => setActiveTab('ratings')}
          >
            My Ratings ({ratedBooks.length})
          </button>
        </div>
      </div>

      {activeTab === 'profile' && (
        <div className="profile-content">
          <div className="profile-card">
            <div className="card-header">
              <h3>Personal Information</h3>
              <button 
                className="edit-button"
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              >
                {isEditing ? <Save size={16} /> : <Edit3 size={16} />}
                {isEditing ? 'Save' : 'Edit'}
              </button>
            </div>
            
            {isEditing ? (
              <div className="form-group">
                <label>
                  Name:
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Your name"
                  />
                </label>
                <label>
                  Email:
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="your.email@example.com"
                  />
                </label>
                <label>
                  Reading Goal (books per year):
                  <input
                    type="number"
                    value={formData.readingGoal}
                    onChange={(e) => setFormData({...formData, readingGoal: parseInt(e.target.value) || 12})}
                    min="1"
                    max="365"
                  />
                </label>
              </div>
            ) : (
              <div className="info-display">
                <div className="info-row">
                  <strong>Name:</strong> 
                  <span className={displayName === 'Not set' ? 'not-set' : ''}>{displayName}</span>
                </div>
                <div className="info-row">
                  <strong>Email:</strong> 
                  <span className={displayEmail === 'Not set' ? 'not-set' : ''}>{displayEmail}</span>
                </div>
                <div className="info-row">
                  <strong>Reading Goal:</strong> 
                  <span>{formData.readingGoal} books per year</span>
                </div>
                
                {authUser && (
                  <div className="google-account-info">
                    <div className="google-user">
                      <img 
                        src={authUser.picture} 
                        alt={authUser.name}
                        className="google-avatar"
                      />
                      <div>
                        <p className="google-name">Signed in as {authUser.name}</p>
                        <p className="google-email">{authUser.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <BookOpen size={24} />
              </div>
              <div className="stat-content">
                <h4>Books in Reading List</h4>
                <span className="stat-number">{readingList.length}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Star size={24} />
              </div>
              <div className="stat-content">
                <h4>Books Rated</h4>
                <span className="stat-number">{ratedBooks.length}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Target size={24} />
              </div>
              <div className="stat-content">
                <h4>Progress to Goal</h4>
                <span className="stat-number">
                  {Math.round((ratedBooks.length / formData.readingGoal) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reading-list' && (
        <div className="reading-list-content">
          <h3>
            <BookOpen size={24} />
            Your Reading List
          </h3>
          {readingList.length > 0 ? (
            <div className="books-grid">
              {readingList.map((book) => (
                <BookCard key={book.id} book={book} showAddToList={false} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <BookOpen size={48} />
              <h4>No books in your reading list yet</h4>
              <p>Start adding books from the home page to build your collection!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ratings' && (
        <div className="ratings-content">
          <h3>
            <Star size={24} />
            Your Rated Books
          </h3>
          {ratedBooks.length > 0 ? (
            <div className="books-grid">
              {ratedBooks.map((book) => (
                <BookCard key={book.id} book={book} showAddToList={false} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Star size={48} />
              <h4>No rated books yet</h4>
              <p>Rate books in your reading list to see them here!</p>
            </div>
          )}
        </div>
        
      )}
    </div>
  );
};

export default Profile;