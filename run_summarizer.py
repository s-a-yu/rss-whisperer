#!/usr/bin/env python3
"""
Enhanced RSS Whisperer - Database-Integrated Version
Reads podcast subscriptions and email from the database populated by the frontend.
"""

import os
import sys
import sqlite3
import logging
from typing import List, Dict, Optional

# Load .env file FIRST before importing anything else
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Import the original summarizer components
from summarizer import (
    TranscriptExtractor,
    GeminiSummarizer,
    EmailSender,
    VideoDatabase,
    Config
)

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


class DatabaseConfig:
    """Load configuration from the podcasts database."""

    def __init__(self, db_path: str = 'podcasts.db'):
        self.db_path = db_path
        self.config = {}

    def load_from_db(self) -> Dict:
        """Load user settings from database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            # Get all settings
            cursor.execute('SELECT setting_key, setting_value FROM user_settings')
            rows = cursor.fetchall()

            for key, value in rows:
                self.config[key] = value

            conn.close()
            logger.info(f"Loaded {len(rows)} settings from database")
            return self.config

        except sqlite3.Error as e:
            logger.error(f"Database error: {e}")
            return {}

    def get_podcasts(self) -> List[Dict]:
        """Get all podcast subscriptions from database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            cursor.execute('SELECT id, channel_id, channel_name, rss_url, source FROM podcasts')
            rows = cursor.fetchall()

            podcasts = [
                {
                    'id': row[0],
                    'channel_id': row[1],
                    'channel_name': row[2],
                    'rss_url': row[3],
                    'source': row[4] if len(row) > 4 else 'youtube'
                }
                for row in rows
            ]

            conn.close()
            logger.info(f"Found {len(podcasts)} podcast subscriptions")
            return podcasts

        except sqlite3.Error as e:
            logger.error(f"Database error: {e}")
            return []


class MinimalConfig:
    """Minimal configuration that only requires API key (email comes from database)."""

    def __init__(self):
        import json

        config = {}

        # Try to load from config.json if it exists
        if os.path.exists('config.json'):
            try:
                with open('config.json', 'r') as f:
                    config = json.load(f)
            except:
                pass

        # Override with environment variables
        self.gemini_api_key = os.getenv('GEMINI_API_KEY', config.get('gemini_api_key'))
        self.gemini_model = os.getenv('GEMINI_MODEL', config.get('gemini_model', 'gemini-2.5-flash'))
        self.smtp_host = os.getenv('SMTP_HOST', config.get('smtp_host', 'smtp.gmail.com'))
        self.smtp_port = int(os.getenv('SMTP_PORT', config.get('smtp_port', 587)))
        self.smtp_username = os.getenv('SMTP_USERNAME', config.get('smtp_username', ''))
        self.smtp_password = os.getenv('SMTP_PASSWORD', config.get('smtp_password', ''))
        self.email_from = os.getenv('EMAIL_FROM', config.get('email_from', ''))

        # Validate only the essential keys
        if not self.gemini_api_key:
            raise ValueError("Missing GEMINI_API_KEY. Please set it in .env or config.json")

    def get(self, key, default=None):
        return getattr(self, key, default)


class IntegratedSummarizer:
    """Main orchestrator that integrates with the web app database."""

    def __init__(self):
        # Load configuration (only requires API key, not email)
        self.base_config = MinimalConfig()
        self.db_config = DatabaseConfig()
        self.db_config.load_from_db()

        # Get email from database (falls back to config file)
        self.email_to = self.db_config.config.get('email') or self.base_config.get('email_to')

        if not self.email_to:
            raise ValueError("No email configured. Please set email in the web interface.")

        # Get podcasts from database
        self.podcasts = self.db_config.get_podcasts()

        if not self.podcasts:
            logger.warning("No podcasts configured. Please add podcasts in the web interface.")

        # Initialize components
        self.summarizer = GeminiSummarizer(
            self.base_config.get('gemini_api_key'),
            self.base_config.get('gemini_model', 'gemini-2.5-flash')
        )

        self.email_sender = EmailSender(
            self.base_config.get('smtp_host'),
            self.base_config.get('smtp_port'),
            self.base_config.get('smtp_username'),
            self.base_config.get('smtp_password'),
            self.base_config.get('email_from')
        )

        # Use shared database for processed videos
        self.video_db = VideoDatabase('podcasts.db')

    def process_all_podcasts(self):
        """Process all podcast subscriptions from the database."""
        logger.info("=" * 60)
        logger.info(f"Processing {len(self.podcasts)} podcast subscriptions")
        logger.info(f"Email recipient: {self.email_to}")
        logger.info("=" * 60)

        total_processed = 0
        total_errors = 0

        for podcast in self.podcasts:
            logger.info(f"\nProcessing: {podcast['channel_name']}")

            try:
                result = self._process_podcast(podcast)
                total_processed += result['processed']
                total_errors += result['errors']

            except Exception as e:
                logger.error(f"Error processing podcast '{podcast['channel_name']}': {e}")
                total_errors += 1

        logger.info("=" * 60)
        logger.info(f"Summary: Processed {total_processed} videos, {total_errors} errors")
        logger.info("=" * 60)

    def _is_podcast_new(self, podcast_id: int) -> bool:
        """Check if this podcast has any processed videos yet."""
        try:
            conn = sqlite3.connect('podcasts.db')
            cursor = conn.cursor()

            cursor.execute(
                'SELECT COUNT(*) FROM processed_videos WHERE podcast_id = ?',
                (podcast_id,)
            )

            count = cursor.fetchone()[0]
            conn.close()

            return count == 0

        except sqlite3.Error as e:
            logger.error(f"Database error checking podcast status: {e}")
            return False

    def _process_podcast(self, podcast: Dict) -> Dict:
        """Process a single podcast's RSS feed."""
        import feedparser

        processed_count = 0
        error_count = 0

        try:
            # Parse RSS feed
            feed = feedparser.parse(podcast['rss_url'])

            if feed.bozo:
                logger.error(f"Error parsing RSS feed: {feed.bozo_exception}")
                return {'processed': 0, 'errors': 1}

            logger.info(f"Found {len(feed.entries)} entries")

            # Check if this is a newly added podcast
            is_new_podcast = self._is_podcast_new(podcast['id'])

            if is_new_podcast and len(feed.entries) > 0:
                logger.info(f"🎉 New podcast detected! Will process latest episode as welcome summary")

                # For YouTube, skip Shorts; for others, just use first entry
                if podcast.get('source') == 'youtube':
                    # Find the first full video (skip Shorts) for new YouTube podcasts
                    entries_to_process = []
                    for entry in feed.entries:
                        video_url = entry.get('link', '')
                        # Skip YouTube Shorts (they usually don't have transcripts)
                        if '/shorts/' not in video_url:
                            entries_to_process = [entry]
                            logger.info(f"Found first full YouTube video (skipping Shorts)")
                            break

                    # If all entries are Shorts, just try the first one anyway
                    if not entries_to_process and len(feed.entries) > 0:
                        entries_to_process = [feed.entries[0]]
                        logger.warning("All entries appear to be Shorts, will try the latest anyway")
                else:
                    # For non-YouTube podcasts, just use the first episode
                    entries_to_process = [feed.entries[0]]
                    logger.info(f"Using latest episode for new podcast")
            else:
                # Process all entries for existing podcasts (checks for new ones)
                entries_to_process = feed.entries

            # Process each entry
            for entry in entries_to_process:
                try:
                    video_title = entry.get('title', 'Unknown Title')
                    video_url = entry.get('link', '')
                    podcast_source = podcast.get('source', 'youtube')

                    # Handle different podcast sources
                    if podcast_source == 'youtube':
                        # Extract video ID for YouTube
                        video_id = TranscriptExtractor.extract_video_id(video_url)

                        if not video_id and hasattr(entry, 'yt_videoid'):
                            video_id = entry.yt_videoid

                        if not video_id:
                            logger.warning(f"Could not extract video ID from: {video_url}")
                            error_count += 1
                            continue
                    else:
                        # For Apple Podcasts and others, use the episode URL as ID
                        video_id = entry.get('id', video_url)

                    # Check if already processed
                    if self.video_db.is_processed(video_id):
                        logger.info(f"Skipping already processed: {video_title}")
                        continue

                    logger.info(f"New episode: {video_title} ({video_id[:50]}...)")

                    # Extract transcript/content based on source
                    if podcast_source == 'youtube':
                        transcript = TranscriptExtractor.get_transcript(video_id)
                    else:
                        # For Apple Podcasts, use the episode description/summary
                        transcript = entry.get('summary', '')
                        if not transcript and hasattr(entry, 'content'):
                            transcript = entry.content[0].value if entry.content else ''

                    if not transcript:
                        logger.warning(f"No transcript/content available: {video_title}")
                        # Mark as processed to avoid repeated attempts
                        self.video_db.mark_processed(video_id, video_title, video_url, podcast['id'])
                        error_count += 1
                        continue

                    # Generate summary
                    summary = self.summarizer.generate_summary(transcript, video_title)

                    if not summary:
                        logger.warning(f"Failed to generate summary: {video_title}")
                        error_count += 1
                        continue

                    # Print summary to terminal
                    print("\n" + "="*80)
                    print(f"📝 SUMMARY: {video_title}")
                    print("="*80)
                    print(f"🔗 URL: {video_url}")
                    print(f"📺 Podcast: {podcast['channel_name']}")
                    print("-"*80)
                    print(summary)
                    print("="*80 + "\n")

                    # Send email
                    email_sent = self.email_sender.send_summary(
                        self.email_to,
                        video_title,
                        video_url,
                        summary
                    )

                    if not email_sent:
                        logger.warning(f"Email failed, but summary generated (see above)")

                    # Mark as processed (even if email failed, since we have the summary)
                    self.video_db.mark_processed(video_id, video_title, video_url, podcast['id'])
                    processed_count += 1

                    logger.info(f"✓ Successfully processed: {video_title}")

                except Exception as e:
                    logger.error(f"Error processing entry '{video_title}': {e}")
                    error_count += 1

        except Exception as e:
            logger.error(f"Error processing podcast feed: {e}")
            error_count += 1

        return {'processed': processed_count, 'errors': error_count}


def main():
    """Main entry point."""
    try:
        logger.info("Starting Integrated RSS Whisperer")

        # Check if database exists
        if not os.path.exists('podcasts.db'):
            logger.error("Database not found! Please start the web application first.")
            logger.error("The backend server will create the database automatically.")
            sys.exit(1)

        # Initialize and run
        summarizer = IntegratedSummarizer()
        summarizer.process_all_podcasts()

        logger.info("Integrated RSS Whisperer completed successfully")

    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        logger.error("Please configure your email and podcasts in the web interface.")
        sys.exit(1)

    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
