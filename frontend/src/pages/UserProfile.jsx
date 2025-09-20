import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './UserProfile.scss';
import API_BASE_URL from '../config/api.js';

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', bio: '', profilePic: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const fileInputRef = useRef(null);

  // Fetch current user first
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Fetch profile data when currentUser or userId changes
  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser, userId]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.profile);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setError('Failed to authenticate');
    }
  };

  const fetchUserProfile = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Check if viewing own profile
      const isOwnProfile = currentUser.id === userId;
      
      if (isOwnProfile) {
        // Get own profile with full data
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setProfileData({
            user: data.profile,
            posts: data.posts,
            isOwnProfile: true
          });
          setEditForm({
            name: data.profile.name || '',
            email: data.profile.email || '',
            bio: data.profile.bio || '',
            profilePic: data.profile.profilePic || ''
          });
        }
      } else {
        // Get other user's public profile
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
        const data = await response.json();
        
        if (response.ok) {
          setProfileData({
            user: data.user,
            posts: data.posts,
            isOwnProfile: false
          });
        } else {
          setError('User not found');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle profile picture upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB', 'error');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
        setEditForm(prev => ({ ...prev, profilePic: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setPreviewImage(null);
    setEditForm(prev => ({ ...prev, profilePic: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      
      if (response.ok) {
        // Update profile data
        setProfileData(prev => ({
          ...prev,
          user: data.profile
        }));
        
        // Update current user for global state
        setCurrentUser(data.profile);
        
        // Dispatch the event AFTER state updates
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
            detail: data.profile 
          }));
        }, 100);
        
        setIsEditMode(false);
        setPreviewImage(null);
        showNotification('Profile updated successfully!', 'success');
      } else {
        showNotification(data.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Connection error. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // FIXED: Handle post deletion
  const handlePostDelete = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Remove post from the posts array
        setProfileData(prev => ({
          ...prev,
          posts: prev.posts.filter(post => post._id !== postId)
        }));
        showNotification('Post deleted successfully!', 'success');
      } else {
        const data = await response.json();
        showNotification(data.error || 'Failed to delete post', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Network error. Please try again.', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 4000);
  };

  const closeNotification = () => {
    setNotification({ show: false, message: '', type: '' });
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-content">
          <div className="loading-avatar"></div>
          <div className="loading-text">
            <div className="loading-line long"></div>
            <div className="loading-line medium"></div>
            <div className="loading-line short"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <div className="error-content">
          <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <h2>{error}</h2>
          <p>The page you're looking for doesn't exist or has been moved.</p>
          <button onClick={() => navigate('/')} className="back-home-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9,22 9,12 15,12 15,22"></polyline>
            </svg>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { user, posts, isOwnProfile } = profileData;

  return (
    <div className="user-profile">
      
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            {notification.type === 'success' && (
              <svg className="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            )}
            {notification.type === 'error' && (
              <svg className="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            )}
            <span>{notification.message}</span>
            <button className="notification-close" onClick={closeNotification}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <div className="profile-container">
        
        {/* Navigation */}
        <nav className="profile-nav">
          <button onClick={() => navigate('/')} className="back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
            Back to Feed
          </button>
          
          <div className="profile-breadcrumb">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>{isOwnProfile ? 'Your Profile' : `${user?.name}'s Profile`}</span>
          </div>
        </nav>

        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-main">
            
            {/* Profile Picture Section */}
            <div className="profile-picture-section">
              <div className="profile-picture">
                {user?.profilePic || previewImage ? (
                  <img 
                    src={previewImage || user.profilePic} 
                    alt={user.name}
                    className="profile-img"
                  />
                ) : (
                  <div className="profile-avatar">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                )}
              </div>
              
              {isOwnProfile && !isEditMode && (
                <button 
                  className="change-photo-btn"
                  onClick={() => setIsEditMode(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>
            
            {/* Profile Info Section */}
            <div className="profile-info-section">
              {isEditMode ? (
                <form onSubmit={handleEditSubmit} className="edit-form">
                  
                  {/* Profile Picture Upload */}
                  <div className="form-group profile-pic-group">
                    <label>Profile Picture</label>
                    <div className="profile-pic-editor">
                      <div className="pic-preview">
                        {previewImage || editForm.profilePic ? (
                          <img 
                            src={previewImage || editForm.profilePic} 
                            alt="Preview"
                            className="preview-img"
                          />
                        ) : (
                          <div className="preview-placeholder">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="pic-actions">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden-input"
                        />
                        <button 
                          type="button" 
                          className="upload-btn"
                          onClick={triggerImageUpload}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17,8 12,3 7,8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                          Upload Photo
                        </button>
                        {(previewImage || editForm.profilePic) && (
                          <button 
                            type="button" 
                            className="remove-btn"
                            onClick={removeImage}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3,6 5,6 21,6"></polyline>
                              <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        required
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      rows="3"
                      maxLength="150"
                    />
                    <small className="char-count">{editForm.bio.length}/150 characters</small>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsEditMode(false);
                        setPreviewImage(null);
                        setEditForm({
                          name: user.name || '',
                          email: user.email || '',
                          bio: user.bio || '',
                          profilePic: user.profilePic || ''
                        });
                      }} 
                      className="cancel-btn"
                      disabled={isSubmitting}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="save-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner-small"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12"></polyline>
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-details">
                  
                  {/* Username and Actions */}
                  <div className="profile-header-row">
                    <h1 className="profile-username">
                      {user?.name?.replace(/\s+/g, '').toLowerCase() || 'user'}
                    </h1>
                    {isOwnProfile && (
                      <div className="profile-actions">
                        <button 
                          className="edit-profile-btn"
                          onClick={() => setIsEditMode(true)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
                          </svg>
                          Edit Profile
                        </button>
                        <button className="settings-btn">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="m12 1 0 6M12 17l0 6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12l6 0M17 12l6 0M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"></path>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Stats Row */}
                  <div className="profile-stats">
                    <div className="stat">
                      <span className="stat-number">{posts?.length || 0}</span>
                      <span className="stat-label">posts</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">
                        {posts?.reduce((sum, post) => sum + (post.likes || 0), 0) || 0}
                      </span>
                      <span className="stat-label">likes</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">
                        {posts?.reduce((sum, post) => sum + (post.views || 0), 0) || 0}
                      </span>
                      <span className="stat-label">views</span>
                    </div>
                  </div>
                  
                  {/* Bio and Details */}
                  <div className="profile-bio-section">
                    <div className="profile-name">{user?.name || 'Anonymous User'}</div>
                    {user?.bio && <div className="profile-bio">{user.bio}</div>}
                    <div className="profile-meta">
                      <span className="join-date">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </span>
                      <span className="email">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Posts Section */}
        {!isEditMode && (
          <div className="profile-posts">
            <div className="posts-header">
              <div className="posts-nav">
                <button className="posts-tab active">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  Posts
                </button>
                {isOwnProfile && (
                  <button 
                    className="write-new-btn"
                    onClick={() => document.querySelector('.write-btn')?.click()}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    New Post
                  </button>
                )}
              </div>
            </div>
            
            {posts && posts.length > 0 ? (
              <div className="posts-grid">
                {posts.map(post => (
                  <PostCard 
                    key={post._id} 
                    post={post} 
                    navigate={navigate}
                    isOwnProfile={isOwnProfile}
                    onDelete={handlePostDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="no-posts">
                <div className="no-posts-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="6"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                  </svg>
                </div>
                <h3>No Posts Yet</h3>
                <p>
                  {isOwnProfile 
                    ? 'When you share posts, they will appear here.'
                    : `${user?.name?.split(' ')[0]} hasn't shared any posts yet.`
                  }
                </p>
                {isOwnProfile && (
                  <button 
                    className="share-first-btn"
                    onClick={() => document.querySelector('.write-btn')?.click()}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
                    </svg>
                    Share your first post
                  </button>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// FIXED: Enhanced Post Card with Proper Delete Functionality
function PostCard({ post, navigate, isOwnProfile, onDelete }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = async () => {
    setIsDeleting(true);
    try {
      await onDelete(post._id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="post-thumbnail">
        {/* Main post content - clickable */}
        <div 
          className="post-content-area"
          onClick={() => navigate(`/post/${post._id}`)}
        >
          <div className="post-overlay">
            <div className="post-stats">
              <span className="stat">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                {post.likes || 0}
              </span>
              <span className="stat">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
                </svg>
                {post.comments || 0}
              </span>
            </div>
          </div>
          
          <div className="post-content">
            <h4 className="post-title">{post.title}</h4>
            <p className="post-excerpt">
              {post.content.length > 80 
                ? post.content.substring(0, 80) + '...' 
                : post.content}
            </p>
            <div className="post-meta">
              <span className="post-date">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              {post.tags && post.tags.length > 0 && (
                <div className="post-tags">
                  {post.tags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="tag">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Button - separate from clickable area */}
        {isOwnProfile && (
          <button 
            className="delete-post-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(true);
            }}
            title="Delete post"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
     {showDeleteModal && (
  <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
    <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Delete Post</h3>
        <button 
          className="modal-close"
          onClick={() => setShowDeleteModal(false)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="modal-body">
        <div className="warning-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        
        <h4>Are you sure?</h4>
        <p>
          "<strong>{post.title}</strong>" will be permanently deleted. 
          This action cannot be undone.
        </p>
      </div>
      
      <div className="modal-footer">
        <button 
          className="cancel-btn"
          onClick={() => setShowDeleteModal(false)}
          disabled={isDeleting}
        >
          Cancel
        </button>
        <button 
          className="delete-confirm-btn"
          onClick={handleDeleteClick}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <div className="spinner-small"></div>
              Deleting...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Delete Post
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
}

export default UserProfile;
