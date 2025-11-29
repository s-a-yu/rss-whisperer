# YouTube Podcast Episode Summarizer

Automatically monitor a YouTube channel's RSS feed, extract video transcripts, generate AI-powered summaries using Claude, and email the results.

## Features

- **RSS Feed Monitoring**: Checks YouTube channel RSS feeds for new videos
- **Transcript Extraction**: Automatically fetches English transcripts using YouTube's API
- **AI Summarization**: Generates concise, bullet-point summaries using Claude AI
- **Email Notifications**: Sends formatted email digests with video summaries
- **Duplicate Prevention**: SQLite database tracks processed videos to prevent duplicates
- **Comprehensive Logging**: Detailed logs for monitoring and debugging
- **Flexible Configuration**: Supports both environment variables and config files

## Prerequisites

- Python 3.7 or higher
- Anthropic API key ([Get one here](https://console.anthropic.com/))
- SMTP email account (Gmail, Outlook, etc.)
- YouTube channel RSS URL

## Installation

### 1. Clone or download this repository

```bash
cd rss-whisperer
```

### 2. Install required dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure the application

You can use either **environment variables** (recommended for production) or a **config.json file** (easier for development).

#### Option A: Using Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your credentials:
```bash
# Required values
ANTHROPIC_API_KEY=sk-ant-xxxxx
YOUTUBE_RSS_URL=https://www.youtube.com/feeds/videos.xml?channel_id=YOUR_CHANNEL_ID
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=recipient@example.com
```

3. Load environment variables before running:
```bash
export $(cat .env | xargs)
```

Or use a tool like [python-dotenv](https://pypi.org/project/python-dotenv/).

#### Option B: Using config.json

1. Copy the example config file:
```bash
cp config.json.example config.json
```

2. Edit `config.json` with your actual values:
```json
{
  "anthropic_api_key": "sk-ant-xxxxx",
  "youtube_rss_url": "https://www.youtube.com/feeds/videos.xml?channel_id=YOUR_CHANNEL_ID",
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "smtp_username": "your-email@gmail.com",
  "smtp_password": "your-app-password",
  "email_from": "your-email@gmail.com",
  "email_to": "recipient@example.com"
}
```

**Note:** Environment variables take precedence over config.json values.

## Configuration Details

### Getting Your YouTube Channel RSS URL

YouTube RSS feeds follow this format:
```
https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID
```

To find a channel ID:
1. Go to the YouTube channel page
2. View page source (right-click → View Page Source)
3. Search for "channelId"
4. Copy the ID (e.g., `UCxxxxxxxxxxxxxx`)

### Email Configuration (Gmail Example)

For Gmail, you need to use an **App Password** (not your regular password):

1. Enable 2-factor authentication on your Google account
2. Go to [Google Account Settings](https://myaccount.google.com/security)
3. Select "App passwords" under "2-Step Verification"
4. Generate a new app password for "Mail"
5. Use this password in your configuration

For other email providers:
- **Outlook/Hotmail**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **Custom SMTP**: Check your provider's documentation

### Anthropic API Key

1. Sign up at [Anthropic Console](https://console.anthropic.com/)
2. Navigate to API Keys
3. Create a new API key
4. Copy and save it securely

## Usage

### Run the script manually

```bash
python summarizer.py
```

The script will:
1. Check the YouTube RSS feed for new videos
2. Skip any videos already in the database
3. Extract transcripts for new videos
4. Generate summaries using Claude AI
5. Email the summaries
6. Update the database to prevent duplicates

### Automated Scheduling (Cron Job)

To run the script automatically every hour:

1. Open crontab editor:
```bash
crontab -e
```

2. Add this line (adjust path as needed):
```bash
0 * * * * cd /path/to/rss-whisperer && /usr/bin/python3 summarizer.py >> /path/to/logs/cron.log 2>&1
```

This runs the script at the top of every hour.

**Other scheduling examples:**
```bash
# Every 30 minutes
*/30 * * * * cd /path/to/rss-whisperer && /usr/bin/python3 summarizer.py

# Every day at 8 AM
0 8 * * * cd /path/to/rss-whisperer && /usr/bin/python3 summarizer.py

# Every 6 hours
0 */6 * * * cd /path/to/rss-whisperer && /usr/bin/python3 summarizer.py
```

## Database

The script automatically creates a SQLite database (`processed_videos.db`) to track processed videos.

### Database Schema

```sql
CREATE TABLE processed_videos (
    video_id TEXT PRIMARY KEY,
    title TEXT,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    url TEXT
);
```

### View processed videos

```bash
sqlite3 processed_videos.db "SELECT * FROM processed_videos;"
```

### Reset the database (process all videos again)

```bash
rm processed_videos.db
```

## Logging

Logs are written to:
- **Console output** (stdout)
- **summarizer.log** file in the same directory

Log format:
```
2025-01-15 10:30:45 - INFO - Processing new video: Example Video Title (abc123)
2025-01-15 10:30:48 - INFO - Successfully extracted transcript for video abc123
2025-01-15 10:30:52 - INFO - Successfully generated summary for 'Example Video Title'
2025-01-15 10:30:54 - INFO - Email sent successfully for video: Example Video Title
```

## Troubleshooting

### No transcript available

Some videos don't have transcripts enabled. The script will:
- Log a warning
- Mark the video as processed (to avoid repeated attempts)
- Continue with other videos

### Email sending fails

Check:
- SMTP credentials are correct
- Using app-specific password (for Gmail)
- SMTP host and port are correct
- Firewall allows outbound SMTP connections

### API rate limits

The Claude API has rate limits. If you process many videos:
- Consider using a paid plan for higher limits
- Add delays between API calls if needed
- Check [Anthropic's rate limit documentation](https://docs.anthropic.com/claude/reference/rate-limits)

### Videos aren't being detected

- Verify the RSS URL is correct
- Check that the channel has recent videos
- Look at `summarizer.log` for parsing errors

## Security Best Practices

1. **Never commit sensitive data** to version control:
   - Add `config.json` and `.env` to `.gitignore`
   - Use `.example` files for templates

2. **Use environment variables** in production environments

3. **Rotate API keys** periodically

4. **Use app-specific passwords** for email services

5. **Set appropriate file permissions**:
```bash
chmod 600 config.json
chmod 600 .env
```

## Cost Considerations

- **Anthropic API**: Claude Haiku is cost-effective (~$0.25 per 1M input tokens)
- **YouTube API**: The transcript API is free (no quota limits)
- **Email**: Free for most personal SMTP usage

Estimated cost for a channel with 1 video per day:
- ~$0.01-0.05 per month (depending on transcript length)

## Customization

### Change the Claude model

Edit your config to use a different model:
```json
{
  "claude_model": "claude-3-5-sonnet-20241022"
}
```

Available models:
- `claude-3-haiku-20240307` (fast, cheap)
- `claude-3-5-sonnet-20241022` (balanced)
- `claude-3-opus-20240229` (powerful, expensive)

### Customize the summary prompt

Edit the `generate_summary()` method in [summarizer.py:199-207](summarizer.py#L199-L207) to change how summaries are formatted.

### Process multiple channels

Run multiple instances with different config files:
```bash
python summarizer.py --config channel1.json
python summarizer.py --config channel2.json
```

(Note: You would need to modify the script to accept a `--config` argument)

## License

This project is provided as-is for educational and personal use.

## Support

For issues or questions:
1. Check the logs in `summarizer.log`
2. Review the troubleshooting section
3. Ensure all configuration values are correct
4. Test each component individually (RSS parsing, transcript extraction, email sending)

## Credits

Built with:
- [feedparser](https://github.com/kurtmckee/feedparser) - RSS/Atom feed parsing
- [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) - Transcript extraction
- [Anthropic Claude API](https://www.anthropic.com/) - AI summarization
