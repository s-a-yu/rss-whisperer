import { useState, useEffect } from 'react';
import PodcastForm from './components/PodcastForm';
import PodcastList from './components/PodcastList';
import EmailSettings from './components/EmailSettings';
import './App.css';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [podcasts, setPodcasts] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('podcasts');

  // Fetch podcasts on mount
  useEffect(() => {
    fetchPodcasts();
    fetchEmail();
  }, []);

  const fetchPodcasts = async () => {
    try {
      const response = await fetch(`${API_URL}/podcasts`);
      if (response.ok) {
        const data = await response.json();
        setPodcasts(data);
      }
    } catch (error) {
      console.error('Error fetching podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmail = async () => {
    try {
      const response = await fetch(`${API_URL}/settings/email`);
      if (response.ok) {
        const data = await response.json();
        setEmail(data.value);
      }
    } catch (error) {
      console.error('Error fetching email:', error);
    }
  };

  const handleAddPodcast = async (podcastData) => {
    try {
      const response = await fetch(`${API_URL}/podcasts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(podcastData),
      });

      if (response.ok) {
        await fetchPodcasts();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      console.error('Error adding podcast:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const handleDeletePodcast = async (id) => {
    if (!confirm('Are you sure you want to delete this podcast?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/podcasts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPodcasts();
      }
    } catch (error) {
      console.error('Error deleting podcast:', error);
    }
  };

  const handleUpdatePodcast = async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/podcasts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchPodcasts();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      console.error('Error updating podcast:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const handleSaveEmail = async (newEmail) => {
    try {
      const response = await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'email', value: newEmail }),
      });

      if (response.ok) {
        setEmail(newEmail);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      console.error('Error saving email:', error);
      return { success: false, error: 'Network error' };
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🎙️ RSS Whisperer</h1>
        <p className="subtitle">Manage your podcast subscriptions</p>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === 'podcasts' ? 'active' : ''}`}
          onClick={() => setActiveTab('podcasts')}
        >
          Podcasts ({podcasts.length})
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Email Settings
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'podcasts' ? (
          <div className="podcasts-section">
            <div className="add-podcast-section">
              <h2>Add New Podcast</h2>
              <PodcastForm onSubmit={handleAddPodcast} />
            </div>

            <div className="podcast-library">
              <h2>Your Podcast Library</h2>
              {podcasts.length === 0 ? (
                <div className="empty-state">
                  <p>No podcasts yet. Add your first podcast above!</p>
                </div>
              ) : (
                <PodcastList
                  podcasts={podcasts}
                  onDelete={handleDeletePodcast}
                  onUpdate={handleUpdatePodcast}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="settings-section">
            <EmailSettings
              currentEmail={email}
              onSave={handleSaveEmail}
            />
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Powered by Claude AI & YouTube Transcripts</p>
      </footer>
    </div>
  );
}

export default App;
