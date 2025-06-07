import axios from 'axios';

// Create an axios instance with base URL using type assertion
// to avoid TypeScript errors with axios.create
const api = (axios as any).create({
  baseURL: process.env.REACT_APP_API_URL || 'https://lul-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api; 