const express = require('express');
const { searchYoutube } = require('../controllers/youtubeController');
const { youtubeSearchLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// GET /api/youtube/search?q=Hanuman%20Chalisa
router.get('/search', youtubeSearchLimiter, searchYoutube);

module.exports = router;
