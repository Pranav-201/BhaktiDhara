const { searchDevotionalVideos } = require('../services/youtubeService');

async function searchYoutube(req, res) {
  const query = (req.query.q || '').toString().trim();

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }
  if (query.length > 100) {
    return res.status(400).json({ message: 'Search query is too long.' });
  }

  try {
    const results = await searchDevotionalVideos(query);
    return res.json({ results });
  } catch (err) {
    switch (err.code) {
      case 'MISSING_API_KEY':
        return res.status(500).json({ message: 'YouTube search is not configured. Please contact the app administrator.' });
      case 'QUOTA_EXCEEDED':
        return res.status(429).json({ message: 'YOUTUBE_QUOTA_EXCEEDED' });
      case 'TIMEOUT':
        return res.status(504).json({ message: 'The search timed out. Please try again.' });
      default:
        return res.status(502).json({ message: 'Unable to search YouTube right now. Please try again.' });
    }
  }
}

module.exports = { searchYoutube };
