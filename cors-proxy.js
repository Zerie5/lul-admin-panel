// Simple CORS proxy for development
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 8888;

// Enable CORS for all routes
app.use(cors({ origin: true, credentials: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Proxy all requests to the backend
app.use('/', createProxyMiddleware({
  target: 'https://lul-backend.onrender.com',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // Add auth header if needed
    // proxyReq.setHeader('Authorization', 'Bearer your-token');
    
    // Log the proxy request
    console.log(`Proxying ${req.method} ${req.url} to https://lul-backend.onrender.com${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log the proxy response
    console.log(`Response from proxy: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.end(`Proxy error: ${err.message}`);
  }
}));

app.listen(PORT, () => {
  console.log(`CORS Proxy running at http://localhost:${PORT}`);
console.log(`Proxying requests to https://lul-backend.onrender.com`);
}); 