
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import PostCard from '../components/PostCard';
import PostList from '../components/PostList';
import SearchFilter from '../components/SearchFilter';
import { Post } from '../types/Post';

const API_URL = 'http://localhost:8080/api/posts';

interface SectionBoardProps {
  isAuthenticated?: boolean;
}

const SectionBoard: React.FC<SectionBoardProps> = ({ isAuthenticated = false }) => {
  const { section } = useParams<{ section: string }>();
  const history = useHistory();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (!section) return;
    setLoading(true);
    fetch(`${API_URL}?section=${section}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch posts');
        return res.json();
      })
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [section]);

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      alert('Please log in to create a post');
      history.push('/login');
      return;
    }
    history.push(`/section/${section}/create`);
  };

  const getSectionTitle = (sectionName?: string) => {
    const titles: { [key: string]: string } = {
      'housing': 'Student Housing',
      'deals': 'Deals & Discounts',
      'news': 'Campus News',
      'events': 'Events & Activities',
      'help': 'Q&A / Help Desk'
    };
    return titles[sectionName || ''] || `${sectionName?.charAt(0).toUpperCase()}${sectionName?.slice(1)} Board`;
  };

  const getSectionDescription = (sectionName?: string) => {
    const descriptions: { [key: string]: string } = {
      'housing': 'Find rooms, apartments, roommates, and share housing tips',
      'deals': 'Share supermarket discounts and money-saving shopping tips',
      'news': 'Latest local and campus news, events, and announcements',
      'events': 'Upcoming student events, workshops, meetups, and activities',
      'help': 'Ask questions and get advice from fellow students'
    };
    return descriptions[sectionName || ''] || 'Share and discuss with the community';
  };

  // Get available tags from all posts
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach(post => {
      if (post.tags) {
        post.tags.split(',').forEach(tag => {
          const trimmedTag = tag.trim();
          if (trimmedTag) tagSet.add(trimmedTag);
        });
      }
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query) ||
        (post.tags && post.tags.toLowerCase().includes(query))
      );
    }

    // Apply tag filter
    if (filterTag) {
      filtered = filtered.filter(post =>
        post.tags && post.tags.split(',').some(tag => tag.trim() === filterTag)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'most-liked':
          return (b.likes || 0) - (a.likes || 0);
        case 'most-viewed':
          return (b.views || 0) - (a.views || 0);
        case 'most-commented':
          return (b.comments?.length || 0) - (a.comments?.length || 0);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return sorted;
  }, [posts, searchQuery, filterTag, sortBy]);

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>{getSectionTitle(section)}</h1>
        <p style={{ color: '#718096', fontSize: '1.1rem' }}>{getSectionDescription(section)}</p>
      </div>

      <div className="create-post-section">
        <button
          onClick={handleCreatePost}
          className="create-post-btn"
        >
          + New Post
        </button>
        <span className="create-post-hint">
          {isAuthenticated
            ? "Share something with the community"
            : "Login to share with the community"
          }
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', margin: '2rem 0', color: '#718096' }}>
          Loading posts... 📚
        </div>
      ) : (
        <>
          <SearchFilter
            onSearch={setSearchQuery}
            onFilterByTag={setFilterTag}
            onSortChange={setSortBy}
            availableTags={availableTags}
            currentSearch={searchQuery}
            currentTag={filterTag}
            currentSort={sortBy}
          />
          <PostList
            posts={filteredAndSortedPosts}
            isAuthenticated={isAuthenticated}
            onLikeUpdate={(postId, liked, newCount) => {
              setPosts(prevPosts =>
                prevPosts.map(post =>
                  post.id === postId
                    ? { ...post, likes: newCount, is_liked: liked }
                    : post
                )
              );
            }}
          />
        </>
      )}

      {error && (
        <div style={{
          color: '#e53e3e',
          background: '#fed7d7',
          padding: '1rem',
          borderRadius: '8px',
          margin: '1rem 0'
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default SectionBoard;
