const express = require('express');
const router = express.Router();
const { getPlaylist, getSegment } = require('../controllers/proxy.controller');

// Route to proxy m3u8 playlists
router.get('/playlist', getPlaylist);

// Route to proxy ts segments and other media chunks
router.get('/segment', getSegment);

module.exports = router;
