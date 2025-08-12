import React, { useState } from 'react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  profiles: any[];
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onSave, profiles }) => {
  const [profileName, setProfileName] = useState('');
  const [profileDescription, setProfileDescription] = useState('');

  const handleSave = () => {
    if (profileName.trim()) {
      onSave(profileName, profileDescription);
      setProfileName('');
      setProfileDescription('');
      onClose();
    }
  };

  const handleClose = () => {
    setProfileName('');
    setProfileDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Save Profile</h3>
          <button onClick={handleClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          <div className="config-form">
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Profile name"
              className="form-input"
              autoFocus
            />
            <textarea
              value={profileDescription}
              onChange={(e) => setProfileDescription(e.target.value)}
              placeholder="Description (optional)"
              className="form-textarea"
            />
            <div className="form-buttons">
              <button onClick={handleSave} className="button-primary">Save Profile</button>
              <button onClick={handleClose} className="button-secondary">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;