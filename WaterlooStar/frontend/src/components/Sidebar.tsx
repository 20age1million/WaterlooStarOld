import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isAuthenticated?: boolean;
}

const sections = [
  { 
    name: 'Home', 
    path: '/',
    icon: '🏠',
    description: 'Main page'
  },
  { 
    name: 'Student Housing', 
    path: '/section/housing',
    icon: '🏠',
    description: 'Find rooms & roommates'
  },
  { 
    name: 'Deals & Discounts', 
    path: '/section/deals',
    icon: '💰',
    description: 'Save money on everything'
  },
  { 
    name: 'Campus News', 
    path: '/section/news',
    icon: '📰',
    description: 'Latest campus updates'
  },
  { 
    name: 'Events & Activities', 
    path: '/section/events',
    icon: '🎉',
    description: 'Upcoming events'
  },
  { 
    name: 'Q&A / Help Desk', 
    path: '/section/help',
    icon: '❓',
    description: 'Get help from peers'
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose, isAuthenticated = false }) => {
  const location = useLocation();

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <h3>📚 Navigation</h3>
      </div>
      
      <nav className="sidebar-nav">
        {sections.map(section => (
          <Link
            key={section.path}
            to={section.path}
            className={`sidebar-link ${location.pathname === section.path ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <div className="sidebar-link-content">
              <span className="sidebar-icon">{section.icon}</span>
              <div className="sidebar-text">
                <span className="sidebar-name">{section.name}</span>
                <span className="sidebar-desc">{section.description}</span>
              </div>
            </div>
          </Link>
        ))}

        {!isAuthenticated && (
          <Link
            to="/login"
            className={`sidebar-link ${location.pathname === '/login' ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <div className="sidebar-link-content">
              <span className="sidebar-icon">🔐</span>
              <div className="sidebar-text">
                <span className="sidebar-name">Login / Register</span>
                <span className="sidebar-desc">Join the community</span>
              </div>
            </div>
          </Link>
        )}
      </nav>
      
      <div className="sidebar-footer">
        <div className="sidebar-stats">
          <div className="stat-item">
            <span className="stat-number">6</span>
            <span className="stat-label">Sections</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">∞</span>
            <span className="stat-label">Possibilities</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
