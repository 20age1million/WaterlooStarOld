import React, { useState } from 'react';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  author_id: number;
  tags?: string;
  created_at: string;
  views: number;
  likes: number;
  is_liked?: boolean;
  comments?: any[];
}

interface PostCardProps {
  post: Post;
  isAuthenticated: boolean;
  onLikeUpdate?: (postId: number, liked: boolean, newCount: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, isAuthenticated, onLikeUpdate }) => {
  const [liked, setLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please log in to like posts');
      return;
    }

    setLiking(true);
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLikeCount(data.count);
        
        if (onLikeUpdate) {
          onLikeUpdate(post.id, data.liked, data.count);
        }
      } else {
        console.error('Failed to toggle like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLiking(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTags = (tags?: string) => {
    if (!tags || !tags.trim()) return [];
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };

  return (
    <div className="post">
      <div className="post-header">
        <h3 className="post-title">{post.title}</h3>
        <div className="post-meta">
          <span className="post-author">👤 {post.author}</span>
          <span className="post-date">📅 {formatDate(post.created_at)}</span>
          <span className="post-views">👁️ {post.views}</span>
        </div>
      </div>
      
      <div className="post-content">
        <p>{post.content}</p>
      </div>
      
      {formatTags(post.tags).length > 0 && (
        <div className="post-tags">
          {formatTags(post.tags).map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="post-actions">
        <button 
          className={`like-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={liking}
          title={isAuthenticated ? (liked ? 'Unlike this post' : 'Like this post') : 'Login to like posts'}
        >
          {liked ? '❤️' : '🤍'} {likeCount}
        </button>
        
        <span className="comment-count">
          💬 {post.comments?.length || 0}
        </span>
      </div>
    </div>
  );
};

export default PostCard;
