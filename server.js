import express from 'express';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables from .env.local first, then fallback to .env
dotenv.config({ path: '.env.local' });
if (!process.env.username || !process.env.password) {
  dotenv.config({ path: '.env' });
}

// Log environment for debugging
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  username: process.env.username ? 'Set' : 'Not set',
  password: process.env.password ? 'Set (value hidden)' : 'Not set',
  PORT: process.env.PORT || 3000
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Handle API requests
app.use('/api', async (req, res) => {
  const apiPath = path.join(__dirname, 'api', `${req.path.slice(1)}.js`);
  
  console.log(`API request: ${req.method} ${req.path}`);
  console.log(`Looking for handler at: ${apiPath}`);
  
  if (fs.existsSync(apiPath)) {
    try {
      // Import the API handler dynamically
      const apiModule = await import(`file://${apiPath}`);
      const handler = apiModule.default;
      
      if (typeof handler !== 'function') {
        throw new Error(`Handler for ${req.path} is not a function`);
      }
      
      await handler(req, res);
    } catch (error) {
      console.error(`Error handling API request to ${req.path}:`, error);
      
      // Only send response if it hasn't been sent already
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Internal Server Error', 
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
    }
  } else {
    console.log(`API endpoint not found: ${apiPath}`);
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
}); 