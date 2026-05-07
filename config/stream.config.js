require('dotenv').config();

/**
 * Stream Configuration
 * Stores settings for the protected HLS stream.
 * Values should be defined in your .env file.
 */
module.exports = {
  id: (process.env.STREAM_ID || "live1").trim(),
  source: (process.env.STREAM_SOURCE || "").replace(/\s+/g, ''),
  referer: (process.env.STREAM_REFERER || "").trim(),
  origin: (process.env.STREAM_ORIGIN || "").trim(),
  userAgent: (process.env.STREAM_USER_AGENT || "Mozilla/5.0").trim()
};
