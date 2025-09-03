import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { useBooks } from '../../contexts/BookContext';
import { 
  BookOpen, 
  Home, 
  User, 
  Sparkles, 
  LogOut, 
  Crown 
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user: authUser, signOut } = useAuth(); // Changed from logout to signOut
  const { isPremium } = useUser();
  const { readingList } = useBooks();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(); // Use signOut instead of logout
    // No need to navigate since signOut already redirects
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <BookOpen size={28} />
          <span>BookRecommender</span>
          {isPremium && <Crown size={20} className="premium-crown" />}
        </Link>

        <div className="navbar-nav">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            <Home size={20} />
            <span>Home</span>
          </Link>
          
          {authUser && (
            <>
              <Link 
                to="/recommendations" 
                className={`nav-link ${isActive('/recommendations') ? 'active' : ''}`}
              >
                <Sparkles size={20} />
                <span>Recommendations</span>
              </Link>
              
              <Link 
                to="/profile" 
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              >
                <User size={20} />
                <span>Profile</span>
                {readingList.length > 0 && (
                  <span className="badge">{readingList.length}</span>
                )}
              </Link>
            </>
          )}
        </div>

        <div className="navbar-user">
          {authUser ? (
            <div className="user-menu">
              <div className="user-info">
                <img 
                  src={authUser.picture} 
                  alt={authUser.name}
                  className="user-avatar"
                />
                <span className="user-name">{authUser.name}</span>
                {isPremium && <span className="premium-badge">Premium</span>}
              </div>
              <button className="logout-button" onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <span className="welcome-text">Welcome! Please sign in to get started.</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;