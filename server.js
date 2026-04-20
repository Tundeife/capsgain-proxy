const https = require('https');
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;

// Fetch a URL server-side (no CORS issues)
function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    const lib = targetUrl.startsWith('https') ? https : http;
    const req = lib.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
        'Accept': 'text/html,application/xhtml+xml,*/*',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS headers — allow your dashboard to call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  const parsed = url.parse(req.url, true);

  // Health check
  if (parsed.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'Capsgain Proxy running' }));
    return;
  }

  // /fetch?url=YOUR_ZOHO_URL
  if (parsed.pathname === '/fetch') {
    const targetUrl = parsed.query.url;
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing url parameter' }));
      return;
    }

    // Only allow Zoho published sheets for security
    if (!targetUrl.includes('zohopublic.com') && !targetUrl.includes('docs.google.com')) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Only Zoho and Google Sheets URLs allowed' }));
      return;
    }

    try {
      console.log('Fetching:', targetUrl.substring(0, 80));
      const result = await fetchUrl(targetUrl);
      res.writeHead(result.status, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(result.data);
    } catch (e) {
      console.error('Fetch error:', e.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => console.log(`Capsgain Proxy running on port ${PORT}`));
