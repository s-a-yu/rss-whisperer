#!/usr/bin/env python3
"""
Demo Setup Script for RSS Whisperer
Populates the database with example podcast subscriptions for testing.
"""

import sqlite3
import sys

# Example popular podcast channels
DEMO_PODCASTS = [
    {
        'channel_id': 'UCSHZKyawb77ixDdsGog4iWA',
        'channel_name': 'Lex Fridman Podcast',
        'rss_url': 'https://www.youtube.com/feeds/videos.xml?channel_id=UCSHZKyawb77ixDdsGog4iWA'
    },
    {
        'channel_id': 'UCbLt9Y7rI_OBJ4p0B_hCybQ',
        'channel_name': 'Huberman Lab',
        'rss_url': 'https://www.youtube.com/feeds/videos.xml?channel_id=UCbLt9Y7rI_OBJ4p0B_hCybQ'
    },
    {
        'channel_id': 'UCd6MlayHdGT0rC9qiCSRJ3g',
        'channel_name': 'The Daily (NY Times)',
        'rss_url': 'https://www.youtube.com/feeds/videos.xml?channel_id=UCd6MlayHdGT0rC9qiCSRJ3g'
    }
]

def setup_demo_data(db_path='podcasts.db'):
    """Add demo podcasts to the database."""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        print("RSS Whisperer - Demo Setup")
        print("=" * 50)
        print()

        # Check if podcasts table exists
        cursor.execute("""
            SELECT name FROM sqlite_master
            WHERE type='table' AND name='podcasts'
        """)

        if not cursor.fetchone():
            print("❌ Error: Database not initialized!")
            print("Please start the backend server first:")
            print("  cd backend && npm start")
            conn.close()
            sys.exit(1)

        # Insert demo podcasts
        added_count = 0
        skipped_count = 0

        for podcast in DEMO_PODCASTS:
            try:
                cursor.execute("""
                    INSERT INTO podcasts (channel_id, channel_name, rss_url)
                    VALUES (?, ?, ?)
                """, (podcast['channel_id'], podcast['channel_name'], podcast['rss_url']))

                print(f"✅ Added: {podcast['channel_name']}")
                added_count += 1

            except sqlite3.IntegrityError:
                print(f"⏭️  Skipped (already exists): {podcast['channel_name']}")
                skipped_count += 1

        conn.commit()
        conn.close()

        print()
        print("=" * 50)
        print(f"Summary: {added_count} added, {skipped_count} skipped")
        print()

        if added_count > 0:
            print("✅ Demo podcasts added successfully!")
            print()
            print("Next steps:")
            print("1. Open the web UI: http://localhost:5173")
            print("2. Set your email in 'Email Settings' tab")
            print("3. View/edit the demo podcasts in 'Podcasts' tab")
            print("4. Run: python run_summarizer.py")
        else:
            print("ℹ️  All demo podcasts already exist in the database.")

    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        sys.exit(1)

    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


def clear_demo_data(db_path='podcasts.db'):
    """Remove all demo podcasts from the database."""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        demo_channel_ids = [p['channel_id'] for p in DEMO_PODCASTS]
        placeholders = ','.join(['?' for _ in demo_channel_ids])

        cursor.execute(f"""
            DELETE FROM podcasts
            WHERE channel_id IN ({placeholders})
        """, demo_channel_ids)

        deleted_count = cursor.rowcount
        conn.commit()
        conn.close()

        print(f"✅ Removed {deleted_count} demo podcast(s)")

    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        sys.exit(1)


def show_current_podcasts(db_path='podcasts.db'):
    """Display all current podcasts in the database."""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute("SELECT channel_name, channel_id FROM podcasts ORDER BY created_at")
        podcasts = cursor.fetchall()

        conn.close()

        if podcasts:
            print("\nCurrent Podcasts in Database:")
            print("=" * 50)
            for i, (name, channel_id) in enumerate(podcasts, 1):
                print(f"{i}. {name}")
                print(f"   Channel ID: {channel_id}")
            print()
        else:
            print("\nNo podcasts in database yet.")
            print("Run 'python demo_setup.py' to add demo data")

    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    import sys

    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == 'add':
            setup_demo_data()
        elif command == 'clear':
            clear_demo_data()
        elif command == 'list':
            show_current_podcasts()
        else:
            print("Usage:")
            print("  python demo_setup.py add    - Add demo podcasts")
            print("  python demo_setup.py clear  - Remove demo podcasts")
            print("  python demo_setup.py list   - List current podcasts")
    else:
        # Default: add demo data
        setup_demo_data()
