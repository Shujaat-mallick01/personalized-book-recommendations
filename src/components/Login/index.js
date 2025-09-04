import  { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { error } = useAuth();

  useEffect(() => {
    const renderGoogleButton = () => {
      if (window.google) {
        const buttonDiv = document.getElementById('google-signin-button');
        if (buttonDiv && !buttonDiv.hasChildNodes()) {
          window.google.accounts.id.renderButton(buttonDiv, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: '280'
          });
        }
      }
    };

    if (window.google) {
      setTimeout(renderGoogleButton, 100);
    } else {
      const checkForGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkForGoogle);
          setTimeout(renderGoogleButton, 100);
        }
      }, 100);
      
      setTimeout(() => clearInterval(checkForGoogle), 5000);
    }
  }, []);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="app-logo">
            <BookOpen size={48} />
          </div>
          <h1>BookRecommender</h1>
          <p>Your personalized book discovery app</p>
        </div>

        <div className="login-content">
          <h2>Welcome!</h2>
          <p>Sign in to access your personalized book recommendations</p>

          {error && (
            <div className="error-message">
              <span>⚠️ {error}</span>
            </div>
          )}

          <div className="signin-section">
            <div id="google-signin-button"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;