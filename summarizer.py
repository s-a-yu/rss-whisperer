#!/usr/bin/env python3
"""
YouTube Podcast Episode Summarizer
Monitors a YouTube RSS feed, extracts transcripts, summarizes with Claude AI, and emails results.
"""

import os
import sys
import json
import sqlite3
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from pathlib import Path

# Try to load .env file if python-dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # python-dotenv not installed, environment variables must be set manually
    pass

import feedparser
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import NoTranscriptFound, TranscriptsDisabled
import google.generativeai as genai
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('summarizer.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class Config:
    """Configuration management for the summarizer."""

    def __init__(self, config_path: str = 'config.json'):
        self.config_path = config_path
        self.config = self._load_config()
        self._validate_config()

    def _load_config(self) -> Dict:
        """Load configuration from file and environment variables."""
        config = {}

        # Try to load from config.json if it exists
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
                logger.info(f"Loaded configuration from {self.config_path}")
            except json.JSONDecodeError as e:
                logger.error(f"Error parsing config file: {e}")
                raise

        # Override with environment variables (they take precedence)
        config['gemini_api_key'] = os.getenv('GEMINI_API_KEY', config.get('gemini_api_key'))
        config['youtube_rss_url'] = os.getenv('YOUTUBE_RSS_URL', config.get('youtube_rss_url'))
        config['smtp_host'] = os.getenv('SMTP_HOST', config.get('smtp_host'))
        config['smtp_port'] = int(os.getenv('SMTP_PORT', config.get('smtp_port', 587)))
        config['smtp_username'] = os.getenv('SMTP_USERNAME', config.get('smtp_username'))
        config['smtp_password'] = os.getenv('SMTP_PASSWORD', config.get('smtp_password'))
        config['email_from'] = os.getenv('EMAIL_FROM', config.get('email_from'))
        config['email_to'] = os.getenv('EMAIL_TO', config.get('email_to'))
        config['db_path'] = os.getenv('DB_PATH', config.get('db_path', 'processed_videos.db'))
        config['gemini_model'] = os.getenv('GEMINI_MODEL', config.get('gemini_model', 'gemini-1.5-flash'))

        return config

    def _validate_config(self):
        """Validate that all required configuration values are present."""
        required_keys = [
            'gemini_api_key',
            'youtube_rss_url',
            'smtp_host',
            'smtp_port',
            'smtp_username',
            'smtp_password',
            'email_from',
            'email_to'
        ]

        missing_keys = [key for key in required_keys if not self.config.get(key)]

        if missing_keys:
            error_msg = f"Missing required configuration: {', '.join(missing_keys)}"
            logger.error(error_msg)
            raise ValueError(error_msg)

        logger.info("Configuration validated successfully")

    def get(self, key: str, default=None):
        """Get a configuration value."""
        return self.config.get(key, default)


class VideoDatabase:
    """SQLite database for tracking processed videos."""

    def __init__(self, db_path: str = 'processed_videos.db'):
        self.db_path = db_path
        self._init_database()

    def _init_database(self):
        """Initialize the SQLite database and create tables if needed."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS processed_videos (
                    video_id TEXT PRIMARY KEY,
                    title TEXT,
                    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    url TEXT
                )
            ''')

            conn.commit()
            conn.close()
            logger.info(f"Database initialized at {self.db_path}")
        except sqlite3.Error as e:
            logger.error(f"Database initialization error: {e}")
            raise

    def is_processed(self, video_id: str) -> bool:
        """Check if a video has already been processed."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            cursor.execute(
                'SELECT 1 FROM processed_videos WHERE video_id = ?',
                (video_id,)
            )

            result = cursor.fetchone() is not None
            conn.close()

            return result
        except sqlite3.Error as e:
            logger.error(f"Database query error: {e}")
            return False

    def mark_processed(self, video_id: str, title: str, url: str, podcast_id: Optional[int] = None):
        """Mark a video as processed."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            cursor.execute(
                'INSERT INTO processed_videos (video_id, title, url, podcast_id) VALUES (?, ?, ?, ?)',
                (video_id, title, url, podcast_id)
            )

            conn.commit()
            conn.close()
            logger.info(f"Marked video {video_id} as processed")
        except sqlite3.Error as e:
            logger.error(f"Database insert error: {e}")
            raise


class TranscriptExtractor:
    """Extract and process YouTube video transcripts."""

    @staticmethod
    def extract_video_id(url: str) -> Optional[str]:
        """Extract video ID from YouTube URL."""
        # Handle various YouTube URL formats
        if 'youtube.com/watch?v=' in url:
            return url.split('watch?v=')[1].split('&')[0]
        elif 'youtu.be/' in url:
            return url.split('youtu.be/')[1].split('?')[0]
        elif 'yt:video:' in url:
            # RSS feed format
            return url.split('yt:video:')[1]
        return None

    @staticmethod
    def get_transcript(video_id: str) -> Optional[str]:
        """Fetch and concatenate the video transcript."""
        try:
            # Try to get English transcript
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])

            # Concatenate all text segments
            full_transcript = ' '.join([entry['text'] for entry in transcript_list])

            logger.info(f"Successfully extracted transcript for video {video_id}")
            return full_transcript

        except NoTranscriptFound:
            logger.warning(f"No transcript found for video {video_id}")
            return None

        except TranscriptsDisabled:
            logger.warning(f"Transcripts are disabled for video {video_id}")
            return None

        except Exception as e:
            logger.error(f"Error extracting transcript for video {video_id}: {e}")
            return None


class GeminiSummarizer:
    """Generate summaries using Google Gemini AI."""

    def __init__(self, api_key: str, model: str = 'gemini-2.5-flash'):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model)

    def generate_summary(self, transcript: str, video_title: str) -> Optional[str]:
        """Generate a concise summary of the video transcript."""
        try:
            prompt = f"""Please analyze the following video transcript from "{video_title}" and create a concise summary.

Format your summary as:
- A brief overview (2-3 sentences)
- Key points covered (bullet points)
- Main takeaways (bullet points)

Keep the summary suitable for an email digest - clear, scannable, and informative.

Transcript:
{transcript}
"""

            response = self.model.generate_content(prompt)
            summary = response.text
            logger.info(f"Successfully generated summary for '{video_title}'")
            return summary

        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return None


class EmailSender:
    """Send email notifications with video summaries."""

    def __init__(self, smtp_host: str, smtp_port: int, username: str, password: str, from_addr: str):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.username = username
        self.password = password
        self.from_addr = from_addr

    def send_summary(self, to_addr: str, video_title: str, video_url: str, summary: str) -> bool:
        """Send an email with the video summary."""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"New Video Summary: {video_title}"
            msg['From'] = self.from_addr
            msg['To'] = to_addr

            # Create email body
            text_body = f"""
New YouTube Video Summary

Title: {video_title}
URL: {video_url}

Summary:
{summary}

---
This summary was automatically generated using Claude AI.
"""

            html_body = f"""
<html>
<head></head>
<body>
    <h2>New YouTube Video Summary</h2>
    <p><strong>Title:</strong> {video_title}</p>
    <p><strong>URL:</strong> <a href="{video_url}">{video_url}</a></p>

    <h3>Summary:</h3>
    <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">{summary}</pre>

    <hr>
    <p style="color: #666; font-size: 0.9em;">This summary was automatically generated using Claude AI.</p>
</body>
</html>
"""

            # Attach both plain text and HTML versions
            part1 = MIMEText(text_body, 'plain')
            part2 = MIMEText(html_body, 'html')
            msg.attach(part1)
            msg.attach(part2)

            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)

            logger.info(f"Email sent successfully for video: {video_title}")
            return True

        except smtplib.SMTPException as e:
            logger.error(f"SMTP error sending email: {e}")
            return False

        except Exception as e:
            logger.error(f"Error sending email: {e}")
            return False


class YouTubeSummarizer:
    """Main orchestrator for the YouTube summarization workflow."""

    def __init__(self, config: Config):
        self.config = config
        self.db = VideoDatabase(config.get('db_path'))
        self.summarizer = GeminiSummarizer(
            config.get('gemini_api_key'),
            config.get('gemini_model', 'gemini-1.5-flash')
        )
        self.email_sender = EmailSender(
            config.get('smtp_host'),
            config.get('smtp_port'),
            config.get('smtp_username'),
            config.get('smtp_password'),
            config.get('email_from')
        )

    def process_feed(self):
        """Main workflow: check RSS feed and process new videos."""
        logger.info("Starting RSS feed check...")

        try:
            # Parse RSS feed
            feed = feedparser.parse(self.config.get('youtube_rss_url'))

            if feed.bozo:
                logger.error(f"Error parsing RSS feed: {feed.bozo_exception}")
                return

            logger.info(f"Found {len(feed.entries)} entries in feed")

            processed_count = 0
            skipped_count = 0
            error_count = 0

            # Process each entry
            for entry in feed.entries:
                try:
                    # Extract video information
                    video_title = entry.get('title', 'Unknown Title')
                    video_url = entry.get('link', '')

                    # Extract video ID
                    video_id = TranscriptExtractor.extract_video_id(video_url)

                    if not video_id:
                        # Try alternative methods from feed
                        if hasattr(entry, 'yt_videoid'):
                            video_id = entry.yt_videoid
                        else:
                            logger.warning(f"Could not extract video ID from: {video_url}")
                            error_count += 1
                            continue

                    # Check if already processed
                    if self.db.is_processed(video_id):
                        logger.info(f"Skipping already processed video: {video_title}")
                        skipped_count += 1
                        continue

                    logger.info(f"Processing new video: {video_title} ({video_id})")

                    # Extract transcript
                    transcript = TranscriptExtractor.get_transcript(video_id)

                    if not transcript:
                        logger.warning(f"No transcript available for: {video_title}")
                        # Still mark as processed to avoid repeated attempts
                        self.db.mark_processed(video_id, video_title, video_url)
                        error_count += 1
                        continue

                    # Generate summary
                    summary = self.summarizer.generate_summary(transcript, video_title)

                    if not summary:
                        logger.warning(f"Failed to generate summary for: {video_title}")
                        error_count += 1
                        continue

                    # Send email
                    email_sent = self.email_sender.send_summary(
                        self.config.get('email_to'),
                        video_title,
                        video_url,
                        summary
                    )

                    if not email_sent:
                        logger.error(f"Failed to send email for: {video_title}")
                        error_count += 1
                        continue

                    # Mark as processed only after successful email
                    self.db.mark_processed(video_id, video_title, video_url)
                    processed_count += 1

                    logger.info(f"Successfully processed and sent: {video_title}")

                except Exception as e:
                    logger.error(f"Error processing entry '{video_title}': {e}")
                    error_count += 1
                    continue

            # Summary
            logger.info(f"Processing complete. Processed: {processed_count}, Skipped: {skipped_count}, Errors: {error_count}")

        except Exception as e:
            logger.error(f"Fatal error in process_feed: {e}")
            raise


def main():
    """Main entry point for the script."""
    try:
        logger.info("=" * 60)
        logger.info("YouTube Podcast Episode Summarizer Started")
        logger.info("=" * 60)

        # Load configuration
        config = Config()

        # Initialize and run summarizer
        summarizer = YouTubeSummarizer(config)
        summarizer.process_feed()

        logger.info("=" * 60)
        logger.info("YouTube Podcast Episode Summarizer Completed")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
