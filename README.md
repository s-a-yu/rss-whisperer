# RSS Whisperer - Multi-Platform Podcast Summarizer

Automatically monitor podcasts from YouTube and Apple Podcasts, extract transcripts/content, generate AI-powered summaries using Google Gemini, and receive email digests. Features a modern web UI for easy podcast management.

## ✨ Features

### Multi-Platform Support
- **YouTube Podcasts**: Automatic transcript extraction from YouTube videos
- **Apple Podcasts**: RSS feed content extraction and summarization
- **Unified Interface**: Single web UI to manage all podcast sources

### Smart Summarization
- **AI-Powered**: Google Gemini 2.5 Flash for intelligent summaries
- **Configurable Frequency**: Set how often to check for new episodes (daily, weekly, monthly)
- **Date-Based Filtering**: Only process episodes from your specified timeframe
- **Duplicate Prevention**: SQLite database tracks processed episodes

### Modern Web Interface
- **React Frontend**: Beautiful, responsive UI for podcast management
- **Auto-Detection**: Paste any YouTube or Apple Podcasts URL - automatically detects the source
- **Express Backend**: RESTful API for podcast and settings management
- **Real-time Feedback**: Instant validation and error messages

### Automation & Monitoring
- **Terminal Output**: See summaries even if email fails
- **GitHub Actions**: Optional CI/CD and scheduled automation
- **Comprehensive Logging**: Detailed logs for debugging
- **Email Notifications**: HTML-formatted email digests

## 📋 Prerequisites

- **Python 3.11** or higher
- **Node.js 18+** (for frontend/backend)
- **Google Gemini API key** ([Get one here](https://aistudio.google.com/apikey))
- **SMTP email account** (Gmail, Outlook, etc.)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/rss-whisperer.git
cd rss-whisperer
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 5. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```bash
# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key-here

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=your-email@gmail.com

# Gemini Model
GEMINI_MODEL=gemini-2.5-flash
```

### 6. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Add Podcasts:**
Open http://localhost:5173 in your browser and add podcasts!

### 7. Run the Summarizer

```bash
./summarize
```

Or manually:
```bash
python3.11 run_summarizer.py
```

## 📚 Detailed Setup

### Getting API Keys

#### Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key to your `.env` file

#### Gmail App Password (for email)
1. Enable 2-factor authentication on your Google account
2. Go to [Google Account Settings](https://myaccount.google.com/apppasswords)
3. Generate a new app password for "Mail"
4. Use this 16-character password in `.env` (not your regular password)

### Adding Podcasts

1. Open the web UI at http://localhost:5173
2. Enter a podcast name
3. Paste a URL:
   - **YouTube**: `https://www.youtube.com/@channelname`
   - **Apple Podcasts**: `https://podcasts.apple.com/us/podcast/podcast-name/id123456789`
4. Click **Extract Info** - the system auto-detects the platform
5. Select your preferred **Summary Frequency**:
   - Daily (1 day)
   - Every 3 days
   - Weekly (7 days) - default
   - Bi-weekly (14 days)
   - Monthly (30 days)
6. Click **Add Podcast**

### Summary Frequency

The frequency setting controls how far back to look for new episodes:
- Set to **Weekly (7 days)**: Only episodes published in the last 7 days are summarized
- Run `./summarize` as often as you want - it will always check your frequency setting
- Prevents inbox spam by filtering old episodes

**Example:**
- Podcast set to "Weekly (7 days)"
- RSS feed has 100 episodes
- Only episodes from the last 7 days are processed

## 🗄️ Database Management

### View Podcasts via CLI

```bash
# View all podcasts
sqlite3 podcasts.db ".mode column" ".headers on" "SELECT id, channel_name, source, frequency_days FROM podcasts;"

# View recently processed episodes
sqlite3 podcasts.db ".mode column" ".headers on" "SELECT title, processed_at FROM processed_videos ORDER BY processed_at DESC LIMIT 10;"

# Update frequency for a podcast
sqlite3 podcasts.db "UPDATE podcasts SET frequency_days = 3 WHERE id = 1;"

# Delete a podcast
sqlite3 podcasts.db "DELETE FROM podcasts WHERE id = 1;"
```

### Database Schema

**podcasts table:**
```sql
CREATE TABLE podcasts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id TEXT,                    -- YouTube channel ID (optional for Apple Podcasts)
  channel_name TEXT NOT NULL,
  rss_url TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'youtube',      -- 'youtube' or 'apple_podcasts'
  frequency_days INTEGER DEFAULT 7,   -- How many days back to check
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**processed_videos table:**
```sql
CREATE TABLE processed_videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id TEXT NOT NULL UNIQUE,
  podcast_id INTEGER,
  title TEXT,
  url TEXT,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (podcast_id) REFERENCES podcasts(id)
);
```

## 🤖 GitHub Actions

The project includes GitHub Actions workflows for CI/CD and automation. See [.github/GITHUB_ACTIONS.md](.github/GITHUB_ACTIONS.md) for detailed setup.

### Available Workflows

1. **CI Pipeline** (`.github/workflows/ci.yml`)
   - Runs on every push/PR
   - Tests backend, frontend, and Python code
   - Security scanning with Gitleaks

2. **Scheduled Summaries** (`.github/workflows/scheduled-summary.yml`)
   - Optional: Run summaries in the cloud
   - Customizable cron schedule
   - Uses GitHub Secrets for credentials

3. **Quick Test** (`.github/workflows/test.yml`)
   - Simple validation of project structure

## 🔧 Customization

### Change the Summary Prompt

Edit the prompt in [summarizer.py:226-237](summarizer.py#L226-L237):

```python
prompt = f"""Please analyze the following video transcript from "{video_title}" and create a concise summary.

Format your summary as:
- A brief overview (2-3 sentences)
- Key points covered (bullet points)
- Main takeaways (bullet points)

Keep the summary suitable for an email digest - clear, scannable, and informative.

Transcript:
{transcript}
"""
```

### Change the Gemini Model

Update `.env`:
```bash
GEMINI_MODEL=gemini-2.5-flash  # Fast and cost-effective (recommended)
# GEMINI_MODEL=gemini-1.5-pro  # More powerful, higher cost
```

### Automated Scheduling (Cron)

Run summaries automatically every day at 9 AM:

```bash
crontab -e
```

Add:
```bash
0 9 * * * cd /path/to/rss-whisperer && /path/to/python3.11 run_summarizer.py >> /var/log/rss-whisperer.log 2>&1
```

## 🛠️ Troubleshooting

### Email Not Sending

Check:
- SMTP credentials are correct in `.env`
- Using Gmail app password (not regular password)
- Firewall allows outbound SMTP connections
- Check terminal output for error messages

**Note:** Summaries will still print to terminal even if email fails!

### No Transcripts Available (YouTube)

Some videos don't have transcripts enabled. The script will:
- Log a warning
- Mark the video as processed (to avoid repeated attempts)
- Continue with other videos

### Apple Podcasts Content Too Short

Apple Podcasts use RSS feed descriptions, which may be shorter than YouTube transcripts. This is expected - Gemini will still generate summaries from available content.

### Database Issues

Reset the database:
```bash
rm podcasts.db
rm processed_videos.db
```

Then restart the backend to recreate tables.

## 💰 Cost Considerations

### Google Gemini API
- **Gemini 2.5 Flash**: Free tier includes 1,500 requests per day
- Very cost-effective for personal use
- [Pricing details](https://ai.google.dev/pricing)

### Estimated Monthly Costs
- Small podcast collection (5 podcasts, weekly): **$0** (within free tier)
- Medium collection (20 podcasts, weekly): **~$1-2/month**
- Large collection (50+ podcasts, daily): **~$5-10/month**

## 📂 Project Structure

```
rss-whisperer/
├── backend/
│   ├── server.js              # Express API server
│   ├── apple_podcast_helper.js # Apple Podcasts URL extraction
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PodcastForm.jsx  # Add podcast form
│   │   │   └── PodcastList.jsx  # Display podcasts
│   │   └── App.jsx
│   └── package.json
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI pipeline
│       ├── scheduled-summary.yml # Automated summaries
│       └── test.yml            # Quick validation
├── run_summarizer.py          # Main summarizer script
├── summarizer.py              # Core logic (Gemini, email, transcripts)
├── requirements.txt           # Python dependencies
├── .env.example               # Environment template
├── .gitignore                 # Protect sensitive files
└── README.md
```

## 🔐 Security Best Practices

1. **Never commit sensitive data**:
   - `.env` is in `.gitignore`
   - Use `.env.example` as a template

2. **Use environment variables** for all credentials

3. **Rotate API keys** periodically

4. **Use app-specific passwords** for email

5. **Set file permissions**:
   ```bash
   chmod 600 .env
   ```

6. **GitHub Secrets**: For GitHub Actions, use repository secrets (never hardcode)

## 📖 Documentation

- [Apple Podcasts Support](APPLE_PODCASTS_SUPPORT.md) - Detailed guide for Apple Podcasts
- [GitHub Actions Setup](.github/GITHUB_ACTIONS.md) - CI/CD and automation guide

## 🆕 What's New

### v2.0 - Multi-Platform Support
- ✅ Apple Podcasts support via iTunes API
- ✅ Unified URL extraction (YouTube + Apple Podcasts)
- ✅ Configurable summary frequency per podcast
- ✅ Date-based episode filtering
- ✅ Terminal output for summaries
- ✅ Updated to Gemini 2.5 Flash

### v1.0 - Initial Release
- YouTube transcript extraction
- Claude AI summaries
- Email notifications
- Web UI for podcast management

## 🙏 Credits

Built with:
- [feedparser](https://github.com/kurtmckee/feedparser) - RSS/Atom feed parsing
- [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) - Transcript extraction
- [Google Gemini API](https://ai.google.dev/) - AI summarization
- [React](https://react.dev/) - Frontend framework
- [Express](https://expressjs.com/) - Backend server
- [SQLite](https://www.sqlite.org/) - Database

## 📄 License

This project is provided as-is for educational and personal use.

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 💬 Support

For issues or questions:
1. Check the logs in `summarizer.log`
2. Review the [Troubleshooting](#-troubleshooting) section
3. Open a GitHub issue with:
   - Description of the problem
   - Relevant log output
   - Steps to reproduce
