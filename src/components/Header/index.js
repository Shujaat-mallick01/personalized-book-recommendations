import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBooks } from '../../contexts/BookContext';
import { 
  Home, 
  Sparkles, 
  User, 
  BookOpen, 
  Star, 
  Settings, 
  LogOut, 
  ChevronDown 
} from 'lucide-react';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const { getBookStats } = useBooks();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showUserMenu]);

  if (!isAuthenticated) {
    return null;
  }

  const stats = getBookStats();

  const handleSignOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUserMenu(false);
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
  };

  return (
    <header className="app-header">
      <nav className="main-nav">
        <Link to="/" className="logo-link">
          <div className="logo">
            <BookOpen className="logo-icon" />
            <span className="logo-text">BookRecommender</span>
          </div>
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <Home size={18} />
            Home
          </Link>
          <Link to="/recommendations" className={`nav-link ${location.pathname === '/recommendations' ? 'active' : ''}`}>
            <Sparkles size={18} />
            Recommendations
          </Link>
          <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
            <User size={18} />
            Profile
          </Link>
        </div>

        <div className="user-section" ref={dropdownRef}>
          <div className="quick-stats">
            <span className="stat-item">
              <BookOpen size={14} />
              {stats.totalBooks}
            </span>
            <span className="stat-item">
              <Star size={14} />
              {stats.totalRated}
            </span>
          </div>

          <div className="user-menu" onClick={toggleUserMenu}>
            <img 
              src={user?.picture || '/default-avatar.png'} 
              alt={user?.name || 'User'}
              className="user-avatar"
            />
            <span className="user-name">{user?.given_name || 'User'}</span>
            <ChevronDown className="menu-arrow" size={14} />
          </div>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <img src={user?.picture} alt={user?.name} className="dropdown-avatar" />
                <div className="dropdown-user-info">
                  <div className="dropdown-name">{user?.name}</div>
                  <div className="dropdown-email">{user?.email}</div>
                </div>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <Link 
                to="/profile" 
                className="dropdown-item" 
                onClick={() => setShowUserMenu(false)}
              >
                <Settings size={18} />
                Profile Settings
              </Link>
              
              <div className="dropdown-divider"></div>
              
              <button
                onClick={handleSignOut}
                className="dropdown-item logout-item"
                type="button"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;