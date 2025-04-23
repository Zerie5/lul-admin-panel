import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context';
import authService from './services/authService';

// Initialize auth
authService.initializeAuth();

const App = () => {
  // Simple check if authenticated
  const isAuthenticated = authService.isAuthenticated();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Default redirect */}
              <Route 
                path="*" 
                element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
              />
            </Routes>
          </Box>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App; 