import React, { useState, useEffect } from 'react';
import './WritePost.scss';

function WritePost({ onClose, onPostCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/posts', {
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
        alert('Failed to create post');
      }
    } catch (error) {
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
          <input
            type="text"
            placeholder="Post title..."
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          
          <textarea
            placeholder="What's on your mind?"
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            required
            rows="6"
          ></textarea>
          
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
          />
          
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
