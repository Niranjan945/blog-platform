import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PostDetail.scss';
import API_BASE_URL from '../config/api.js';

function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    fetchPost();
    fetchRelatedPosts();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`);
      const data = await response.json();
      
      if (response.ok) {
        setPost(data.userPost);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts?limit=3`);
      const data = await response.json();
      if (response.ok) {
        setRelatedPosts(data.posts.filter(p => p._id !== postId).slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  if (loading) {
    return (
      <div className="post-detail-loading">
        <div className="loading-text">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-error">
        <h2>Post not found</h2>
        <button onClick={() => navigate('/')} className="back-btn">
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="post-detail">
      <div className="container">
        
        <button onClick={() => navigate('/')} className="back-btn">
          ← Back to Feed
        </button>

        <article className="post-article">
          
          <header className="post-header">
            <h1 className="post-title">{post.title}</h1>
            
            <div className="post-meta">
              <div className="author-info">
                <div className="author-avatar">
                  {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="author-details">
                  <span 
                    className="author-name" 
                    onClick={() => navigate(`/profile/${post.authorId}`)}
                  >
                    {post.authorName || 'Anonymous'}
                  </span>
                  <span className="post-date">
                    Published on {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              
              <div className="post-stats">
                <span className="read-time">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                  {Math.ceil(post.content.length / 200)} min read
                </span>
                <span className="view-count">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  {post.views || 0} views
                </span>
              </div>
            </div>
          </header>

          <div className="post-content">
            <div className="post-text">
              {post.content.split('\n').map((paragraph, index) => (
                paragraph.trim() && <p key={index}>{paragraph}</p>
              ))}
            </div>
            
            {post.tags && post.tags.length > 0 && (
              <div className="post-tags">
                <h4>Tags:</h4>
                <div className="tags-list">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <footer className="post-actions">
            <button className="action-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {post.likes || 0} Likes
            </button>
            <button className="action-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
              </svg>
              0 Comments
            </button>
            <button className="action-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16,6 12,2 8,6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
              Share
            </button>
          </footer>
        </article>

        {relatedPosts.length > 0 && (
          <section className="related-posts">
            <h3>More Posts You Might Like</h3>
            <div className="related-grid">
              {relatedPosts.map(relatedPost => (
                <div 
                  key={relatedPost._id} 
                  className="related-card"
                  onClick={() => navigate(`/post/${relatedPost._id}`)}
                >
                  <h4>{relatedPost.title}</h4>
                  <p>{relatedPost.content.substring(0, 80)}...</p>
                  <span className="author">by {relatedPost.authorName}</span>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

export default PostDetail;
