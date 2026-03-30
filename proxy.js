const http = require('http');
const httpProxy = require('http-proxy-middleware');

// Proxy local pour contourner CORS en dev web
// Lance avec : node proxy.js
// Puis ouvrir http://localhost:3001 au lieu du port Expo

const { createProxyMiddleware } = httpProxy;

const API_SERVER = process.env.EXPO_PUBLIC_API_SERVER_URL || 'http://localhost:3000';

const proxy = createProxyMiddleware({
  target: API_SERVER,
  changeOrigin: true,
  pathFilter: '/api',
});

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api')) {
    proxy(req, res);
  } else {
    // Redirige vers le serveur Expo (port 8081)
    const expoProxy = createProxyMiddleware({
      target: 'http://localhost:8081',
      changeOrigin: true,
      ws: true,
    });
    expoProxy(req, res);
  }
});

server.listen(3001, () => {
  console.log('Proxy dev sur http://localhost:3001');
  console.log(`  /api/* -> ${API_SERVER}`);
  console.log('  /*     -> http://localhost:8081 (Expo)');
});
