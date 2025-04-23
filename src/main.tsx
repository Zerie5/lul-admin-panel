import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './router/AppRouter';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import './index.css';

// Initialize global auth state
window.__AUTH_STATE__ = window.__AUTH_STATE__ || {
  isAuthenticated: false,
  userData: null
};

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    },
  },
});

// Find the root element
const rootElement = document.getElementById('root');

// Make sure the root element exists
if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  console.log('Initializing React application...');
  
  // Create a root using the root element
  const root = createRoot(rootElement);
  
  // Render the application
  root.render(
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {React.createElement(AppRouter)}
      </LocalizationProvider>
    </QueryClientProvider>
  );
  
  console.log('React application rendered successfully!');
} catch (error) {
  console.error('Failed to render React application:', error);
  
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #d32f2f;">React Rendering Error</h1>
        <p>There was an error rendering the React application:</p>
        <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">${error instanceof Error ? error.message : 'Unknown error'}</pre>
        <p>Check the console for more details.</p>
      </div>
    `;
  }
}