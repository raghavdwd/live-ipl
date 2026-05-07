const { getProxyHeaders } = require('../utils/headers.util');

/**
 * Resolves a URI against a base URL.
 * Handles extracting the real base URL if the provided URL is a proxy URL with a `url` parameter.
 */
const resolveUrl = (uri, currentUrl) => {
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri;
  }

  let baseUrlString = currentUrl;
  try {
    const parsedCurrent = new URL(currentUrl);
    // If the current URL is itself a proxy URL with a 'url' query param, use that as the base.
    if (parsedCurrent.searchParams.has('url')) {
      baseUrlString = parsedCurrent.searchParams.get('url');
    }
    
    const resolvedUrl = new URL(uri, baseUrlString).href;
    return resolvedUrl;
  } catch (error) {
    console.warn(`[Warning] Failed to resolve URL: ${uri} against ${currentUrl}`);
    return uri;
  }
};

/**
 * Fetches an m3u8 playlist and rewrites its contents.
 * @param {string} targetUrl - The original m3u8 URL to fetch
 * @param {string} host - The host of the current server (e.g., localhost:3000)
 * @returns {Promise<string>} The rewritten m3u8 content
 */
const fetchAndRewritePlaylist = async (targetUrl, host) => {
  const headers = getProxyHeaders();
  
  const response = await fetch(targetUrl, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch playlist: ${response.status} ${response.statusText}`);
  }
  
  const content = await response.text();
  const lines = content.split('\\n');
  
  const rewrittenLines = lines.map(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return line;

    // Rewrite URIs in EXT-X-MAP, EXT-X-KEY tags, etc.
    if (trimmedLine.startsWith('#')) {
      // Regex to find URI="..."
      const uriRegex = /URI="([^"]+)"/g;
      if (uriRegex.test(trimmedLine)) {
        return trimmedLine.replace(uriRegex, (match, p1) => {
          const absoluteUrl = resolveUrl(p1, targetUrl);
          const isPlaylist = absoluteUrl.includes('.m3u8');
          const proxyEndpoint = isPlaylist ? '/api/playlist' : '/api/segment';
          const encodedUrl = encodeURIComponent(absoluteUrl);
          // Use relative paths to completely avoid HTTPS/HTTP mixed content issues
          return `URI="${proxyEndpoint}?url=${encodedUrl}"`;
        });
      }
      return line; // Other tags remain unchanged
    }

    // It's a URI line (segment or nested playlist)
    const absoluteUrl = resolveUrl(trimmedLine, targetUrl);
    const isPlaylist = absoluteUrl.includes('.m3u8');
    const proxyEndpoint = isPlaylist ? '/api/playlist' : '/api/segment';
    const encodedUrl = encodeURIComponent(absoluteUrl);
    
    // Use relative paths
    return `${proxyEndpoint}?url=${encodedUrl}`;
  });

  return rewrittenLines.join('\\n');
};

module.exports = { fetchAndRewritePlaylist };
