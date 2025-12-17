const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { getChannelId } = require('./channel_helper');
const { getPodcastInfo, getApplePodcastRss } = require('./apple_podcast_helper');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, '..', 'podcasts.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Podcasts/Channels table
  db.run(`
    CREATE TABLE IF NOT EXISTS podcasts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id TEXT,
      channel_name TEXT NOT NULL,
      rss_url TEXT NOT NULL UNIQUE,
      source TEXT DEFAULT 'youtube',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migrate existing table: add source column if it doesn't exist
  db.run(`
    ALTER TABLE podcasts ADD COLUMN source TEXT DEFAULT 'youtube'
  `, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Migration warning:', err.message);
    }
  });

  // User settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT NOT NULL UNIQUE,
      setting_value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Processed videos table (same as before)
  db.run(`
    CREATE TABLE IF NOT EXISTS processed_videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id TEXT NOT NULL UNIQUE,
      podcast_id INTEGER,
      title TEXT,
      url TEXT,
      processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (podcast_id) REFERENCES podcasts(id)
    )
  `);
});

// ============== API ROUTES ==============

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// ============== PODCASTS ROUTES ==============

// Unified endpoint: Extract podcast info from URL (YouTube or Apple Podcasts)
app.post('/api/extract-podcast-info', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Detect URL type and extract info
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // YouTube URL
      const result = await getChannelId(url);
      if (result.success) {
        // Generate RSS URL for YouTube
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${result.channelId}`;
        res.json({
          success: true,
          source: 'youtube',
          channelId: result.channelId,
          rssUrl: rssUrl
        });
      } else {
        res.json(result);
      }
    } else if (url.includes('podcasts.apple.com')) {
      // Apple Podcasts URL
      const result = await getApplePodcastRss(url);
      if (result.success) {
        res.json({
          success: true,
          source: 'apple_podcasts',
          rssUrl: result.feedUrl,
          podcastName: result.podcastName,
          artist: result.artist,
          artwork: result.artwork
        });
      } else {
        res.json(result);
      }
    } else {
      res.json({
        success: false,
        error: 'Unsupported URL format',
        suggestion: 'Please provide a YouTube channel URL or Apple Podcasts URL'
      });
    }
  } catch (error) {
    console.error('Error extracting podcast info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to extract podcast info',
      details: error.message
    });
  }
});

// Legacy endpoint: Extract channel ID from YouTube URL (backward compatibility)
app.post('/api/extract-channel-id', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const result = await getChannelId(url);
    res.json(result);
  } catch (error) {
    console.error('Error extracting channel ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to extract channel ID',
      details: error.message
    });
  }
});

// Get all podcasts
app.get('/api/podcasts', (req, res) => {
  db.all('SELECT * FROM podcasts ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching podcasts:', err);
      return res.status(500).json({ error: 'Failed to fetch podcasts' });
    }
    res.json(rows);
  });
});

// Get single podcast
app.get('/api/podcasts/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM podcasts WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching podcast:', err);
      return res.status(500).json({ error: 'Failed to fetch podcast' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Podcast not found' });
    }
    res.json(row);
  });
});

// Add new podcast
app.post('/api/podcasts', (req, res) => {
  const { channel_id, channel_name, rss_url, source, frequency_days } = req.body;

  // channel_id is optional for Apple Podcasts
  if (!channel_name || !rss_url) {
    return res.status(400).json({
      error: 'Missing required fields: channel_name, rss_url'
    });
  }

  const podcastSource = source || 'youtube';
  const frequencyDays = frequency_days || 7; // Default to 7 days

  const stmt = db.prepare(`
    INSERT INTO podcasts (channel_id, channel_name, rss_url, source, frequency_days)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(channel_id || null, channel_name, rss_url, podcastSource, frequencyDays, function(err) {
    if (err) {
      console.error('Error adding podcast:', err);
      if (err.message.includes('UNIQUE')) {
        return res.status(409).json({ error: 'Podcast already exists' });
      }
      return res.status(500).json({ error: 'Failed to add podcast' });
    }

    res.status(201).json({
      id: this.lastID,
      channel_id,
      channel_name,
      rss_url,
      source: podcastSource,
      message: 'Podcast added successfully'
    });
  });

  stmt.finalize();
});

// Update podcast
app.put('/api/podcasts/:id', (req, res) => {
  const { id } = req.params;
  const { channel_name, rss_url } = req.body;

  if (!channel_name && !rss_url) {
    return res.status(400).json({
      error: 'At least one field (channel_name or rss_url) is required'
    });
  }

  const updates = [];
  const values = [];

  if (channel_name) {
    updates.push('channel_name = ?');
    values.push(channel_name);
  }
  if (rss_url) {
    updates.push('rss_url = ?');
    values.push(rss_url);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const sql = `UPDATE podcasts SET ${updates.join(', ')} WHERE id = ?`;

  db.run(sql, values, function(err) {
    if (err) {
      console.error('Error updating podcast:', err);
      return res.status(500).json({ error: 'Failed to update podcast' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    res.json({ message: 'Podcast updated successfully' });
  });
});

// Delete podcast
app.delete('/api/podcasts/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM podcasts WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting podcast:', err);
      return res.status(500).json({ error: 'Failed to delete podcast' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    res.json({ message: 'Podcast deleted successfully' });
  });
});

// ============== USER SETTINGS ROUTES ==============

// Get all settings
app.get('/api/settings', (req, res) => {
  db.all('SELECT * FROM user_settings', (err, rows) => {
    if (err) {
      console.error('Error fetching settings:', err);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }

    // Convert to key-value object
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    res.json(settings);
  });
});

// Get specific setting
app.get('/api/settings/:key', (req, res) => {
  const { key } = req.params;

  db.get('SELECT * FROM user_settings WHERE setting_key = ?', [key], (err, row) => {
    if (err) {
      console.error('Error fetching setting:', err);
      return res.status(500).json({ error: 'Failed to fetch setting' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ key: row.setting_key, value: row.setting_value });
  });
});

// Set/Update setting
app.post('/api/settings', (req, res) => {
  const { key, value } = req.body;

  if (!key || !value) {
    return res.status(400).json({ error: 'Missing required fields: key, value' });
  }

  const stmt = db.prepare(`
    INSERT INTO user_settings (setting_key, setting_value)
    VALUES (?, ?)
    ON CONFLICT(setting_key)
    DO UPDATE SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
  `);

  stmt.run(key, value, value, function(err) {
    if (err) {
      console.error('Error saving setting:', err);
      return res.status(500).json({ error: 'Failed to save setting' });
    }

    res.json({
      message: 'Setting saved successfully',
      key,
      value
    });
  });

  stmt.finalize();
});

// Delete setting
app.delete('/api/settings/:key', (req, res) => {
  const { key } = req.params;

  db.run('DELETE FROM user_settings WHERE setting_key = ?', [key], function(err) {
    if (err) {
      console.error('Error deleting setting:', err);
      return res.status(500).json({ error: 'Failed to delete setting' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ message: 'Setting deleted successfully' });
  });
});

// ============== PROCESSED VIDEOS ROUTES ==============

// Get processed videos (optionally filter by podcast)
app.get('/api/processed-videos', (req, res) => {
  const { podcast_id } = req.query;

  let sql = `
    SELECT pv.*, p.channel_name
    FROM processed_videos pv
    LEFT JOIN podcasts p ON pv.podcast_id = p.id
    ORDER BY pv.processed_at DESC
  `;

  const params = [];

  if (podcast_id) {
    sql = `
      SELECT pv.*, p.channel_name
      FROM processed_videos pv
      LEFT JOIN podcasts p ON pv.podcast_id = p.id
      WHERE pv.podcast_id = ?
      ORDER BY pv.processed_at DESC
    `;
    params.push(podcast_id);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error fetching processed videos:', err);
      return res.status(500).json({ error: 'Failed to fetch processed videos' });
    }
    res.json(rows);
  });
});

// ============== SERVER START ==============

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Database: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    }
    console.log('\nDatabase connection closed');
    process.exit(0);
  });
});
