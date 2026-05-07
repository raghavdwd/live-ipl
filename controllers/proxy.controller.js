const { fetchAndRewritePlaylist } = require('../services/m3u8.service');
const { proxySegment } = require('../services/proxy.service');
const streamConfig = require('../config/stream.config');

/**
 * Controller to handle playlist proxy requests
 */
const getPlaylist = async (req, res, next) => {
  try {
    // URL can be passed as query param, or default to the config stream URL
    const targetUrl = req.query.url || streamConfig.source;
    
    if (!targetUrl) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    const host = req.get('host');
    const playlistContent = await fetchAndRewritePlaylist(targetUrl, host);

    // M3U8 content type
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(playlistContent);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle segment proxy requests
 */
const getSegment = async (req, res, next) => {
  try {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    await proxySegment(targetUrl, req, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlaylist,
  getSegment
};
