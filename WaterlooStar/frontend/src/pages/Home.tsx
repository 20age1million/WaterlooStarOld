import React, { useState, useEffect } from 'react';
import SectionList from '../components/SectionList';
import PostList from '../components/PostList';
import { Post } from '../types/Post';

const API_URL = 'http://localhost:8080/api/posts';

const Home: React.FC = () => {
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch recent posts from all sections
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                // Show only the 8 most recent posts for better visibility
                setRecentPosts(data.slice(0, 8));
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch recent posts:', err);
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <div className="home-hero">
                <h1>Welcome to Our Student Community! 🎓</h1>
                <p>
                    Connect with fellow students, share resources, find housing, discover deals,
                    and stay updated with campus life. Your community is here to help!
                </p>
            </div>

            <SectionList />

            <div className="recent-posts-section">
                <h2 className="recent-posts-title">
                    Recent Community Posts
                </h2>
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#718096', margin: '2rem 0' }}>
                        Loading recent posts...
                    </div>
                ) : (
                    <>
                        <PostList posts={recentPosts} />
                        {recentPosts.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                color: '#718096',
                                margin: '2rem 0',
                                padding: '2rem',
                                background: '#f7fafc',
                                borderRadius: '12px',
                                border: '2px dashed #e2e8f0'
                            }}>
                                <h3>Be the first to post!</h3>
                                <p>Start the conversation by sharing something in one of our community sections above.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Home;