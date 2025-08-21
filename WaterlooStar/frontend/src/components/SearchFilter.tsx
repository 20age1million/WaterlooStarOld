import React, { useState } from 'react';

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilterByTag: (tag: string) => void;
  onSortChange: (sortBy: string) => void;
  availableTags: string[];
  currentSearch: string;
  currentTag: string;
  currentSort: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  onFilterByTag,
  onSortChange,
  availableTags,
  currentSearch,
  currentTag,
  currentSort
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="search-filter">
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search posts..."
          value={currentSearch}
          onChange={(e) => onSearch(e.target.value)}
          className="search-input"
        />
        <button 
          className="filter-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          type="button"
        >
          {isExpanded ? '▲ Filters' : '▼ Filters'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="filter-options">
          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={currentSort} 
              onChange={(e) => onSortChange(e.target.value)}
              className="sort-select"
            >
              <option value="newest">📅 Newest First</option>
              <option value="oldest">📅 Oldest First</option>
              <option value="most-liked">❤️ Most Liked</option>
              <option value="most-viewed">👁️ Most Viewed</option>
              <option value="most-commented">💬 Most Comments</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Filter by tag:</label>
            <div className="tag-filters">
              <button
                className={`tag-filter ${currentTag === '' ? 'active' : ''}`}
                onClick={() => onFilterByTag('')}
                type="button"
              >
                All
              </button>
              {availableTags.map(tag => (
                <button
                  key={tag}
                  className={`tag-filter ${currentTag === tag ? 'active' : ''}`}
                  onClick={() => onFilterByTag(tag)}
                  type="button"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
