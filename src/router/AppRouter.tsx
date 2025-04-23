import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import Dashboard from '../pages/Dashboard';
import SimpleProfile from '../pages/SimpleProfile';
import SimpleSettings from '../pages/SimpleSettings';
import Transactions from '../pages/Transactions';
import NonWalletTransfers from '../pages/NonWalletTransfers';
import Reports from '../pages/Reports';
import Login from '../pages/Login';
import SideNavigation from '../components/SideNavigation';
import theme from '../theme';
import authService from '../services/authService';

// Simple AppRouter component
const AppRouter: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Check authentication on component mount
  useEffect(() => {
    console.log("AppRouter - Checking authentication");
    
    // Initialize auth to setup axios with existing token if available
    authService.initializeAuth();
    
    // Check if user is authenticated with a valid JWT token
    const authenticated = authService.isAuthenticated();
    console.log("Is authenticated with JWT:", authenticated);
    
    if (authenticated) {
      // User has a valid JWT token
      const userData = authService.getUserData();
      console.log("Authenticated user:", userData?.username);
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
      
      // Setup session monitoring
      authService.startSessionMonitor(() => {
        // Handle session timeout
        console.log("Session timed out");
        setIsAuthenticated(false);
        setCurrentPage('login');
      });
      
      // Setup activity listeners to extend session
      authService.setupActivityListeners();
    } else {
      // No valid JWT token, force logout to clear any stale data
      authService.logout();
      setIsAuthenticated(false);
      setCurrentPage('login');
    }
    
    // Cleanup on unmount
    return () => {
      authService.stopSessionMonitor();
    };
  }, []);
  
  // Simple navigation
  const navigate = (page: string) => {
    // If not authenticated and trying to access a protected page, go to login
    if (!isAuthenticated && page !== 'login') {
      console.log("Not authenticated, redirecting to login");
      setCurrentPage('login');
      return;
    }
    
    // If authenticated and going to login, go to dashboard instead
    if (isAuthenticated && page === 'login') {
      console.log("Already authenticated, redirecting to dashboard");
      setCurrentPage('dashboard');
      return;
    }
    
    console.log("Navigating to:", page);
    setCurrentPage(page);
  };
  
  // Handle successful login
  const handleLoginSuccess = () => {
    console.log("Login successful, updating state");
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };
  
  // Render the appropriate page
  const renderPage = () => {
    try {
      // Special case for login page
      if (currentPage === 'login') {
        // Pass in custom props to login component to handle navigation
        return <Login onLoginSuccess={handleLoginSuccess} />;
      }
      
      // For authenticated pages
      switch (currentPage) {
        case 'dashboard':
          return React.createElement(Dashboard);
        case 'profile':
          return React.createElement(SimpleProfile);
        case 'settings':
          return React.createElement(SimpleSettings);
        case 'transactions':
          return React.createElement(Transactions);
        case 'non-wallet-transfers':
          return React.createElement(NonWalletTransfers);
        case 'reports':
          return React.createElement(Reports);
        default:
          return React.createElement(Dashboard);
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      return (
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error Loading Page
          </Typography>
          <Typography variant="body1">
            There was an error loading this page. This might be due to missing mock data or dependencies.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, fontFamily: 'monospace', bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            {error instanceof Error ? error.message : String(error)}
          </Typography>
        </Box>
      );
    }
  };
  
  // Get the title for the current page
  const getPageTitle = () => {
    if (currentPage === 'login') return 'Login';
    
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard';
      case 'profile':
        return 'Profile';
      case 'settings':
        return 'Settings';
      case 'transactions':
        return 'Transactions';
      case 'non-wallet-transfers':
        return 'Non-Wallet Transfers';
      case 'reports':
        return 'Reports & Analytics';
      default:
        return 'Lul Admin Panel';
    }
  };
  
  // Don't show the navigation sidebar on the login page
  const showNavigation = currentPage !== 'login';
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {showNavigation && React.createElement(SideNavigation, {
          currentPage,
          onNavigate: navigate
        })}
        <Box sx={{ p: showNavigation ? 3 : 0, pt: showNavigation ? 8 : 0 }}>
          {showNavigation && (
            <Typography variant="h4" gutterBottom sx={{ mb: 3, color: '#18859A' }}>
              {getPageTitle()}
            </Typography>
          )}
          {renderPage()}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AppRouter; 