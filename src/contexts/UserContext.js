import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    isSetup: false
  });
  
  const [preferences, setPreferences] = useState({
    genres: [],
    authors: [],
    readingGoal: 12,
    favoriteBooks: []
  });

  // Add premium state
  const [isPremium, setIsPremium] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('bookApp_user');
    const savedPreferences = localStorage.getItem('bookApp_preferences');
    const savedPremium = localStorage.getItem('bookApp_premium');
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedPreferences) setPreferences(JSON.parse(savedPreferences));
    if (savedPremium) setIsPremium(JSON.parse(savedPremium));
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (user.name) {
      localStorage.setItem('bookApp_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('bookApp_preferences', JSON.stringify(preferences));
  }, [preferences]);

  // Save premium status to localStorage
  useEffect(() => {
    localStorage.setItem('bookApp_premium', JSON.stringify(isPremium));
  }, [isPremium]);

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const updatePreferences = (newPreferences) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  };

  // Add premium upgrade function
  const upgradeToPremium = useCallback(() => {
    console.log('Upgrading to premium...');
    setIsPremium(true);
    
    // Show success message
    setTimeout(() => {
      alert('🎉 Congratulations! You are now a Premium user!\n\nYou now have access to:\n• Book purchase links\n• Library integration\n• Advanced statistics\n• Unlimited reading lists');
    }, 100);
  }, []);

  // Add downgrade function (for testing)
  const cancelPremium = useCallback(() => {
    setIsPremium(false);
    alert('Premium subscription cancelled. You can upgrade again anytime!');
  }, []);

  const value = {
    user,
    setUser,
    updateUser,
    preferences,
    setPreferences,
    updatePreferences,
    isPremium,
    upgradeToPremium,
    cancelPremium
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};