import { useState } from 'react';
import './PodcastForm.css';

const API_URL = 'http://localhost:3001/api';

function PodcastForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    channel_id: '',
    channel_name: '',
    rss_url: '',
    source: '', 
    frequency_days: 7,
  });
  const [podcastUrl, setPodcastUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [detectedSource, setDetectedSource] = useState(''); // Show user what type was detected

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

  const handleUrlExtract = async () => {
    if (!podcastUrl.trim()) {
      setError('Please enter a podcast URL');
      return;
    }

    setExtracting(true);
    setError('');
    setDetectedSource('');

    try {
      const response = await fetch(`${API_URL}/extract-podcast-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: podcastUrl }),
      });

      const result = await response.json();

      if (result.success) {
        if (result.source === 'youtube') {
          // YouTube podcast
          setFormData((prev) => ({
            ...prev,
            channel_id: result.channelId,
            rss_url: result.rssUrl,
            source: 'youtube',
          }));
          setDetectedSource('YouTube');
        } else if (result.source === 'apple_podcasts') {
          // Apple Podcasts
          setFormData((prev) => ({
            ...prev,
            channel_id: '', // Apple Podcasts don't have channel IDs
            channel_name: result.podcastName || prev.channel_name,
            rss_url: result.rssUrl,
            source: 'apple_podcasts',
          }));
          setDetectedSource('Apple Podcasts');
        }
        setError('');
      } else {
        setError(result.error || 'Failed to extract podcast info');
      }
    } catch (err) {
      setError('Network error: Could not extract podcast info');
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // For Apple Podcasts, channel_id can be empty
    if (!formData.channel_name || !formData.rss_url) {
      setError('Please fill in all required fields');
      return;
    }

    // For YouTube, channel_id is required
    if (formData.source === 'youtube' && !formData.channel_id) {
      setError('Please provide a YouTube channel ID');
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
        source: '',
        frequency_days: 7,
      });
      setPodcastUrl('');
      setDetectedSource('');
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
        <label htmlFor="podcast_url">Podcast URL (YouTube or Apple Podcasts)</label>
        <div className="url-extract-container">
          <input
            type="text"
            id="podcast_url"
            name="podcast_url"
            value={podcastUrl}
            onChange={(e) => setPodcastUrl(e.target.value)}
            placeholder="e.g., https://www.youtube.com/@channelname or https://podcasts.apple.com/us/podcast/..."
          />
          <button
            type="button"
            className="extract-button"
            onClick={handleUrlExtract}
            disabled={extracting || !podcastUrl.trim()}
          >
            {extracting ? 'Extracting...' : 'Extract Info'}
          </button>
        </div>
        <small className="help-text">
          Paste YouTube channel URL or Apple Podcasts URL and click Extract
          {detectedSource && <span style={{ color: '#667eea', fontWeight: 'bold' }}> ✓ Detected: {detectedSource}</span>}
        </small>
      </div>

      {formData.source === 'youtube' && (
        <div className="form-group">
          <label htmlFor="channel_id">YouTube Channel ID</label>
          <input
            type="text"
            id="channel_id"
            name="channel_id"
            value={formData.channel_id}
            onChange={handleChannelIdChange}
            placeholder="e.g., UCxxxxxxxxxxxxxx"
            readOnly={detectedSource === 'YouTube'}
          />
          <small className="help-text">
            Auto-filled from URL above
          </small>
        </div>
      )}

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

      <div className="form-group">
        <label htmlFor="frequency_days">Summary Frequency</label>
        <select
          id="frequency_days"
          name="frequency_days"
          value={formData.frequency_days}
          onChange={handleChange}
        >
          <option value={1}>Daily (episodes from last 1 day)</option>
          <option value={3}>Every 3 days (episodes from last 3 days)</option>
          <option value={7}>Weekly (episodes from last 7 days)</option>
          <option value={14}>Bi-weekly (episodes from last 14 days)</option>
          <option value={30}>Monthly (episodes from last 30 days)</option>
        </select>
        <small className="help-text">
          Only episodes published within this timeframe will be summarized
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
