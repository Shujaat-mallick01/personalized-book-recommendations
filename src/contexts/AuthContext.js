import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleCredentialResponse = (response) => {
    try {
      const userInfo = parseJwt(response.credential);
      const userData = {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name,
        isSetup: true,
        loginTime: new Date().toISOString()
      };

      setUser(userData);
      setIsAuthenticated(true);
      setError(null);
      
      localStorage.setItem('bookApp_user', JSON.stringify(userData));
      localStorage.setItem('bookApp_isAuthenticated', 'true');

    } catch (error) {
      console.error('Error processing Google sign-in:', error);
      setError('Failed to process Google sign-in');
    }
  };

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  };

  const signOut = () => {
    console.log('SignOut function called');
    
    // Clear all authentication data
    localStorage.clear();
    sessionStorage.clear();
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    
    // Disable Google auto-select
    if (window.google) {
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch (error) {
        console.log('Google disableAutoSelect error:', error);
      }
    }
    
    // Force page reload to ensure clean state
    setTimeout(() => {
      window.location.replace('/');
    }, 100);
  };

  useEffect(() => {
    const initializeGoogleAuth = () => {
      if (window.google && process.env.REACT_APP_GOOGLE_CLIENT_ID) {
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: false,
          });
          
          // Check authentication state
          const savedUser = localStorage.getItem('bookApp_user');
          const savedAuth = localStorage.getItem('bookApp_isAuthenticated');
          
          if (savedUser && savedAuth === 'true') {
            try {
              const userData = JSON.parse(savedUser);
              setUser(userData);
              setIsAuthenticated(true);
            } catch (error) {
              localStorage.clear();
              setUser(null);
              setIsAuthenticated(false);
            }
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          setError('Failed to initialize Google authentication');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setTimeout(initializeGoogleAuth, 100);
      script.onerror = () => {
        setError('Failed to load Google authentication');
        setLoading(false);
      };
      document.head.appendChild(script);
    } else {
      initializeGoogleAuth();
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    signOut,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};