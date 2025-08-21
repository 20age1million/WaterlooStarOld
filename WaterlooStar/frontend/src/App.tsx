import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';

import Home from './pages/Home';
import SectionBoard from './pages/SectionBoard';
import CreatePost from './pages/CreatePost';
import LoginPage from './pages/LoginPage';
import GeneralChat from './components/GeneralChat';
import UserProfile from './components/UserProfile';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Register from './components/Register';
import './styles/main.css';

interface UserProfileData {
  id?: number;
  username?: string;
  name: string;
  email?: string;
  school_year?: string;
  major?: string;
  contact_info?: string;
  bio?: string;
}

const AppContent: React.FC = () => {
    const history = useHistory();
    const [showProfile, setShowProfile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<UserProfileData>({
        name: 'Guest User'
    });

    const handleSaveProfile = (profile: UserProfileData) => {
        setCurrentUser(profile);
        // In a real app, this would save to backend
        localStorage.setItem('userProfile', JSON.stringify(profile));
    };

    const handleLogin = (token: string, user: any) => {
        setAuthToken(token);
        setIsAuthenticated(true);
        setCurrentUser({
            id: user.id,
            username: user.username,
            name: user.name || user.username,
            email: user.email,
            school_year: user.school_year,
            major: user.major,
            contact_info: user.contact_info,
            bio: user.bio
        });
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
    };

    const handleLogout = () => {
        setAuthToken(null);
        setIsAuthenticated(false);
        setCurrentUser({ name: 'Guest User' });
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    };

    const showLogin = () => {
        setAuthMode('login');
        setShowAuth(true);
    };

    const showRegister = () => {
        setAuthMode('register');
        setShowAuth(true);
    };

    // Load authentication state from localStorage on app start
    React.useEffect(() => {
        const savedToken = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('currentUser');

        if (savedToken && savedUser) {
            setAuthToken(savedToken);
            setIsAuthenticated(true);
            setCurrentUser(JSON.parse(savedUser));
        }
    }, []);

    return (
        <div className="app-container">
            <button
                className="mobile-menu-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                ☰
            </button>
            <div
                className={`sidebar-backdrop ${sidebarOpen ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
            ></div>
            <div className="main-layout">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    isAuthenticated={isAuthenticated}
                />
                <div className="content-area">
                    <header>
                        <div className="header-content">
                            <div className="header-text">
                                <h1>🎓 Student Community Forum</h1>
                                <p>Connect, Share, Learn Together</p>
                            </div>
                            <div className="header-actions">
                                {isAuthenticated ? (
                                    <>
                                        <span className="user-welcome">
                                            Welcome, {currentUser.name}!
                                        </span>
                                        <button
                                            className="user-icon-btn"
                                            onClick={() => setShowProfile(true)}
                                            title="View Profile"
                                        >
                                            👤
                                        </button>
                                        <button
                                            className="logout-btn"
                                            onClick={handleLogout}
                                        >
                                            🚪 Logout
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        className="user-icon-btn"
                                        onClick={() => history.push('/login')}
                                        title="Login / Register"
                                    >
                                        👤
                                    </button>
                                )}
                            </div>
                        </div>
                    </header>
                    <main>
                        <Switch>
                            <Route path="/" exact component={Home} />
                            <Route
                                path="/login"
                                render={() => (
                                    <LoginPage
                                        onLogin={handleLogin}
                                        isAuthenticated={isAuthenticated}
                                    />
                                )}
                            />
                            <Route path="/section/:section/create" component={CreatePost} />
                            <Route
                                path="/section/:section"
                                render={() => <SectionBoard isAuthenticated={isAuthenticated} />}
                            />
                        </Switch>
                    </main>
                    <footer>
                        <p>&copy; 2024 Student Community Forum. Built for students, by students.</p>
                    </footer>
                </div>
            </div>
            <GeneralChat />
            <UserProfile
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
                currentUser={currentUser}
                onSave={handleSaveProfile}
            />

            {showAuth && authMode === 'login' && (
                <Login
                    onLogin={handleLogin}
                    onSwitchToRegister={() => setAuthMode('register')}
                    onClose={() => setShowAuth(false)}
                />
            )}

            {showAuth && authMode === 'register' && (
                <Register
                    onSwitchToLogin={() => setAuthMode('login')}
                    onClose={() => setShowAuth(false)}
                />
            )}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    );
};

export default App;