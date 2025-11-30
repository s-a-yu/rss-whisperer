import { useState } from 'react';
import './PodcastList.css';

function PodcastItem({ podcast, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    channel_name: podcast.channel_name,
    rss_url: podcast.rss_url,
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      channel_name: podcast.channel_name,
      rss_url: podcast.rss_url,
    });
  };

  const handleSave = async () => {
    const result = await onUpdate(podcast.id, editData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="podcast-item">
      {isEditing ? (
        <div className="podcast-edit">
          <div className="form-group">
            <label>Channel Name</label>
            <input
              type="text"
              name="channel_name"
              value={editData.channel_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>RSS URL</label>
            <input
              type="text"
              name="rss_url"
              value={editData.rss_url}
              onChange={handleChange}
            />
          </div>
          <div className="edit-actions">
            <button onClick={handleSave} className="save-button">
              Save
            </button>
            <button onClick={handleCancel} className="cancel-button">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="podcast-view">
          <div className="podcast-info">
            <h3 className="podcast-name">{podcast.channel_name}</h3>
            <p className="podcast-id">
              <strong>Channel ID:</strong> {podcast.channel_id}
            </p>
            <p className="podcast-url">
              <strong>RSS URL:</strong>{' '}
              <a href={podcast.rss_url} target="_blank" rel="noopener noreferrer">
                {podcast.rss_url}
              </a>
            </p>
            <p className="podcast-date">
              <strong>Added:</strong> {new Date(podcast.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="podcast-actions">
            <button onClick={handleEdit} className="edit-button">
              Edit
            </button>
            <button onClick={() => onDelete(podcast.id)} className="delete-button">
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PodcastList({ podcasts, onDelete, onUpdate }) {
  return (
    <div className="podcast-list">
      {podcasts.map((podcast) => (
        <PodcastItem
          key={podcast.id}
          podcast={podcast}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

export default PodcastList;
