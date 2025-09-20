import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './styles/global.scss';
import LoadingScreen from './components/LoadingScreen';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import PostDetail from './pages/PostDetail';
import UserProfile from './pages/UserProfile';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [serverStatus, setServerStatus] = useState('checking'); // checking, online, offline

  useEffect(() => {
    checkServerAndInitialize();
  }, []);

  const checkServerAndInitialize = async () => {
    try {
      // Check if server is awake
      setServerStatus('checking');
      
      // Ping server with extended timeout
      const response = await axios.get('/api/health', { 
        timeout: 45000 // 45 seconds timeout
      });
      
      console.log('Server is awake:', response.status);
      setServerStatus('online');
      
      // Check authentication after server is ready
      setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
          setIsLoggedIn(true);
        }
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Server connection failed:', error);
      setServerStatus('offline');
      
      // Still try to initialize after some time
      setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
          setIsLoggedIn(true);
        }
        setIsLoading(false);
      }, 3000);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const retryConnection = () => {
    setIsLoading(true);
    checkServerAndInitialize();
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          border: '4px solid #e3e3e3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        
        <h2 style={{ 
          marginBottom: '10px', 
          color: '#333',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Mitt Arv Blog Platform
        </h2>
        
        {serverStatus === 'checking' && (
          <>
            <p style={{ color: '#666', marginBottom: '5px', fontSize: '16px' }}>
              Connecting to server...
            </p>
            <small style={{ color: '#999', fontSize: '14px' }}>
              First time may take up to 60 seconds (server is starting up)
            </small>
          </>
        )}
        
        {serverStatus === 'offline' && (
          <>
            <p style={{ color: '#dc3545', marginBottom: '10px', fontSize: '16px' }}>
              Server is taking longer than expected...
            </p>
            <button 
              onClick={retryConnection}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Retry Connection
            </button>
          </>
        )}
        
        {serverStatus === 'online' && (
          <p style={{ color: '#28a745', fontSize: '16px' }}>
            Server connected! Loading application...
          </p>
        )}
        
        {/* Add CSS animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="App">
        <Header onLogout={handleLogout} onPostCreated={handlePostCreated} />
        <Routes>
          <Route path="/" element={<HomePage refreshTrigger={refreshTrigger} />} />
          <Route path="/post/:postId" element={<PostDetail />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
