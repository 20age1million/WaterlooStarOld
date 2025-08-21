import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';

const API_URL = 'http://localhost:8080/api/posts';

const CreatePost: React.FC = () => {
  const { section } = useParams<{ section: string }>();
  const history = useHistory();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getSectionTitle = (sectionName?: string) => {
    const titles: { [key: string]: string } = {
      'housing': '🏠 Student Housing',
      'deals': '💰 Deals & Discounts',
      'news': '📰 Campus News',
      'events': '🎉 Events & Activities',
      'help': '❓ Q&A / Help Desk'
    };
    return titles[sectionName || ''] || `${sectionName?.charAt(0).toUpperCase()}${sectionName?.slice(1)} Board`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!section) return;

    setLoading(true);
    const postData = {
      section,
      title,
      content,
      tags: tags.trim()
    };

    // Get auth token from localStorage
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError('You must be logged in to create a post');
      setLoading(false);
      return;
    }

    fetch(`${API_URL}?section=${section}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(postData),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create post');
        return res.json();
      })
      .then(() => {
        // Redirect back to the section
        history.push(`/section/${section}`);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleCancel = () => {
    history.push(`/section/${section}`);
  };

  return (
    <div className="create-post-page">
      <div className="create-post-header">
        <h1>✍️ Create New Post</h1>
        <p>Share something with the <strong>{getSectionTitle(section)}</strong> community</p>
      </div>
      
      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="form-group">
          <label htmlFor="title">Post Title *</label>
          <input
            id="title"
            type="text"
            placeholder="What's your post about?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            placeholder="Share your thoughts, questions, or information..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={8}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (Optional)</label>
          <input
            id="tags"
            type="text"
            placeholder="Add tags separated by commas (e.g., urgent, cheap, downtown)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <small>Tags help others find your post more easily</small>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            onClick={handleCancel}
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading || !title.trim() || !content.trim()}
          >
            {loading ? 'Posting...' : '📝 Share Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
