# RSS Whisperer - Frontend & Backend Setup Guide

Complete guide for setting up the RSS Whisperer web application with React frontend and Express backend.

## Architecture Overview

The project consists of three main components:

1. **Frontend (React + Vite)**: Web UI for managing podcasts and email settings
2. **Backend (Express + SQLite)**: REST API for data management
3. **Python Summarizer**: Automated script that processes RSS feeds and sends summaries

## Project Structure

```
rss-whisperer/
├── frontend/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   └── package.json
│
├── backend/              # Express API server
│   ├── server.js         # API routes and logic
│   └── package.json
│
├── summarizer.py         # Python automation script
├── requirements.txt      # Python dependencies
├── config.json.example   # Config template
└── .env.example          # Environment variables template
```

## Quick Start

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Python Dependencies

```bash
# From project root
pip install -r requirements.txt
```

### 4. Start the Backend Server

```bash
cd backend
npm start
```

The API server will start on `http://localhost:3001`

### 5. Start the Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### 6. Configure Python Script

1. Set up your configuration (see Configuration section below)
2. The Python script will use the email from the database set via the frontend

## Configuration

### Backend Configuration

The backend automatically creates a SQLite database (`podcasts.db`) with these tables:

- **podcasts**: Stores podcast/channel subscriptions
- **user_settings**: Stores user preferences (email, etc.)
- **processed_videos**: Tracks which videos have been processed

No additional configuration needed for the backend!

### Frontend Configuration

The frontend connects to the backend API at `http://localhost:3001` by default.

To change the API URL, edit [frontend/src/App.jsx:7](frontend/src/App.jsx#L7):

```javascript
const API_URL = 'http://localhost:3001/api';
```

### Python Script Configuration

The Python script needs API credentials. You can use either method:

#### Option A: Environment Variables

```bash
cp .env.example .env
# Edit .env with your values
export $(cat .env | xargs)
python summarizer.py
```

#### Option B: Config File

```bash
cp config.json.example config.json
# Edit config.json with your values
python summarizer.py
```

**Important**: The Python script will read the email address from the database (set via the frontend), but you still need to configure SMTP settings for sending emails.

## Using the Application

### 1. Set Your Email Address

1. Open the frontend: `http://localhost:5173`
2. Click "Email Settings" tab
3. Enter your email address
4. Click "Save Email"

### 2. Add Podcast Subscriptions

1. Go to "Podcasts" tab
2. Fill in the form:
   - **Podcast Name**: e.g., "Lex Fridman Podcast"
   - **Channel ID**: e.g., "UCSHZKyawb77ixDdsGog4iWA"
   - RSS URL is auto-generated
3. Click "Add Podcast"

### 3. Find YouTube Channel IDs

**Method 1: From Channel Page**
1. Go to the YouTube channel
2. Right-click → "View Page Source"
3. Search for "channelId"
4. Copy the ID (e.g., `UCxxxxxxxxxxxxxx`)

**Method 2: From Channel URL**
- If URL is `youtube.com/channel/UCxxxxxx`, the ID is `UCxxxxxx`
- If URL is `youtube.com/@username`, use Method 1

### 4. Manage Your Podcasts

**View All Podcasts**: Displayed in the library section

**Edit a Podcast**:
- Click "Edit" button
- Modify channel name or RSS URL
- Click "Save"

**Delete a Podcast**:
- Click "Delete" button
- Confirm deletion

### 5. Run the Automation Script

The Python script checks for new videos and sends summaries:

```bash
python summarizer.py
```

**Manual Testing**:
```bash
# Run once to test
python summarizer.py

# Check the logs
tail -f summarizer.log
```

**Automated Scheduling** (every hour):
```bash
crontab -e

# Add this line:
0 * * * * cd /path/to/rss-whisperer && /usr/bin/python3 summarizer.py
```

## API Endpoints

The backend provides these REST API endpoints:

### Podcasts

- `GET /api/podcasts` - Get all podcasts
- `GET /api/podcasts/:id` - Get single podcast
- `POST /api/podcasts` - Add new podcast
- `PUT /api/podcasts/:id` - Update podcast
- `DELETE /api/podcasts/:id` - Delete podcast

### Settings

- `GET /api/settings` - Get all settings
- `GET /api/settings/:key` - Get specific setting
- `POST /api/settings` - Set/update setting
- `DELETE /api/settings/:key` - Delete setting

### Processed Videos

- `GET /api/processed-videos` - Get all processed videos
- `GET /api/processed-videos?podcast_id=X` - Filter by podcast

## Development

### Frontend Development

```bash
cd frontend
npm run dev    # Start dev server with HMR
npm run build  # Build for production
npm run preview # Preview production build
```

### Backend Development

```bash
cd backend
npm run dev    # Start with nodemon (auto-restart)
npm start      # Start normally
```

### Modifying the Python Script

The script reads podcasts from the database automatically. To integrate:

1. **Get all podcasts**:
```python
import sqlite3
conn = sqlite3.connect('podcasts.db')
cursor = conn.cursor()
cursor.execute('SELECT * FROM podcasts')
podcasts = cursor.fetchall()
```

2. **Get email setting**:
```python
cursor.execute("SELECT setting_value FROM user_settings WHERE setting_key = 'email'")
email = cursor.fetchone()[0]
```

## Production Deployment

### Build Frontend

```bash
cd frontend
npm run build
```

The build output will be in `frontend/dist/`

### Serve Frontend

Option 1: Use a static file server
```bash
npm install -g serve
serve -s frontend/dist -p 3000
```

Option 2: Serve from Express
```javascript
// In backend/server.js
app.use(express.static(path.join(__dirname, '../frontend/dist')));
```

### Deploy Backend

```bash
cd backend
npm start
```

Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name rss-whisperer-api
pm2 save
pm2 startup
```

### Schedule Python Script

Use cron for Linux/Mac or Task Scheduler for Windows.

## Troubleshooting

### Frontend can't connect to backend

**Problem**: API requests fail with CORS errors

**Solution**:
1. Ensure backend is running on port 3001
2. Check CORS is enabled in [backend/server.js:9](backend/server.js#L9)
3. Verify API_URL in frontend matches backend URL

### Database not found

**Problem**: `podcasts.db` not found

**Solution**:
1. Start the backend server first - it creates the database automatically
2. Check you're in the correct directory

### Email not sending from Python script

**Problem**: Python script can't send emails

**Solution**:
1. Configure SMTP settings in `.env` or `config.json`
2. For Gmail, use app-specific password
3. Check SMTP credentials are correct
4. Ensure email is set in the frontend UI

### No podcasts showing up

**Problem**: Podcasts added but not visible

**Solution**:
1. Check browser console for errors
2. Verify backend is running
3. Check database: `sqlite3 podcasts.db "SELECT * FROM podcasts;"`

## Security Notes

1. **Never commit sensitive files**:
   - `config.json` (contains API keys)
   - `.env` (contains credentials)
   - `*.db` (database files)

2. **Use `.gitignore`**: Already configured to exclude sensitive files

3. **Use environment variables** in production

4. **Secure your API**: Consider adding authentication for production use

## Cost Estimation

- **Frontend/Backend**: Free (self-hosted)
- **Claude API**: ~$0.01-0.05 per month (1 video/day with Haiku)
- **Email**: Free for most SMTP providers

## Next Steps

1. **Add Authentication**: Protect the frontend with login
2. **Multi-User Support**: Allow multiple users with separate accounts
3. **Notification Preferences**: Let users customize summary format
4. **Webhook Integration**: Add Slack, Discord notifications
5. **Analytics Dashboard**: Track video processing stats

## Support

If you encounter issues:

1. Check the logs:
   - Frontend: Browser console
   - Backend: Terminal output
   - Python: `summarizer.log`

2. Verify all services are running:
   ```bash
   # Backend should be on port 3001
   curl http://localhost:3001/api/health

   # Frontend should be on port 5173 (dev)
   curl http://localhost:5173
   ```

3. Check database contents:
   ```bash
   sqlite3 podcasts.db
   .tables
   SELECT * FROM podcasts;
   SELECT * FROM user_settings;
   .quit
   ```

## License

MIT License - Feel free to use and modify!
