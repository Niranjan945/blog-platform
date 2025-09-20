import React from 'react';
import './LoadingScreen.scss';

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="logo-container">
          <span className="logo-text">BloGo</span>
          <span className="logo-subtitle">blogs</span>
        </div>
        <div className="loading-spinner"></div>
        <p className="loading-message">Loading your stories...</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
