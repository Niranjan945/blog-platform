import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
      }
    }, 2000);
  }, []);

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

  if (isLoading) {
    return <LoadingScreen />;
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
