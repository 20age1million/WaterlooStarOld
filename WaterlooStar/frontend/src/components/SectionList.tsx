import React from 'react';
import { Link } from 'react-router-dom';

const sections = [
  {
    name: 'Student Housing',
    path: '/section/housing',
    description: 'Find rooms, apartments, roommates, and housing tips'
  },
  {
    name: 'Deals & Discounts',
    path: '/section/deals',
    description: 'Share supermarket discounts and money-saving tips'
  },
  {
    name: 'Campus News',
    path: '/section/news',
    description: 'Latest local and campus news, events, and announcements'
  },
  {
    name: 'Events & Activities',
    path: '/section/events',
    description: 'Upcoming student events, workshops, and meetups'
  },
  {
    name: 'Q&A / Help Desk',
    path: '/section/help',
    description: 'Ask questions and get advice from fellow students'
  },
];

const SectionList: React.FC = () => (
  <div className="section-list">
    <h2>Community Sections</h2>
    <div className="sections-grid">
      {sections.map(section => (
        <div key={section.path} className="section-card">
          <Link to={section.path} className="section-link">
            <h3>{section.name}</h3>
            <p>{section.description}</p>
          </Link>
        </div>
      ))}
    </div>
  </div>
);

export default SectionList;
