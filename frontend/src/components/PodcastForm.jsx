import { useState } from 'react';
import './PodcastForm.css';

function PodcastForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    channel_id: '',
    channel_name: '',
    rss_url: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const generateRssUrl = (channelId) => {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  };

  const handleChannelIdChange = (e) => {
    const channelId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      channel_id: channelId,
      rss_url: channelId ? generateRssUrl(channelId) : '',
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.channel_id || !formData.channel_name) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    const result = await onSubmit(formData);

    setLoading(false);

    if (result.success) {
      // Reset form
      setFormData({
        channel_id: '',
        channel_name: '',
        rss_url: '',
      });
    } else {
      setError(result.error || 'Failed to add podcast');
    }
  };

  return (
    <form className="podcast-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="channel_name">Podcast/Channel Name *</label>
        <input
          type="text"
          id="channel_name"
          name="channel_name"
          value={formData.channel_name}
          onChange={handleChange}
          placeholder="e.g., The Daily"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="channel_id">YouTube Channel ID *</label>
        <input
          type="text"
          id="channel_id"
          name="channel_id"
          value={formData.channel_id}
          onChange={handleChannelIdChange}
          placeholder="e.g., UCxxxxxxxxxxxxxx"
          required
        />
        <small className="help-text">
          Find the channel ID in the page source or channel URL
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="rss_url">RSS Feed URL</label>
        <input
          type="text"
          id="rss_url"
          name="rss_url"
          value={formData.rss_url}
          readOnly
          placeholder="Auto-generated from Channel ID"
        />
        <small className="help-text">
          This is automatically generated from the Channel ID
        </small>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? 'Adding...' : 'Add Podcast'}
      </button>
    </form>
  );
}

export default PodcastForm;
