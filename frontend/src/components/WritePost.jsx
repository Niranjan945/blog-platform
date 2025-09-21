import React, { useState, useEffect } from 'react';
import './WritePost.scss';
import API_BASE_URL from '../config/api.js';

function WritePost({ onClose, onPostCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({}); // Add error state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      });

      if (response.ok) {
        alert('Post created successfully!');
        onPostCreated();
        onClose();
      } else {
        // Handle validation errors
        const errorData = await response.json();
        console.log('Error response:', errorData);
        
        if (errorData.errors) {
          // Handle Mongoose validation errors
          const validationErrors = {};
          Object.keys(errorData.errors).forEach(field => {
            validationErrors[field] = errorData.errors[field].message;
          });
          setErrors(validationErrors);
        } else {
          alert(errorData.error || 'Failed to create post');
        }
      }
    } catch (error) {
      console.log('Connection error:', error);
      alert('Connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="write-post-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="write-post-modal">
        
        <div className="modal-header">
          <h2>Create New Post</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title Field */}
          <div className="form-group">
            <input
              type="text"
              placeholder="Post title..."
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className={errors.title ? 'error' : ''}
              required
            />
            {errors.title && (
              <div className="error-message">
                ⚠️ {errors.title}
              </div>
            )}
            <small className="field-hint">
              {formData.title.length}/100 characters
            </small>
          </div>
          
          {/* Content Field */}
          <div className="form-group">
            <textarea
              placeholder="What's on your mind?"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className={errors.content ? 'error' : ''}
              required
              rows="6"
            ></textarea>
            {errors.content && (
              <div className="error-message">
                ⚠️ {errors.content}
              </div>
            )}
            <small className="field-hint">
              {formData.content.length}/100000 characters
            </small>
          </div>
          
          {/* Tags Field */}
          <div className="form-group">
            <input
              type="text"
              placeholder="Tags (comma separated, max 10)"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className={errors.tags ? 'error' : ''}
            />
            {errors.tags && (
              <div className="error-message">
                ⚠️ {errors.tags}
              </div>
            )}
            <small className="field-hint">
              {formData.tags.split(',').filter(tag => tag.trim()).length}/10 tags
            </small>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default WritePost;
