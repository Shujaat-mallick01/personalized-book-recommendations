import React from 'react';
import { Crown, Check, X } from 'lucide-react';
import './PremiumModal.css';

const PremiumModal = ({ isOpen, onClose, onUpgrade, bookTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="premium-modal-overlay" onClick={onClose}>
      <div className="premium-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="premium-header">
          <Crown size={48} className="crown-icon" />
          <h2>Premium Required</h2>
          <p>To access book downloads, upgrade to BookRecommender Premium</p>
        </div>

        <div className="premium-features">
          <h3>Premium Features Include:</h3>
          <div className="features-list">
            <div className="feature-item">
              <Check size={16} />
              <span>Access to book purchase links</span>
            </div>
            <div className="feature-item">
              <Check size={16} />
              <span>Direct links to legitimate bookstores</span>
            </div>
            <div className="feature-item">
              <Check size={16} />
              <span>Library borrowing integration</span>
            </div>
            <div className="feature-item">
              <Check size={16} />
              <span>Priority customer support</span>
            </div>
            <div className="feature-item">
              <Check size={16} />
              <span>Advanced reading statistics</span>
            </div>
            <div className="feature-item">
              <Check size={16} />
              <span>Unlimited reading lists</span>
            </div>
          </div>
        </div>

        <div className="premium-pricing">
          <div className="price-card">
            <h4>Premium Monthly</h4>
            <div className="price">$9.99<span>/month</span></div>
            <button className="upgrade-button" onClick={onUpgrade}>
              Upgrade Now
            </button>
          </div>
        </div>

        <p className="legal-note">
          We only provide links to legitimate book retailers and libraries. 
          All book purchases support authors and publishers.
        </p>
      </div>
    </div>
  );
};

// CRITICAL: Make sure this is a DEFAULT export
export default PremiumModal;