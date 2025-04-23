const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');

module.exports = function(app) {
  // Handle API requests
  app.use('/api', (req, res, next) => {
    const apiPath = path.join(__dirname, 'api', `${req.path.slice(1)}.js`);
    
    if (fs.existsSync(apiPath)) {
      try {
        const handler = require(apiPath).default;
        handler(req, res);
      } catch (error) {
        console.error(`Error handling API request to ${req.path}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      next();
    }
  });
}; 