const rateLimit = require('express-rate-limit');

// Protects the YouTube quota and the server from abuse.
const youtubeSearchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 searches per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many searches. Please wait a moment and try again.'
  }
});

module.exports = { youtubeSearchLimiter };
