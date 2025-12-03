# Apple Podcasts Support

## Overview

The RSS Whisperer now supports both **YouTube channels** and **Apple Podcasts**! You can add podcasts from either platform using their URLs.

## Supported Platforms

### 1. YouTube
- Format: `https://www.youtube.com/@channelname`
- Format: `https://www.youtube.com/channel/UCxxxxxx`
- Extracts channel ID and generates RSS feed URL

### 2. Apple Podcasts
- Format: `https://podcasts.apple.com/us/podcast/podcast-name/id123456789`
- Fetches RSS feed URL from Apple's iTunes API
- Auto-fills podcast name from Apple's metadata

## How to Use

### Via Web UI

1. Open http://localhost:5173
2. Enter the **Podcast Name** (or let it auto-fill for Apple Podcasts)
3. Paste a **YouTube channel URL** or **Apple Podcasts URL**
4. Click **Extract Info**
5. The system will:
   - Detect the platform (YouTube or Apple Podcasts)
   - Extract the RSS feed URL
   - Auto-fill relevant fields
6. Click **Add Podcast**

## Examples

### Adding Huberman Lab (Apple Podcasts)

```
1. Paste URL: https://podcasts.apple.com/us/podcast/huberman-lab/id1545953110
2. Click: Extract Info
3. Result:
   ✓ Detected: Apple Podcasts
   - Podcast Name: Huberman Lab (auto-filled)
   - RSS URL: https://feeds.megaphone.fm/hubermanlab
4. Click: Add Podcast
```

### Adding Lex Fridman (YouTube)

```
1. Paste URL: https://www.youtube.com/@lexfridman
2. Click: Extract Info
3. Result:
   ✓ Detected: YouTube
   - Channel ID: UCf3t5WEHHpgHDDWOgbD6e8g
   - RSS URL: https://www.youtube.com/feeds/videos.xml?channel_id=UCf3t5WEHHpgHDDWOgbD6e8g
4. Enter Podcast Name: Lex Fridman Podcast
5. Click: Add Podcast
```

## Technical Details

### Backend API

**Endpoint:** `POST /api/extract-podcast-info`

**Request:**
```json
{
  "url": "https://podcasts.apple.com/us/podcast/huberman-lab/id1545953110"
}
```

**Response (Apple Podcasts):**
```json
{
  "success": true,
  "source": "apple_podcasts",
  "rssUrl": "https://feeds.megaphone.fm/hubermanlab",
  "podcastName": "Huberman Lab",
  "artist": "Scicomm Media",
  "artwork": "https://...artwork_url.jpg"
}
```

**Response (YouTube):**
```json
{
  "success": true,
  "source": "youtube",
  "channelId": "UCf3t5WEHHpgHDDWOgbD6e8g",
  "rssUrl": "https://www.youtube.com/feeds/videos.xml?channel_id=UCf3t5WEHHpgHDDWOgbD6e8g"
}
```

### Database Schema

The `podcasts` table now includes a `source` column:

```sql
CREATE TABLE podcasts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id TEXT,              -- Optional (only for YouTube)
  channel_name TEXT NOT NULL,
  rss_url TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'youtube', -- 'youtube' or 'apple_podcasts'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Files Created/Modified

1. **backend/apple_podcast_helper.js** (NEW)
   - `extractPodcastId()` - Extracts podcast ID from Apple URL
   - `fetchRssFeedUrl()` - Fetches RSS feed from iTunes API
   - `getApplePodcastRss()` - Main function for Apple Podcasts

2. **backend/server.js**
   - Added `/api/extract-podcast-info` endpoint (unified)
   - Modified database schema to include `source` column
   - Updated `/api/podcasts` POST endpoint to accept `source`

3. **frontend/src/components/PodcastForm.jsx**
   - Unified URL field for both YouTube and Apple Podcasts
   - Auto-detection of platform type
   - Conditional rendering of YouTube-specific fields

## Apple Podcasts vs YouTube

| Feature | YouTube | Apple Podcasts |
|---------|---------|----------------|
| Channel ID | Required | Not applicable |
| RSS URL | Generated | Fetched from iTunes API |
| Name Auto-fill | Manual | Automatic |
| Transcript Source | youtube-transcript-api | RSS feed (if available) |

## Transcript Support

### YouTube
- Uses `youtube-transcript-api` to extract transcripts
- Supports auto-generated and manual captions
- May not be available for very recent videos or Shorts

### Apple Podcasts
- Transcripts depend on the podcast RSS feed
- Many podcasts now include transcripts in their RSS feeds
- Quality varies by podcast creator

## Testing

### Test with Popular Podcasts

**Apple Podcasts:**
- Huberman Lab: `https://podcasts.apple.com/us/podcast/huberman-lab/id1545953110`
- The Tim Ferriss Show: `https://podcasts.apple.com/us/podcast/the-tim-ferriss-show/id863897795`
- Lex Fridman: `https://podcasts.apple.com/us/podcast/the-lex-fridman-podcast/id1434243584`

**YouTube:**
- Lex Fridman: `https://www.youtube.com/@lexfridman`
- Huberman Lab: `https://www.youtube.com/@hubermanlab`

### Manual Testing

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Open: http://localhost:5173
4. Try adding podcasts from both platforms
5. Run summarizer: `python3.11 run_summarizer.py`
6. Check email for summaries

## Benefits

✅ **Multi-platform** - Support for both YouTube and Apple Podcasts
✅ **Easy to use** - Just paste a URL and click Extract
✅ **Auto-detection** - Automatically detects platform type
✅ **Metadata extraction** - Auto-fills podcast name from Apple
✅ **Backward compatible** - Existing YouTube podcasts continue to work

## Limitations

1. **Transcript availability**: Not all podcasts have transcripts
2. **Apple API dependency**: Requires Apple's iTunes API to be available
3. **RSS feed quality**: Transcript format varies between podcasts

## Future Enhancements

- Support for Spotify podcasts
- Support for direct RSS feed URLs
- Transcript format normalization
- Podcast artwork display in UI
- Episode filtering by date
