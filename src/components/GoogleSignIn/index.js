import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, BookOpen, Star, BarChart3 } from 'lucide-react';
import './GoogleSignIn.css';

const GoogleSignIn = () => {
  const { user, loading } = useAuth();
  const googleButtonRef = useRef(null);

  useEffect(() => {
    if (!user && !loading && window.google && googleButtonRef.current) {
      try {
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'filled_black',
            size: 'large',
            shape: 'rectangular',
            width: 300,
            text: 'signin_with',
            logo_alignment: 'left'
          }
        );
      } catch (error) {
        console.error('Error rendering Google Sign-In button:', error);
      }
    }
  }, [user, loading]);

  if (user || loading) {
    return null;
  }

  return (
    <div className="google-signin">
      <div className="signin-container">
        <h3>Sign In to Get Started</h3>
        <p>Sign in with Google to access personalized book recommendations, create reading lists, and track your reading progress.</p>
        <div ref={googleButtonRef} className="google-signin-button"></div>
        <div className="signin-features">
          <div className="feature">
            <Sparkles size={20} />
            <span>Personalized recommendations</span>
          </div>
          <div className="feature">
            <BookOpen size={20} />
            <span>Reading list management</span>
          </div>
          <div className="feature">
            <Star size={20} />
            <span>Book ratings and reviews</span>
          </div>
          <div className="feature">
            <BarChart3 size={20} />
            <span>Reading statistics</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleSignIn;