import React, { useState, useEffect } from 'react';

interface UserProfile {
  id?: number;
  name: string;
  email?: string;
  school_year?: string;
  major?: string;
  contact_info?: string;
  bio?: string;
}

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const UserProfileComponent: React.FC<UserProfileProps> = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  onSave 
}) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    school_year: '',
    major: '',
    contact_info: '',
    bio: ''
  });

  useEffect(() => {
    if (currentUser) {
      setProfile(currentUser);
    }
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile);
    onClose();
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal">
        <div className="profile-header">
          <h2>👤 User Profile</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              placeholder="Your full name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={profile.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="your.email@university.edu"
            />
          </div>

          <div className="form-group">
            <label>School Year</label>
            <select
              value={profile.school_year || ''}
              onChange={(e) => handleChange('school_year', e.target.value)}
            >
              <option value="">Select year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Graduate">Graduate Student</option>
              <option value="PhD">PhD Student</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Major/Field of Study</label>
            <input
              type="text"
              value={profile.major || ''}
              onChange={(e) => handleChange('major', e.target.value)}
              placeholder="e.g., Computer Science, Biology, etc."
            />
          </div>

          <div className="form-group">
            <label>Contact Info (Optional)</label>
            <input
              type="text"
              value={profile.contact_info || ''}
              onChange={(e) => handleChange('contact_info', e.target.value)}
              placeholder="Discord, Instagram, phone, etc."
            />
            <small>Share how others can reach you (optional)</small>
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={profile.bio || ''}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Tell us a bit about yourself..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              💾 Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileComponent;
