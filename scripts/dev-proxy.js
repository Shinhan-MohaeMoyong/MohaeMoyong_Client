// Simple CORS proxy for local web development
// Forward /api/... to target backend, adding CORS headers for the browser.

const httpProxy = require('http-proxy');
const http = require('http');

const TARGET = process.env.TARGET || 'http://localhost:8080';
const PORT = parseInt(process.env.PORT || '8085', 10);
const HOST = process.env.HOST || '127.0.0.1'; // bind to localhost only
const WEB_ORIGIN = process.env.WEB_ORIGIN || 'http://localhost:8081';

const proxy = httpProxy.createProxyServer({ target: TARGET, changeOrigin: true });

// Strip Origin header before forwarding to bypass backend CORS checks (mimic Postman)
proxy.on('proxyReq', function (proxyReq, req, res) {
  try {
    if (typeof proxyReq.removeHeader === 'function') {
      proxyReq.removeHeader('origin');
    } else if (proxyReq.getHeader && proxyReq.getHeader('origin')) {
      proxyReq.setHeader('origin', '');
    }
  } catch (_) {}
});

proxy.on('proxyRes', function (proxyRes, req, res) {
  res.setHeader('Access-Control-Allow-Origin', WEB_ORIGIN);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
});

const server = http.createServer(function (req, res) {
  // Only allow /api/* to be proxied
  if (!req.url.startsWith('/api/')) {
    res.writeHead(404);
    return res.end('Not Found');
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': WEB_ORIGIN,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    });
    return res.end();
  }
  proxy.web(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`[dev-proxy] Listening on http://${HOST}:${PORT} -> ${TARGET}`);
});


