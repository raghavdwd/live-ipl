const rateLimit = require('express-rate-limit');

/**
 * Rate Limiting Middleware
 * Protects proxy routes from abuse.
 */
const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 600, // Limit each IP to 600 requests per windowMs. 
  // Note: 600 is chosen to allow for fetching multiple .ts chunks and .m3u8 playlists during normal streaming.
  message: {
    success: false,
    status: 429,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { rateLimiter };
