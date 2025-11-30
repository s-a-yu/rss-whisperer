# RSS Whisperer - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js (v18 or higher)
- Python 3.7+
- Anthropic API key
- SMTP email credentials (Gmail, etc.)

## Step 1: Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Step 2: Configure API Keys

Create a configuration file for the Python script:

```bash
cp .env.example .env
```

Edit `.env` and add:
- Your Anthropic API key
- SMTP email settings (host, port, username, password)
- Email FROM address

**Note**: You'll set your email recipient and podcast subscriptions through the web UI!

## Step 3: Start the Application

### Option A: Using the Startup Script (Recommended)

```bash
./start.sh
```

This starts both backend and frontend automatically!

### Option B: Manual Start

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

## Step 4: Use the Web Interface

1. Open your browser to: **http://localhost:5173**

2. **Set your email address:**
   - Click "Email Settings" tab
   - Enter your email
   - Click "Save Email"

3. **Add a podcast:**
   - Go to "Podcasts" tab
   - Enter channel name (e.g., "Lex Fridman Podcast")
   - Enter YouTube channel ID (e.g., "UCSHZKyawb77ixDdsGog4iWA")
   - Click "Add Podcast"

## Step 5: Run the Summarizer

Once you've added podcasts and set your email, run:

```bash
python run_summarizer.py
```

This will:
- Check all your podcast RSS feeds
- Find new videos
- Extract transcripts
- Generate summaries with Claude AI
- Email them to you!

## Finding YouTube Channel IDs

**Method 1: View Page Source**
1. Go to any YouTube channel page
2. Right-click → "View Page Source"
3. Search (Ctrl+F) for "channelId"
4. Copy the ID (looks like `UCxxxxxxxxxxxxxx`)

**Method 2: Channel URL**
- If URL is `youtube.com/channel/UCxxxxxx` → ID is `UCxxxxxx`
- If URL is `youtube.com/@username` → Use Method 1

## Automating with Cron

To check for new podcasts every hour:

```bash
crontab -e
```

Add this line (adjust path):
```
0 * * * * cd /path/to/rss-whisperer && /usr/bin/python3 run_summarizer.py
```

## Troubleshooting

**"No email configured"**
- Set your email in the web interface (Email Settings tab)

**"No podcasts configured"**
- Add podcasts in the web interface (Podcasts tab)

**"Database not found"**
- Start the backend server first - it creates the database automatically

**Frontend won't connect to backend**
- Make sure backend is running on port 3001
- Check http://localhost:3001/api/health

## What's Next?

- Add more podcasts to your library
- Edit or remove existing subscriptions
- Check the logs: `tail -f summarizer.log`
- View processed videos in the database

## File Overview

- `run_summarizer.py` - Use this (reads from database)
- `summarizer.py` - Original standalone version
- `backend/server.js` - API server
- `frontend/src/App.jsx` - React UI

## Getting Help

1. Check logs: `summarizer.log`
2. Test API: `curl http://localhost:3001/api/health`
3. Check database: `sqlite3 podcasts.db "SELECT * FROM podcasts;"`

## Example Workflow

```bash
# 1. Start services
./start.sh

# 2. Open browser → http://localhost:5173
# 3. Add email and podcasts in UI

# 4. In a new terminal, run summarizer
python run_summarizer.py

# 5. Check your email for summaries!
```

That's it! You're now automatically receiving AI-powered podcast summaries.
