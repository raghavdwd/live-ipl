const streamConfig = require('../config/stream.config');

/**
 * Utility to generate and attach the required headers
 * for the protected stream.
 * @returns {Object} Headers object
 */
const getProxyHeaders = () => {
  return {
    'Referer': streamConfig.referer,
    'Origin': streamConfig.origin,
    'User-Agent': streamConfig.userAgent
  };
};

module.exports = { getProxyHeaders };
