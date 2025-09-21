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
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const token = localStorage.getItem('token');
      
      // Prepare data - don't trim content to preserve formatting
      const postData = {
        title: formData.title,
        content: formData.content, // Keep original formatting
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      console.log('Sending post data:', postData); // Debug log

      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        alert('Post created successfully!');
        onPostCreated();
        onClose();
      } else {
        const errorData = await response.json();
        console.log('Full error response:', errorData);
        
        if (errorData.errors) {
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

  // Function to get actual character count (excluding only leading/trailing whitespace)
  const getContentLength = () => {
    return formData.content.length;
  };

  const getMeaningfulContentLength = () => {
    return formData.content.trim().length;
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
              rows="8"
              style={{
                fontFamily: 'monospace',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap' // Preserve formatting
              }}
            ></textarea>
            {errors.content && (
              <div className="error-message">
                ⚠️ {errors.content}
              </div>
            )}
            <small className="field-hint">
              Total: {getContentLength()}/50000 characters | 
              Meaningful: {getMeaningfulContentLength()} characters
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
