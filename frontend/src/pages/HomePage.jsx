import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.scss';

function HomePage({ refreshTrigger }) {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [stats, setStats] = useState({ totalPosts: 0, totalViews: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    fetchCurrentUser();
    fetchStats();
  }, [refreshTrigger, sortBy]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, posts]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.profile);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/posts');
      const data = await response.json();
      if (response.ok) {
        let sortedPosts = data.posts || [];
        
        if (sortBy === 'popular') {
          sortedPosts = sortedPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        } else {
          sortedPosts = sortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        setPosts(sortedPosts);
        setFilteredPosts(sortedPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/posts');
      const data = await response.json();
      if (response.ok) {
        const totalViews = (data.posts || []).reduce((sum, post) => sum + (post.views || 0), 0);
        setStats({
          totalPosts: data.posts?.length || 0,
          totalViews: totalViews,
          totalUsers: new Set(data.posts?.map(p => p.authorId)).size || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const filtered = posts.filter(post => {
      const titleMatch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
      const contentMatch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const tagsMatch = post.tags?.some(tag => 
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const authorMatch = post.authorName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return titleMatch || contentMatch || tagsMatch || authorMatch;
    });

    setFilteredPosts(filtered);
  };

  return (
    <div className="homepage">
      <div className="homepage-container">
        
        <main className="main-content">
          <div className="feed-header">
            <h2>Latest Posts</h2>
            <div className="sort-options">
              <button 
                className={`sort-btn ${sortBy === 'recent' ? 'active' : ''}`}
                onClick={() => setSortBy('recent')}
              >
                Recent
              </button>
              <button 
                className={`sort-btn ${sortBy === 'popular' ? 'active' : ''}`}
                onClick={() => setSortBy('popular')}
              >
                Popular
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-section">
            <div className="search-bar">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Search posts, authors, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
            
            {searchQuery && (
              <div className="search-results-count">
                {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''} found for "{searchQuery}"
              </div>
            )}
          </div>

          {loading ? (
            <div className="loading-posts">
              <div className="post-skeleton"></div>
              <div className="post-skeleton"></div>
              <div className="post-skeleton"></div>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="posts-feed">
              {filteredPosts.map(post => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  navigate={navigate} 
                  currentUserId={currentUser?.id}
                />
              ))}
            </div>
          ) : (
            <div className="empty-feed">
              {searchQuery ? (
                <>
                  <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <h3>No posts found</h3>
                  <p>No posts match your search for "{searchQuery}". Try different keywords.</p>
                  <button 
                    className="write-first-btn" 
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
                  </svg>
                  <h3>No posts yet</h3>
                  <p>Be the first to share your thoughts with the community!</p>
                  <button 
                    className="write-first-btn" 
                    onClick={() => document.querySelector('.write-btn').click()}
                  >
                    Write First Post
                  </button>
                </>
              )}
            </div>
          )}
        </main>

        <aside className="right-sidebar">
          <div className="welcome-card">
            <div className="welcome-header">
              <svg className="welcome-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
              </svg>
              <h3>Welcome back, {currentUser?.name?.split(' ')[0] || 'Writer'}!</h3>
            </div>
            <p>Ready to share your next big idea with the community?</p>
            <button 
              className="write-btn-sidebar" 
              onClick={() => document.querySelector('.write-btn').click()}
            >
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Write New Post
            </button>
          </div>

          <div className="stats-card">
            <h4>Community Stats</h4>
            <div className="stat-item">
              <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <div>
                <span className="stat-number">{stats.totalPosts}</span>
                <span className="stat-label">Total Posts</span>
              </div>
            </div>
            <div className="stat-item">
              <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <div>
                <span className="stat-number">{stats.totalViews}</span>
                <span className="stat-label">Total Views</span>
              </div>
            </div>
            <div className="stat-item">
              <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <div>
                <span className="stat-number">{stats.totalUsers}</span>
                <span className="stat-label">Authors</span>
              </div>
            </div>
          </div>

          {/* Quick Search Suggestions */}
          <div className="trending-card">
            <h4>Popular Tags</h4>
            <div className="tag-suggestions">
              {['JavaScript', 'React', 'WebDev', 'Node.js', 'CSS', 'Programming'].map(tag => (
                <button 
                  key={tag} 
                  className="tag-suggestion"
                  onClick={() => setSearchQuery(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

// Enhanced PostCard with Like/Bookmark + Fixed Author Area
function PostCard({ post, navigate, currentUserId }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);

  const handleLike = async (e) => {
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/like`, {
        method: liked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setLiked(!liked);
        setLikesCount(prev => liked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/bookmark`, {
        method: bookmarked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setBookmarked(!bookmarked);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  return (
    <article className="post-card">
      
      {/* Fixed Author Area - Clickable as whole */}
      <div 
        className="post-header"
        onClick={() => navigate(`/profile/${post.authorId}`)}
      >
        <div className="author-info">
          <div className="author-avatar">
            {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="author-details">
            <span className="author-name">{post.authorName || 'Anonymous'}</span>
            <span className="post-date">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="post-content">
        <h3 
          className="post-title"
          onClick={() => navigate(`/post/${post._id}`)}
        >
          {post.title}
        </h3>
        <p className="post-excerpt">
          {post.content.length > 120 
            ? post.content.substring(0, 120) + '...' 
            : post.content}
        </p>
        
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && <span className="more-tags">+{post.tags.length - 3}</span>}
          </div>
        )}
      </div>

      <div className="post-footer">
        <div className="post-actions">
          <button 
            className={`action-btn like-btn ${liked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <svg className="action-icon" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span>{likesCount}</span>
          </button>
          
          <button 
            className={`action-btn bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
            onClick={handleBookmark}
          >
            <svg className="action-icon" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
            </svg>
          </button>
          
          <button className="action-btn">
            <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
            </svg>
            <span>0</span>
          </button>
          
          <button className="action-btn">
            <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16,6 12,2 8,6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
          </button>
        </div>
        
        <button 
          className="read-more-btn" 
          onClick={() => navigate(`/post/${post._id}`)}
        >
          <span>Read More</span>
          <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12,5 19,12 12,19"></polyline>
          </svg>
        </button>
      </div>
    </article>
  );
}

export default HomePage;
