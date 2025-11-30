# RSS Whisperer - Complete Project Summary

## Overview

RSS Whisperer is a full-stack web application that automatically monitors YouTube podcast channels, extracts video transcripts, generates AI-powered summaries using Claude, and emails them to users.

## Architecture

### Three-Tier Application

1. **Frontend (React + Vite)**
   - Modern, responsive web UI
   - Manage podcast subscriptions
   - Configure email settings
   - View library of subscribed podcasts

2. **Backend (Express + SQLite)**
   - RESTful API server
   - SQLite database for data persistence
   - CRUD operations for podcasts and settings
   - Track processed videos

3. **Python Automation Script**
   - Monitors RSS feeds
   - Extracts transcripts via YouTube API
   - Generates summaries via Claude API
   - Sends email notifications
   - Integrates with web app database

## Project Structure

```
rss-whisperer/
│
├── Frontend (React)
│   ├── src/
│   │   ├── App.jsx                    # Main app component
│   │   ├── App.css                    # Global styles
│   │   ├── components/
│   │   │   ├── PodcastForm.jsx        # Add new podcasts
│   │   │   ├── PodcastForm.css
│   │   │   ├── PodcastList.jsx        # Display/manage podcasts
│   │   │   ├── PodcastList.css
│   │   │   ├── EmailSettings.jsx      # Configure email
│   │   │   └── EmailSettings.css
│   │   ├── main.jsx                   # App entry point
│   │   └── index.css                  # Base styles
│   ├── package.json
│   └── vite.config.js
│
├── Backend (Express)
│   ├── server.js                      # API routes & logic
│   └── package.json
│
├── Python Scripts
│   ├── summarizer.py                  # Original standalone script
│   ├── run_summarizer.py              # Database-integrated version
│   └── requirements.txt               # Python dependencies
│
├── Configuration
│   ├── config.json.example            # Config template
│   ├── .env.example                   # Environment variables template
│   └── .gitignore                     # Excluded files
│
├── Documentation
│   ├── README.md                      # Python script documentation
│   ├── FRONTEND_README.md             # Full stack setup guide
│   ├── QUICKSTART.md                  # 5-minute setup guide
│   └── PROJECT_SUMMARY.md             # This file
│
└── Utilities
    └── start.sh                       # Startup script for dev
```

## Database Schema

### SQLite Database: `podcasts.db`

**Table: podcasts**
```sql
CREATE TABLE podcasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT NOT NULL UNIQUE,
    channel_name TEXT NOT NULL,
    rss_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Table: user_settings**
```sql
CREATE TABLE user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Table: processed_videos**
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

## API Endpoints

### Podcasts
- `GET /api/podcasts` - List all podcasts
- `GET /api/podcasts/:id` - Get single podcast
- `POST /api/podcasts` - Add new podcast
- `PUT /api/podcasts/:id` - Update podcast
- `DELETE /api/podcasts/:id` - Delete podcast

### Settings
- `GET /api/settings` - Get all settings (returns key-value object)
- `GET /api/settings/:key` - Get specific setting
- `POST /api/settings` - Set/update setting (upsert)
- `DELETE /api/settings/:key` - Delete setting

### Processed Videos
- `GET /api/processed-videos` - List all processed videos
- `GET /api/processed-videos?podcast_id=X` - Filter by podcast

### Health Check
- `GET /api/health` - Check if API is running

## Key Features

### Frontend Features
✅ Add podcast subscriptions with YouTube Channel ID
✅ Auto-generate RSS URLs from Channel IDs
✅ Edit existing podcast names and URLs
✅ Delete podcasts with confirmation
✅ View complete podcast library
✅ Configure email address for notifications
✅ Tabbed interface (Podcasts / Settings)
✅ Responsive design for mobile/desktop
✅ Form validation and error handling
✅ Success/error messages
✅ Loading states

### Backend Features
✅ RESTful API architecture
✅ SQLite database with auto-initialization
✅ CORS enabled for frontend communication
✅ Comprehensive error handling
✅ Upsert operations for settings
✅ Foreign key relationships
✅ Graceful shutdown handling
✅ Request logging

### Python Script Features
✅ RSS feed parsing (feedparser)
✅ YouTube transcript extraction
✅ Claude AI integration for summaries
✅ HTML + plain text email formatting
✅ Duplicate prevention via database
✅ Comprehensive logging
✅ Error recovery (continues on failure)
✅ Multiple podcast support
✅ Database integration (reads from web UI)
✅ Flexible configuration (env vars or config file)

## Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool & dev server
- **CSS3** - Styling (no framework)
- **Fetch API** - HTTP requests

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **SQLite3** - Database
- **CORS** - Cross-origin support

### Python Automation
- **feedparser** - RSS/Atom parsing
- **youtube-transcript-api** - Transcript extraction
- **anthropic** - Claude AI SDK
- **smtplib** - Email sending
- **sqlite3** - Database access

## Workflow

### User Workflow
1. User opens web UI (http://localhost:5173)
2. Sets email address in "Email Settings" tab
3. Adds podcast subscriptions in "Podcasts" tab
4. Runs `python run_summarizer.py` (manually or via cron)
5. Receives email summaries for new podcast episodes

### Data Flow
```
YouTube RSS Feed
    ↓
Python Script (run_summarizer.py)
    ↓
Read podcasts from SQLite DB ← Backend API ← React Frontend
    ↓
Extract transcript (YouTube API)
    ↓
Generate summary (Claude API)
    ↓
Send email (SMTP)
    ↓
Mark as processed in DB
```

## Configuration Requirements

### Required API Keys
- **Anthropic API Key** - For Claude AI summaries
- **SMTP Credentials** - For email sending

### User Inputs (via Web UI)
- **Email Address** - Where to send summaries
- **Podcast Subscriptions** - Channel IDs and names

### Optional Settings
- Claude model selection (defaults to Haiku)
- Database path (defaults to `podcasts.db`)

## Development Setup

### Install Dependencies
```bash
# Python
pip install -r requirements.txt

# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Start Development Servers
```bash
# Option 1: Use startup script
./start.sh

# Option 2: Manual
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev
```

### Access Points
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/api/health

## Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### Deploy Backend
```bash
cd backend
npm install --production
npm start

# Or use PM2
pm2 start server.js --name rss-whisperer-api
```

### Schedule Python Script
```bash
# Cron (every hour)
0 * * * * cd /path/to/rss-whisperer && python3 run_summarizer.py

# Or use systemd timer, Windows Task Scheduler, etc.
```

## Security Considerations

### Sensitive Files (Excluded from Git)
- `config.json` - Contains API keys
- `.env` - Contains credentials
- `*.db` - Database files with user data
- `*.log` - May contain sensitive info

### Best Practices
✅ Environment variables for secrets
✅ `.gitignore` configured
✅ No hardcoded credentials
✅ App-specific passwords for email
✅ API key rotation recommended

## Cost Analysis

### Free Tier
- Frontend/Backend hosting (self-hosted)
- YouTube Transcript API (unlimited)

### Paid Services
- **Anthropic Claude API**
  - Haiku: ~$0.25 per 1M input tokens
  - Estimated: $0.01-0.05/month for 1 video/day

- **Email (SMTP)**
  - Gmail: Free for personal use
  - Commercial: Varies by provider

### Total Estimated Cost
**~$0.01-0.05 per month** for typical personal use

## Use Cases

### Personal Use
- Track favorite YouTube podcasts/channels
- Get AI summaries delivered to inbox
- Stay updated without watching full videos
- Multiple channel management

### Professional Use
- Monitor industry channels
- Competitive research
- Content curation
- News aggregation

### Educational Use
- Track educational channels
- Course updates
- Research topic monitoring

## Extensibility

### Easy Additions
- Multiple email recipients
- Webhook notifications (Slack, Discord)
- Custom summary formats
- Video filtering (by title, length, etc.)
- RSS feed scheduling per podcast
- Summary archives/search
- Mobile app (React Native)

### Architecture Supports
- Multi-user authentication
- User accounts with separate libraries
- API rate limiting
- Caching layer
- Microservices separation
- Cloud deployment (AWS, Vercel, etc.)

## Testing

### Manual Testing Checklist
- [ ] Add a podcast via web UI
- [ ] Edit podcast details
- [ ] Delete a podcast
- [ ] Set email address
- [ ] Run summarizer script
- [ ] Verify email received
- [ ] Check database for processed videos
- [ ] Test with multiple podcasts

### API Testing
```bash
# Health check
curl http://localhost:3001/api/health

# Get podcasts
curl http://localhost:3001/api/podcasts

# Get settings
curl http://localhost:3001/api/settings
```

## Troubleshooting Guide

### Common Issues

**Frontend can't connect to backend**
- Verify backend is running on port 3001
- Check CORS configuration
- Verify API_URL in App.jsx

**No email in database**
- Set email in web UI first
- Check: `sqlite3 podcasts.db "SELECT * FROM user_settings;"`

**Transcript not found**
- Some videos don't have transcripts
- Script marks as processed to avoid retrying
- Check logs for details

**Email not sending**
- Verify SMTP credentials
- Use app-specific password (Gmail)
- Check firewall allows SMTP

## Future Enhancements

### Planned Features
- [ ] User authentication
- [ ] Multi-user support
- [ ] Notification preferences (Slack, Discord)
- [ ] Summary customization
- [ ] Video filtering options
- [ ] Analytics dashboard
- [ ] Mobile responsive improvements
- [ ] Dark mode
- [ ] Export summaries (PDF, Markdown)
- [ ] RSS feed for summaries

### Technical Improvements
- [ ] Unit tests (Jest, Pytest)
- [ ] E2E tests (Playwright)
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Database migrations
- [ ] API documentation (Swagger)
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)

## License

MIT License - Free for personal and commercial use

## Credits

**Built with:**
- React & Vite
- Express.js & SQLite
- Anthropic Claude AI
- YouTube Transcript API
- Modern web technologies

## Support & Documentation

### Quick Reference
- **5-minute setup**: See [QUICKSTART.md](QUICKSTART.md)
- **Full setup guide**: See [FRONTEND_README.md](FRONTEND_README.md)
- **Python script docs**: See [README.md](README.md)
- **This overview**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

### Getting Help
1. Check the logs (`summarizer.log`, browser console, terminal)
2. Verify services are running
3. Test database contents
4. Review configuration files

### File Descriptions

**Core Application Files:**
- `run_summarizer.py` - Main script (use this!)
- `backend/server.js` - API server
- `frontend/src/App.jsx` - React UI

**Configuration:**
- `.env` or `config.json` - Your credentials (create from examples)
- `config.json.example` - Template
- `.env.example` - Template

**Utilities:**
- `start.sh` - Startup script
- `.gitignore` - Git exclusions

**Documentation:**
- `QUICKSTART.md` - Fast setup
- `FRONTEND_README.md` - Detailed guide
- `PROJECT_SUMMARY.md` - This file

## Conclusion

RSS Whisperer is a complete, production-ready application that bridges YouTube content consumption with AI-powered summarization. The modular architecture allows for easy customization and extension while maintaining simplicity for personal use.

**Ready to start?** → See [QUICKSTART.md](QUICKSTART.md)
