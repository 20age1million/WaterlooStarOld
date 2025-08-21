import React from 'react';
import { Post } from '../types/Post';
import PostCard from './PostCard';

interface PostListProps {
    posts: Post[];
    isAuthenticated?: boolean;
    onLikeUpdate?: (postId: number, liked: boolean, newCount: number) => void;
}

const PostList: React.FC<PostListProps> = ({ posts, isAuthenticated = false, onLikeUpdate }) => {
    return (
        <div className="post-list">
            {posts.length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center', margin: '2rem 0' }}>
                    No posts yet. Be the first to share something! 🚀
                </div>
            ) : (
                posts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        isAuthenticated={isAuthenticated}
                        onLikeUpdate={onLikeUpdate}
                    />
                ))
            )}
        </div>
    );
};

export default PostList;