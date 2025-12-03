/**
 * Helper functions for extracting YouTube channel IDs from various URL formats
 */

/**
 * Extract channel ID from a YouTube URL
 * Supports multiple formats:
 * - youtube.com/channel/UCxxxxxx
 * - youtube.com/@username
 * - youtube.com/c/customname
 * - youtube.com/user/username
 */
async function extractChannelIdFromUrl(url) {
  try {
    const urlObj = new URL(url);

    // Format 1: Direct channel ID (youtube.com/channel/UCxxxxxx)
    if (url.includes('/channel/')) {
      const match = url.match(/\/channel\/([^\/\?]+)/);
      if (match) {
        return { channelId: match[1], source: 'direct' };
      }
    }

    // Format 2: Handle @username format (youtube.com/@username)
    if (url.includes('/@')) {
      const handle = url.match(/\/@([^\/\?]+)/)?.[1];
      if (handle) {
        // We'll need to fetch this from YouTube to get the actual channel ID
        return { handle: handle, needsFetch: true, source: 'handle' };
      }
    }

    // Format 3: Custom URL (youtube.com/c/customname)
    if (url.includes('/c/')) {
      const customName = url.match(/\/c\/([^\/\?]+)/)?.[1];
      if (customName) {
        return { customName: customName, needsFetch: true, source: 'custom' };
      }
    }

    // Format 4: User URL (youtube.com/user/username)
    if (url.includes('/user/')) {
      const username = url.match(/\/user\/([^\/\?]+)/)?.[1];
      if (username) {
        return { username: username, needsFetch: true, source: 'user' };
      }
    }

    return { error: 'Could not extract channel identifier from URL' };

  } catch (error) {
    return { error: 'Invalid URL format' };
  }
}

/**
 * Fetch channel ID from YouTube page (for @handle, /c/, /user/ formats)
 */
async function fetchChannelIdFromPage(url) {
  try {
    const https = require('https');

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          // Look for channel ID in the page HTML
          // YouTube embeds it in various places in the source
          const patterns = [
            /"channelId":"([^"]+)"/,
            /"browseId":"([^"]+)"/,
            /channel_id=([^&"]+)/,
            /"externalChannelId":"([^"]+)"/
          ];

          for (const pattern of patterns) {
            const match = data.match(pattern);
            if (match && match[1].startsWith('UC')) {
              resolve(match[1]);
              return;
            }
          }

          reject(new Error('Could not find channel ID in page'));
        });

      }).on('error', (err) => {
        reject(err);
      });
    });

  } catch (error) {
    throw new Error('Failed to fetch channel page: ' + error.message);
  }
}

/**
 * Main function: Get channel ID from any YouTube URL
 */
async function getChannelId(url) {
  const result = await extractChannelIdFromUrl(url);

  // If we got a direct channel ID, return it
  if (result.channelId) {
    return {
      success: true,
      channelId: result.channelId,
      source: result.source
    };
  }

  // If we need to fetch from the page
  if (result.needsFetch) {
    try {
      const channelId = await fetchChannelIdFromPage(url);
      return {
        success: true,
        channelId: channelId,
        source: result.source,
        fetchedFromPage: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Could not fetch channel ID from YouTube page: ' + error.message,
        suggestion: 'Try using the direct channel URL format: youtube.com/channel/UCxxxxxx'
      };
    }
  }

  // Error case
  return {
    success: false,
    error: result.error || 'Unknown error',
    suggestion: 'Please provide a valid YouTube channel URL'
  };
}

module.exports = {
  extractChannelIdFromUrl,
  fetchChannelIdFromPage,
  getChannelId
};
