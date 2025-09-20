import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Header.scss';
import WritePost from './WritePost';
import API_BASE_URL from '../config/api.js';

function Header({ onLogout, onPostCreated }) {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showWritePost, setShowWritePost] = useState(false);
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const dropdownRef = useRef(null);
  const profileButtonRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
    
    // Listen for profile updates to refresh header
    const handleProfileUpdate = (event) => {
      console.log('Profile updated in header:', event.detail);
      setUser(event.detail);
      fetchUserPosts();
    };
    
    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.length > 2) {
      handleSearch();
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/posts/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUserPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`);
      const data = await response.json();
      
      if (response.ok) {
        const filtered = (data.posts || []).filter(post => {
          const titleMatch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
          const contentMatch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
          const tagsMatch = post.tags?.some(tag => 
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          );
          const authorMatch = post.authorName?.toLowerCase().includes(searchQuery.toLowerCase());
          
          return titleMatch || contentMatch || tagsMatch || authorMatch;
        }).slice(0, 5);
        
        setSearchResults(filtered);
        setShowSearchResults(filtered.length > 0);
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setShowProfileDropdown(false);
    setUser(null);
    onLogout();
  };

  const handlePostCreated = () => {
    if (onPostCreated) {
      onPostCreated();
    }
    fetchUserPosts();
  };

  // Navigation functions for dropdown items
  const goToProfile = () => {
    setShowProfileDropdown(false);
    navigate(`/profile/${user?.id}`);
  };

  const goToSettings = () => {
    setShowProfileDropdown(false);
    alert('Settings feature coming soon!');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
      
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="header">
        <div className="header-container">
          
          {/* Logo with Home Link */}
          <Link to="/" className="header-logo">
            <span className="logo-text">
              <span className="highlight">B</span>lo<span className="highlight">G</span>o
            </span>
            <span className="logo-subtitle">blogs</span>
          </Link>
          
          {/* Search with Dropdown */}
          <div className="header-search" ref={searchRef}>
            <input 
              type="text" 
              placeholder="Search posts, topics, authors..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
            />
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map(post => (
                  <div 
                    key={post._id} 
                    className="search-result-item"
                    onClick={() => {
                      navigate(`/post/${post._id}`);
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                  >
                    <h4>{post.title}</h4>
                    <p>by {post.authorName}</p>
                    <span className="result-meta">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <div className="header-actions">
            
            <button className="write-btn" onClick={() => setShowWritePost(true)}>
              <svg className="write-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
              </svg>
              <span>Write</span>
            </button>
            
            <button className="notification-btn" onClick={() => alert('Notifications coming soon!')}>
              <svg className="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
              </svg>
            </button>
            
            <div className="profile-section">
              <button 
                ref={profileButtonRef}
                className="profile-btn"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <div className="profile-avatar">
                  {user?.profilePic ? (
                    <img src={user.profilePic} alt={user.name} className="profile-image" />
                  ) : (
                    user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
              </button>
              
              {showProfileDropdown && (
                <div ref={dropdownRef} className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="user-avatar">
                      {user?.profilePic ? (
                        <img src={user.profilePic} alt={user.name} className="user-image" />
                      ) : (
                        user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{user?.name || 'Guest User'}</div>
                      <div className="user-email">{user?.email || 'guest@blogo.com'}</div>
                      <div className="user-stats">{userPosts.length} posts</div>
                    </div>
                  </div>
                  
                  <div className="dropdown-body">
                    <div className="dropdown-item" onClick={goToProfile}>
                      <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Your Profile</span>
                    </div>
                    
                    <div className="dropdown-item" onClick={goToProfile}>
                      <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                      </svg>
                      <span>Your Posts ({userPosts.length})</span>
                    </div>
                    
                    <div className="dropdown-item" onClick={goToSettings}>
                      <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="m12 1 0 6M12 17l0 6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12l6 0M17 12l6 0M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"></path>
                      </svg>
                      <span>Settings</span>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item logout" onClick={handleLogout}>
                      <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16,17 21,12 16,7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      <span>Sign Out</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </header>

      {showWritePost && (
        <WritePost 
          onClose={() => setShowWritePost(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </>
  );
}

export default Header;
