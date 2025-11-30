import { useState } from 'react';
import './EmailSettings.css';

function EmailSettings({ currentEmail, onSave }) {
  const [email, setEmail] = useState(currentEmail || '');
  const [isEditing, setIsEditing] = useState(!currentEmail);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
    setSuccess('');
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSave = async () => {
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const result = await onSave(email);

    setLoading(false);

    if (result.success) {
      setSuccess('Email saved successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to save email');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEmail(currentEmail || '');
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="email-settings">
      <h2>Email Configuration</h2>
      <p className="settings-description">
        Set your email address to receive podcast summaries
      </p>

      <div className="email-form">
        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            disabled={!isEditing}
            className={!isEditing ? 'disabled' : ''}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="email-actions">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="save-button"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Email'}
              </button>
              {currentEmail && (
                <button onClick={handleCancel} className="cancel-button">
                  Cancel
                </button>
              )}
            </>
          ) : (
            <button onClick={handleEdit} className="edit-button">
              Edit Email
            </button>
          )}
        </div>
      </div>

      {currentEmail && !isEditing && (
        <div className="current-email-info">
          <h3>Current Email</h3>
          <p className="email-display">{currentEmail}</p>
          <p className="info-text">
            Summaries will be sent to this email address when new podcast episodes
            are detected.
          </p>
        </div>
      )}
    </div>
  );
}

export default EmailSettings;
