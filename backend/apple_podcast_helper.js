/**
 * Helper functions for extracting RSS feed URLs from Apple Podcast links
 */

const https = require('https');

/**
 * Extract podcast ID from Apple Podcasts URL
 * Supports formats:
 * - https://podcasts.apple.com/us/podcast/podcast-name/id123456789
 * - https://podcasts.apple.com/podcast/podcast-name/id123456789
 */
function extractPodcastId(url) {
  try {
    const match = url.match(/\/id(\d+)/);
    if (match) {
      return match[1];
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetch RSS feed URL from Apple Podcasts lookup API
 */
async function fetchRssFeedUrl(podcastId) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://itunes.apple.com/lookup?id=${podcastId}&entity=podcast`;

    https.get(apiUrl, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);

          if (json.resultCount > 0 && json.results[0].feedUrl) {
            const result = json.results[0];
            resolve({
              feedUrl: result.feedUrl,
              podcastName: result.collectionName || result.trackName,
              artist: result.artistName,
              artwork: result.artworkUrl600 || result.artworkUrl100
            });
          } else {
            reject(new Error('Podcast not found or no RSS feed available'));
          }
        } catch (err) {
          reject(new Error('Failed to parse Apple Podcasts API response: ' + err.message));
        }
      });

    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Main function: Get RSS feed URL from Apple Podcasts URL
 */
async function getApplePodcastRss(url) {
  // Check if it's an Apple Podcasts URL
  if (!url.includes('podcasts.apple.com')) {
    return {
      success: false,
      error: 'Not an Apple Podcasts URL',
      suggestion: 'Please provide a valid Apple Podcasts URL'
    };
  }

  // Extract podcast ID
  const podcastId = extractPodcastId(url);

  if (!podcastId) {
    return {
      success: false,
      error: 'Could not extract podcast ID from URL',
      suggestion: 'URL should contain /id123456789'
    };
  }

  // Fetch RSS feed URL from Apple API
  try {
    const podcastInfo = await fetchRssFeedUrl(podcastId);
    return {
      success: true,
      feedUrl: podcastInfo.feedUrl,
      podcastName: podcastInfo.podcastName,
      artist: podcastInfo.artist,
      artwork: podcastInfo.artwork,
      source: 'apple_podcasts',
      podcastId: podcastId
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch podcast information: ' + error.message,
      suggestion: 'Please verify the podcast ID is correct'
    };
  }
}

/**
 * Detect URL type and route to appropriate handler
 */
async function getPodcastInfo(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return {
      type: 'youtube',
      needsChannelHelper: true
    };
  } else if (url.includes('podcasts.apple.com')) {
    return await getApplePodcastRss(url);
  } else {
    return {
      success: false,
      error: 'Unsupported URL format',
      suggestion: 'Please provide a YouTube channel URL or Apple Podcasts URL'
    };
  }
}

module.exports = {
  extractPodcastId,
  fetchRssFeedUrl,
  getApplePodcastRss,
  getPodcastInfo
};
