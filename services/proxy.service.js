const { getProxyHeaders } = require('../utils/headers.util');
const { pipeline } = require('stream/promises');

/**
 * Proxies a media segment directly to the response using Node streams.
 * @param {string} targetUrl - The original segment URL
 * @param {Object} req - The Express request object (to extract range headers, etc.)
 * @param {Object} res - The Express response object
 */
const proxySegment = async (targetUrl, req, res) => {
  const headers = getProxyHeaders();
  
  // Forward range requests if present (useful for low latency/seeking)
  if (req.headers.range) {
    headers['Range'] = req.headers.range;
  }

  const response = await fetch(targetUrl, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch segment: ${response.status} ${response.statusText}`);
  }

  // Forward necessary headers to the client
  if (response.headers.has('content-type')) {
    res.setHeader('Content-Type', response.headers.get('content-type'));
  }
  if (response.headers.has('content-length')) {
    res.setHeader('Content-Length', response.headers.get('content-length'));
  }
  if (response.headers.has('content-range')) {
    res.setHeader('Content-Range', response.headers.get('content-range'));
  }
  if (response.headers.has('accept-ranges')) {
    res.setHeader('Accept-Ranges', response.headers.get('accept-ranges'));
  }
  
  res.status(response.status);

  // Pipe the web stream to the Node.js response stream
  // fetch API returns a ReadableStream (Web Streams API), we can use response.body
  // Since Node 18, we can use pipeline with Web Streams, but it's often easier to convert
  // For safety in various Node versions, we can use Readable.fromWeb
  const { Readable } = require('stream');
  
  if (response.body) {
    const nodeStream = Readable.fromWeb(response.body);
    await pipeline(nodeStream, res);
  } else {
    res.end();
  }
};

module.exports = { proxySegment };
