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
        setFormData({ title: '', content: '', tags: '' }); // Clear form
        onPostCreated();
        onClose();
      } else {
        // Handle validation errors properly
        const errorData = await response.json();
        console.log('Error response:', errorData);
        
        if (errorData.errors) {
          // Handle Mongoose validation errors (field-specific)
          const validationErrors = {};
          Object.keys(errorData.errors).forEach(field => {
            validationErrors[field] = errorData.errors[field].message;
          });
          setErrors(validationErrors);
          
          // Show user-friendly message
          const errorCount = Object.keys(validationErrors).length;
          alert(`Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} in the form below.`);
          
        } else if (errorData.error) {
          // Handle general error messages
          if (errorData.error.includes('validation') || errorData.error.includes('Validation')) {
            alert('Please check your input and try again.');
          } else if (errorData.error.includes('required')) {
            alert('Please fill in all required fields.');
          } else if (errorData.error.includes('character')) {
            alert('Content is too long. Please shorten your post.');
          } else {
            alert(errorData.error);
          }
        } else {
          // Fallback for unknown error format
          alert('Failed to create post. Please check your input and try again.');
        }
      }
    } catch (error) {
      console.log('Connection error:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Network error. Please check your connection and try again.');
      } else {
        alert('Connection error. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get character count
  const getCharacterCount = (text) => {
    return text ? text.length : 0;
  };

  // Helper function to get tag count
  const getTagCount = () => {
    return formData.tags ? formData.tags.split(',').filter(tag => tag.trim()).length : 0;
  };

  return (
    <div className="write-post-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="write-post-modal">
        
        <div className="modal-header">
          <h2>Create New Post</h2>
          <button onClick={onClose} className="close-btn">✕</button>
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
              maxLength={100}
            />
            {errors.title && (
              <div className="error-message">
                ⚠️ {errors.title}
              </div>
            )}
            <small className="field-hint">
              {getCharacterCount(formData.title)}/100 characters
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
                resize: 'vertical',
                minHeight: '120px',
                lineHeight: '1.5',
                fontFamily: 'inherit'
              }}
            ></textarea>
            {errors.content && (
              <div className="error-message">
                ⚠️ {errors.content}
              </div>
            )}
            <small className="field-hint">
              {getCharacterCount(formData.content)}/50,000 characters
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
              {getTagCount()}/10 tags
            </small>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default WritePost;
