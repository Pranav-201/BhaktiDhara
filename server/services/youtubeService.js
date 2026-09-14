const axios = require('axios');

const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

/**
 * Searches YouTube for devotional/bhajan content and returns a sanitized,
 * minimal result set. The API key never leaves this server.
 */
async function searchDevotionalVideos(query) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    const err = new Error('YouTube API key is not configured on the server.');
    err.code = 'MISSING_API_KEY';
    throw err;
  }

  try {
    const response = await axios.get(YOUTUBE_SEARCH_URL, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 15,
        safeSearch: 'strict',
        videoEmbeddable: 'true',
        key: apiKey
      },
      timeout: 8000
    });

    const items = response.data.items || [];
    return items
      .filter((item) => item.id && item.id.videoId)
      .map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail:
          (item.snippet.thumbnails &&
            (item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url)) ||
          ''
      }));
  } catch (err) {
    if (err.response && err.response.status === 403) {
      const quotaErr = new Error('YouTube API quota exceeded.');
      quotaErr.code = 'QUOTA_EXCEEDED';
      throw quotaErr;
    }
    if (err.code === 'ECONNABORTED') {
      const timeoutErr = new Error('YouTube API request timed out.');
      timeoutErr.code = 'TIMEOUT';
      throw timeoutErr;
    }
    const genericErr = new Error('Failed to reach YouTube API.');
    genericErr.code = 'YOUTUBE_UNAVAILABLE';
    throw genericErr;
  }
}

module.exports = { searchDevotionalVideos };
