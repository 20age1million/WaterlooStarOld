import React, { useState, useEffect } from 'react';
import { Comment } from '../types/Post';

interface CommentsProps {
  postId: number;
  initialComments?: Comment[];
}

const API_URL = 'http://localhost:8080/api/posts';

const Comments: React.FC<CommentsProps> = ({ postId, initialComments = [] }) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments();
    }
  }, [showComments, postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        setError('Failed to load comments');
      }
    } catch (err) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
          author: author.trim() || 'Anonymous',
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments([...comments, newCommentData]);
        setNewComment('');
        setAuthor('');
        setError('');
      } else {
        setError('Failed to post comment');
      }
    } catch (err) {
      setError('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="comments-section">
      <button
        className="comments-toggle"
        onClick={() => setShowComments(!showComments)}
        type="button"
      >
        💬 {showComments ? 'Hide' : 'Show'} Comments ({comments.length})
      </button>

      {showComments && (
        <div className="comments-container">
          {loading && comments.length === 0 && (
            <div className="comments-loading">Loading comments...</div>
          )}

          {error && (
            <div className="comments-error">⚠️ {error}</div>
          )}

          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">👤 {comment.author}</span>
                  <span className="comment-date">📅 {formatDate(comment.created_at)}</span>
                </div>
                <div className="comment-content">{comment.content}</div>
                {comment.likes > 0 && (
                  <div className="comment-likes">❤️ {comment.likes}</div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmitComment} className="comment-form">
            <h4>💭 Add a Comment</h4>
            <input
              type="text"
              placeholder="Your name (optional)"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="comment-author-input"
            />
            <textarea
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
              className="comment-input"
              rows={3}
            />
            <button type="submit" disabled={loading || !newComment.trim()}>
              {loading ? 'Posting...' : '📝 Post Comment'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Comments;
