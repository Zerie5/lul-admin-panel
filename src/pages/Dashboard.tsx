import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CardHeader,
  IconButton,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  useDashboardSummary,
  useTransactionTrends,
  useUserActivity,
  useRecentTransactions,
  useMetricsSummary
} from '../hooks/useDashboardData';
import httpService from '../services/httpService';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { TransactionTrend } from '../services/dashboardService';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Tooltip from '@mui/material/Tooltip';
import authService from '../services/authService';
import { API_BASE_URL } from '../config';

// Simple error boundary component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Error caught by error boundary:', event.error);
      setHasError(true);
      setError(event.error);
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <Box sx={{ p: 3, border: '1px solid #d32f2f', borderRadius: 2, bgcolor: '#ffebee' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Component Error
        </Typography>
        <Typography variant="body1" gutterBottom>
          There was an error rendering this component. This might be due to library conflicts.
        </Typography>
        {error && (
          <Typography variant="body2" sx={{ 
            fontFamily: 'monospace', 
            bgcolor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1, 
            overflowX: 'auto' 
          }}>
            {error.message}
          </Typography>
        )}
      </Box>
    );
  }

  return <>{children}</>;
};

// Format date helper function
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString;
  }
};

// Format timestamp helper function
const formatTimestamp = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch (error) {
    return timestamp;
  }
};

// Get status color for transaction
const getStatusColor = (status: string): "success" | "warning" | "error" | "default" => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('complete')) return 'success';
  if (statusLower.includes('pending')) return 'warning';
  if (statusLower.includes('fail')) return 'error';
  return 'default';
};

// Function to transform user activity data for chart display
const transformUserActivityData = (userActivity: any) => {
  if (!userActivity) return [];
  
  const { activeUsersByDate, newUsersByDate, transactionsByDate } = userActivity;
  
  // Create an array of all dates from the response
  const allDates = new Set([
    ...Object.keys(activeUsersByDate || {}),
    ...Object.keys(newUsersByDate || {}),
    ...Object.keys(transactionsByDate || {})
  ]);
  
  // Sort dates chronologically
  const sortedDates = Array.from(allDates).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );
  
  // Transform the data for chart display
  return sortedDates.map(date => ({
    date,
    activeUsers: activeUsersByDate?.[date] || 0,
    newUsers: newUsersByDate?.[date] || 0,
    transactions: transactionsByDate?.[date] || 0
  }));
};

// Dashboard component with all data
const Dashboard = () => {
  // Use the theme
  const theme = useTheme();
  
  // State for transaction trends date filter
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30days');
  const [trendsPeriod, setTrendsPeriod] = useState<{
    startDate: string;
    endDate: string;
  }>(() => {
    // Default to last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    return {
      startDate: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      endDate: endDate.toISOString().split('T')[0]      // Format as YYYY-MM-DD
    };
  });
  
  // Use the same period for user activity data
  const [userActivityPeriod, setUserActivityPeriod] = useState<{
    startDate: string;
    endDate: string;
  }>(trendsPeriod);
  
  // Use the data hooks for dashboard data
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary, error: summaryError } = useDashboardSummary(trendsPeriod.startDate, trendsPeriod.endDate);
  const { 
    data: trends, 
    isLoading: trendsLoading, 
    error: trendsError,
    refetch: refetchTrends
  } = useTransactionTrends(trendsPeriod.startDate, trendsPeriod.endDate);
  const { 
    data: userActivity, 
    isLoading: activityLoading, 
    error: activityError,
    refetch: refetchUserActivity
  } = useUserActivity(userActivityPeriod.startDate, userActivityPeriod.endDate);
  const [transactionPage, setTransactionPage] = useState<number>(0);
  const [transactionPageSize, setTransactionPageSize] = useState<number>(5);
  const { 
    data: transactionsData, 
    isLoading: transactionsLoading, 
    error: transactionsError 
  } = useRecentTransactions(transactionPageSize, transactionPage, trendsPeriod.startDate, trendsPeriod.endDate);
  const { data: metricsSummary, isLoading: metricsSummaryLoading, error: metricsSummaryError, refetch: refetchMetricsSummary } = useMetricsSummary(trendsPeriod.startDate, trendsPeriod.endDate);
  
  const [error, setError] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | 'testing' | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [troubleshootDialogOpen, setTroubleshootDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    console.log('Dashboard component mounted');
    console.log('ENV variables:', import.meta.env);
  }, []);

  // Log when data changes
  useEffect(() => {
    if (!summaryLoading) {
      console.log('Summary data loaded:', summary);
    }
    if (!trendsLoading) {
      console.log('Trends data loaded:', trends);
    }
    if (!activityLoading) {
      console.log('Activity data loaded:', userActivity);
    }
    if (!transactionsLoading) {
      console.log('Transactions data loaded:', transactionsData);
    }
  }, [summaryLoading, summary, trendsLoading, trends, activityLoading, userActivity, transactionsLoading, transactionsData]);

  // Handle errors from any of the data hooks
  useEffect(() => {
    if (summaryError) {
      console.error('Summary data error:', summaryError);
      showErrorSnackbar('Failed to load dashboard summary data');
    }
    if (trendsError) {
      console.error('Trends data error:', trendsError);
      showErrorSnackbar('Failed to load transaction trends data');
    }
    if (activityError) {
      console.error('Activity data error:', activityError);
      showErrorSnackbar('Failed to load user activity data');
    }
    if (transactionsError) {
      console.error('Transactions data error:', transactionsError);
      showErrorSnackbar('Failed to load recent transactions data');
    }
  }, [summaryError, trendsError, activityError, transactionsError]);

  // Function to manually refetch data
  const handleRefetch = () => {
    console.log('Manually refetching data with time period:', { startDate: trendsPeriod.startDate, endDate: trendsPeriod.endDate });
    refetchSummary();
    refetchTrends();
    refetchUserActivity();
    refetchMetricsSummary();
    showInfoSnackbar('Refreshing dashboard data...');
  };

  // Function to test API connection
  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('testing');
    setConnectionDetails([]);
    
    try {
      // Use the centralized API URL config
      
      // Log detailed connection info for troubleshooting
      console.log('Testing connection to backend API:', API_BASE_URL);
      console.log('Current origin:', window.location.origin);
      
      const details: string[] = [];
      details.push(`Testing connection to: ${API_BASE_URL}`);
      
      // First try a basic network test
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        await fetch(API_BASE_URL, { 
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'Origin': window.location.origin
          }
        });
        
        clearTimeout(timeoutId);
        details.push('✅ Basic network connectivity test passed');
      } catch (fetchError: any) {
        details.push(`❌ Basic network connectivity test failed: ${fetchError.message}`);
        if (fetchError.message && fetchError.message.includes('CORS')) {
          details.push('⚠️ CORS issue detected. Backend needs to enable CORS.');
        }
      }
      
      // Try the API connection - pass the apiUrl to ensure consistency
      const isConnected = await httpService.testConnection(API_BASE_URL);
      
      if (isConnected) {
        console.log('API connection test successful');
        setConnectionStatus('success');
        details.push('✅ Successfully connected to backend API');
        showSuccessSnackbar('Successfully connected to the backend API');
      } else {
        console.error('API connection test failed');
        setConnectionStatus('error');
        details.push('❌ Failed to connect to backend API endpoints');
        
        // Check for CORS
        try {
          const corsCheck = await httpService.checkCorsConfig(API_BASE_URL);
          if (corsCheck.success && corsCheck.corsEnabled) {
            details.push('✅ CORS is properly configured on the backend');
          } else {
            details.push('❌ CORS is not properly configured on the backend');
            details.push(`⚠️ Backend should allow requests from: ${window.location.origin}`);
          }
        } catch (corsError: any) {
          details.push(`❌ CORS check failed: ${corsError.message}`);
        }
        
        details.push('See console for more detailed diagnostics');
        showErrorSnackbar('Failed to connect to the backend API');
      }
      
      setConnectionDetails(details);
    } catch (error: any) {
      console.error('Error testing API connection:', error);
      setConnectionStatus('error');
      setConnectionDetails([
        'Error during connection test',
        `Error message: ${error.message || 'Unknown error'}`
      ]);
      showErrorSnackbar('Error testing API connection');
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  // Function to check CORS configuration
  const checkCorsConfig = async () => {
    try {
      showInfoSnackbar('Checking CORS configuration...');
      const result = await httpService.checkCorsConfig();
      
      if (result.success && result.corsEnabled) {
        showSuccessSnackbar('CORS is properly configured on the backend');
      } else {
        showErrorSnackbar('CORS is not properly configured on the backend');
      }
    } catch (error: any) {
      showErrorSnackbar(`CORS check failed: ${error.message}`);
    }
  };
  
  // Function to open troubleshoot dialog
  const openTroubleshootDialog = () => {
    setTroubleshootDialogOpen(true);
  };
  
  // Function to close troubleshoot dialog
  const closeTroubleshootDialog = () => {
    setTroubleshootDialogOpen(false);
  };

  // Helper functions for snackbar
  const showSuccessSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const showErrorSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
  };

  const showInfoSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Function to copy CORS config to clipboard
  const copyBackendCorsConfig = () => {
    const corsConfig = `
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("${window.location.origin}")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
    `;

    navigator.clipboard.writeText(corsConfig);
    showSuccessSnackbar('CORS configuration copied to clipboard');
  };

  // Function to copy application.properties CORS config
  const copyPropertiesCorsConfig = () => {
    const propertiesConfig = `
# CORS Configuration
spring.web.cors.allowed-origins=${window.location.origin}
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
    `;

    navigator.clipboard.writeText(propertiesConfig);
    showSuccessSnackbar('CORS properties configuration copied to clipboard');
  };

  // Function to test Spring Boot CORS
  const testSpringBootCors = async () => {
    try {
      showInfoSnackbar('Testing Spring Boot CORS configuration...');
      
      setConnectionStatus('testing');
      setConnectionDetails([`Running detailed CORS test against ${API_BASE_URL}...`]);
      
      const results = await httpService.testSpringBootCors(API_BASE_URL);
      
      // Update details with test results
      const details = [
        `Spring Boot CORS Test Results for ${API_BASE_URL}:`,
        `CORS configured: ${results.corsConfigured ? 'Yes ✅' : 'No ❌'}`,
        ...results.details,
        '',
        'Endpoint Results:'
      ];
      
      // Add endpoint results
      results.endpoints.forEach(endpoint => {
        if (endpoint.error) {
          details.push(`❌ ${endpoint.url}: Error - ${endpoint.error}`);
        } else {
          details.push(`${endpoint.corsAllowOrigin ? '✅' : '❌'} ${endpoint.url}: Status ${endpoint.status}${endpoint.corsAllowOrigin ? ', CORS headers found' : ', No CORS headers'}`);
        }
      });
      
      setConnectionDetails(details);
      setConnectionStatus(results.success ? 'success' : 'error');
      
      if (results.success) {
        showSuccessSnackbar('Spring Boot CORS is configured correctly');
      } else {
        showErrorSnackbar('Spring Boot CORS is not configured correctly');
      }
    } catch (error: any) {
      console.error('Error testing Spring Boot CORS:', error);
      showErrorSnackbar(`Error testing Spring Boot CORS: ${error.message}`);
      setConnectionStatus('error');
      setConnectionDetails([`Error testing Spring Boot CORS: ${error.message}`]);
    }
  };

  // Function to handle trend period change
  const handleTrendPeriodChange = (period: string) => {
    setSelectedPeriod(period);
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch(period) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '180days':
        startDate.setDate(startDate.getDate() - 180);
        break;
      case '365days':
        startDate.setDate(startDate.getDate() - 365);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    // Format as YYYY-MM-DD
    const newPeriod = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
    
    console.log('Setting new time period:', newPeriod);
    
    try {
      setTrendsPeriod(newPeriod);
      setUserActivityPeriod(newPeriod);
      
      // Show loading indicator
      showInfoSnackbar(`Updating dashboard for ${period}...`);
      
      // Force refresh data with new period
      setTimeout(() => {
        refetchSummary();
        refetchTrends();
        refetchUserActivity();
        refetchMetricsSummary();
      }, 100);
    } catch (error) {
      console.error('Error setting time period:', error);
      showErrorSnackbar('Failed to update dashboard time period. Please try again.');
    }
  };

  const handleTransactionPageChange = (
    _event: React.SyntheticEvent | null,
    newPage: number
  ) => {
    setTransactionPage(newPage);
  };

  const handleTransactionRowsPerPageChange = (
    event: SelectChangeEvent<number>
  ) => {
    setTransactionPageSize(event.target.value as number);
    setTransactionPage(0);
  };

  // Function to test authentication
  const testAuthentication = async () => {
    showInfoSnackbar('Testing authentication...');
    const result = await httpService.testAuth();
    if (result) {
      showSuccessSnackbar('Authentication test passed!');
    } else {
      showErrorSnackbar('Authentication test failed!');
      // Also run debug checks
      httpService.debugAuthToken();
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    showInfoSnackbar('Logging out...');
    
    // Clear authentication data
    authService.logout();
    
    // Redirect to login page
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h5">
          Error Loading Dashboard
        </Typography>
        <Typography>{error}</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleRefetch}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }
  
  return (
    <ErrorBoundary>
      <Box sx={{ 
        flexGrow: 1, 
        background: `linear-gradient(135deg, ${theme.palette.background.default}80, ${theme.palette.background.paper})`,
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.03)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: { xs: 3, md: 4 }, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600, 
              color: theme.palette.primary.main,
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                left: 0,
                bottom: -8,
                width: 60,
                height: 4,
                backgroundColor: theme.palette.secondary.main,
                borderRadius: 2
              }
            }}
          >
            Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Chip
              label={authService.isAuthenticated() ? "Authenticated" : "Not Authenticated"}
              color={authService.isAuthenticated() ? "success" : "error"}
              size="small"
              sx={{ fontWeight: 500 }}
            />
            {authService.isAuthenticated() && authService.getUserData() && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                Logged in as: {authService.getUserData()?.username || 'Unknown'}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="global-period-select-label">Time Period</InputLabel>
              <Select
                labelId="global-period-select-label"
                id="global-period-select"
                value={selectedPeriod}
                label="Time Period"
                onChange={(e) => handleTrendPeriodChange(e.target.value)}
                sx={{ borderRadius: 2 }}
                disabled={trendsLoading || activityLoading || metricsSummaryLoading}
              >
                <MenuItem value="7days">Last 7 Days</MenuItem>
                <MenuItem value="30days">Last 30 Days</MenuItem>
                <MenuItem value="90days">Last 90 Days</MenuItem>
                <MenuItem value="180days">Last 180 Days</MenuItem>
                <MenuItem value="365days">Last 365 Days</MenuItem>
              </Select>
            </FormControl>
            <Button 
              onClick={testConnection} 
              variant="outlined" 
              color={connectionStatus === 'success' ? 'success' : connectionStatus === 'error' ? 'error' : 'primary'}
              disabled={isTestingConnection}
              sx={{ 
                borderRadius: 4,
                boxShadow: '0 2px 5px rgba(0,0,0,0.08)'
              }}
            >
              {isTestingConnection ? 'Testing...' : 'Test API Connection'}
            </Button>
            <Button 
              onClick={testAuthentication} 
              variant="outlined" 
              color="secondary"
              sx={{ 
                borderRadius: 4,
                boxShadow: '0 2px 5px rgba(0,0,0,0.08)'
              }}
            >
              Test Authentication
            </Button>
            <Button 
              onClick={handleRefetch} 
              variant="contained"
              startIcon={<RefreshIcon />}
              sx={{ 
                borderRadius: 4,
                boxShadow: '0 2px 5px rgba(0,0,0,0.08)'
              }}
            >
              Refresh
            </Button>
            <Button 
              onClick={handleLogout} 
              variant="contained"
              color="error"
              sx={{ 
                borderRadius: 4,
                boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                ml: 'auto'
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
        
        <Typography 
          variant="body1" 
          paragraph
          sx={{ 
            color: theme.palette.text.secondary, 
            fontWeight: 500,
            fontSize: '1.05rem',
            mb: 4
          }}
        >
          Welcome to the LulPay Admin Dashboard
        </Typography>
        
        {/* Connection status alert if connection test was run */}
        {connectionStatus && (
          <Paper 
            sx={{ 
              mb: 4, 
              overflow: 'hidden',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <Alert 
              severity={connectionStatus === 'success' ? 'success' : 'error'} 
              sx={{ px: 2, py: 1 }}
              action={
                connectionStatus === 'error' && (
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={openTroubleshootDialog}
                  >
                    Troubleshoot
                  </Button>
                )
              }
            >
              {connectionStatus === 'success' 
                ? 'Successfully connected to the backend API.' 
                : 'Failed to connect to the backend API. See details below.'}
            </Alert>
            
            {connectionDetails.length > 0 && (
              <List dense sx={{ bgcolor: '#f5f5f5', py: 0 }}>
                {connectionDetails.map((detail, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary={detail} 
                      primaryTypographyProps={{ 
                        variant: 'body2',
                        fontFamily: detail.startsWith('✅') ? undefined : detail.startsWith('❌') ? 'monospace' : undefined,
                        color: detail.startsWith('✅') ? 'success.main' : detail.startsWith('❌') ? 'error.main' : detail.startsWith('⚠️') ? 'warning.main' : undefined
                      }} 
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        )}
        
        {/* Debug information - will only show in debug mode */}
        {/* 
        {import.meta.env.VITE_DEBUG === 'true' && (
          <Paper 
            sx={{ 
              p: 2, 
              mb: 3, 
              borderRadius: 3,
              backgroundColor: '#f5f5f5',
              border: `1px dashed ${theme.palette.primary.light}`
            }}
          >
            <Typography variant="h6" gutterBottom>Debug Information</Typography>
            <Typography variant="body2">
              Loading states: Summary={String(summaryLoading)}, Trends={String(trendsLoading)}, 
              Activity={String(activityLoading)}, Transactions={String(transactionsLoading)}
            </Typography>
            <Typography variant="body2">
              Error states: Summary={Boolean(summaryError).toString()}, Trends={Boolean(trendsError).toString()}, 
              Activity={Boolean(activityError).toString()}, Transactions={Boolean(transactionsError).toString()}
            </Typography>
            <Typography variant="body2">
              API URL: {API_BASE_URL}
            </Typography>
          </Paper>
        )}
        */}

      <Grid container spacing={3}>
        {/* Summary Cards - First Row */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {/* Total Transactions */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.09)'
                }
              }}>
                <CardHeader
                  avatar={
                    <IconButton 
                      sx={{ 
                        bgcolor: `${theme.palette.primary.main}15`,
                        color: theme.palette.primary.main,
                        p: 1,
                        '&:hover': {
                          bgcolor: `${theme.palette.primary.main}25`,
                        }
                      }}
                    >
                      <CreditCardIcon />
                    </IconButton>
                  }
                  title="Total Transactions"
                  titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                />
                <CardContent sx={{ pt: 0 }}>
                  {summaryLoading ? (
                    <CircularProgress size={24} />
                  ) : summaryError ? (
                    <Typography color="error">Error loading data</Typography>
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.dark }}>
                      {summary?.totalTransactions?.toLocaleString() || '0'}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderLeft: `4px solid ${theme.palette.secondary.dark}`,
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.09)'
                }
              }}>
                <CardHeader
                  avatar={
                    <IconButton 
                      sx={{ 
                        bgcolor: `${theme.palette.secondary.main}15`,
                        color: theme.palette.secondary.dark,
                        p: 1,
                        '&:hover': {
                          bgcolor: `${theme.palette.secondary.main}25`,
                        }
                      }}
                    >
                      <MonetizationOnIcon />
                    </IconButton>
                  }
                  title="Total Value"
                  titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                />
                <CardContent sx={{ pt: 0 }}>
                  {summaryLoading ? (
                    <CircularProgress size={24} />
                  ) : summaryError ? (
                    <Typography color="error">Error loading data</Typography>
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.secondary.dark }}>
                      ${summary?.totalTransactionValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.09)'
                }
              }}>
                <CardHeader
                  avatar={
                    <IconButton 
                      sx={{ 
                        bgcolor: `${theme.palette.primary.main}15`,
                        color: theme.palette.primary.main,
                        p: 1,
                        '&:hover': {
                          bgcolor: `${theme.palette.primary.main}25`,
                        }
                      }}
                    >
                      <PeopleIcon />
                    </IconButton>
                  }
                  title="Active Users"
                  titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                />
                <CardContent sx={{ pt: 0 }}>
                  {summaryLoading ? (
                    <CircularProgress size={24} />
                  ) : summaryError ? (
                    <Typography color="error">Error loading data</Typography>
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.dark }}>
                      {summary?.activeUsers?.toLocaleString() || '0'}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderLeft: `4px solid ${theme.palette.secondary.dark}`,
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.09)'
                }
              }}>
                <CardHeader
                  avatar={
                    <IconButton 
                      sx={{ 
                        bgcolor: `${theme.palette.secondary.main}15`,
                        color: theme.palette.secondary.dark,
                        p: 1,
                        '&:hover': {
                          bgcolor: `${theme.palette.secondary.main}25`,
                        }
                      }}
                    >
                      <AttachMoneyIcon />
                    </IconButton>
                  }
                  title="Total Revenue"
                  titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                />
                <CardContent sx={{ pt: 0 }}>
                  {summaryLoading ? (
                    <CircularProgress size={24} />
                  ) : summaryError ? (
                    <Typography color="error">Error loading data</Typography>
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.secondary.dark }}>
                      ${summary?.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Additional Metric Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.09)'
                }
              }}>
                <CardHeader
                  avatar={
                    <IconButton 
                      sx={{ 
                        bgcolor: `${theme.palette.primary.main}15`,
                        color: theme.palette.primary.main,
                        p: 1,
                        '&:hover': {
                          bgcolor: `${theme.palette.primary.main}25`,
                        }
                      }}
                    >
                      <ShowChartIcon />
                    </IconButton>
                  }
                  title="Avg Transaction Size"
                  titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                />
                <CardContent sx={{ pt: 0 }}>
                  {metricsSummaryLoading ? (
                    <CircularProgress size={24} />
                  ) : metricsSummaryError ? (
                    <Typography color="error">Error loading data</Typography>
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.dark }}>
                      ${metricsSummary?.avgTransactionSize?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderLeft: `4px solid ${theme.palette.secondary.dark}`,
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.09)'
                }
              }}>
                <CardHeader
                  avatar={
                    <IconButton 
                      sx={{ 
                        bgcolor: `${theme.palette.secondary.main}15`,
                        color: theme.palette.secondary.dark,
                        p: 1,
                        '&:hover': {
                          bgcolor: `${theme.palette.secondary.main}25`,
                        }
                      }}
                    >
                      <AttachMoneyIcon />
                    </IconButton>
                  }
                  title="Fee-to-Transaction Ratio"
                  titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                />
                <CardContent sx={{ pt: 0 }}>
                  {metricsSummaryLoading ? (
                    <CircularProgress size={24} />
                  ) : metricsSummaryError ? (
                    <Typography color="error">Error loading data</Typography>
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.secondary.dark }}>
                      {metricsSummary?.feeRatio?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}%
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.09)'
                }
              }}>
                <CardHeader
                  avatar={
                    <IconButton 
                      sx={{ 
                        bgcolor: `${theme.palette.primary.main}15`,
                        color: theme.palette.primary.main,
                        p: 1,
                        '&:hover': {
                          bgcolor: `${theme.palette.primary.main}25`,
                        }
                      }}
                    >
                      <TrendingUpIcon />
                    </IconButton>
                  }
                  title="User Growth Rate"
                  titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                />
                <CardContent sx={{ pt: 0 }}>
                  {metricsSummaryLoading ? (
                    <CircularProgress size={24} />
                  ) : metricsSummaryError ? (
                    <Typography color="error">Error loading data</Typography>
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.dark }}>
                      {metricsSummary?.userGrowth?.toLocaleString() || '0'}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderLeft: `4px solid ${theme.palette.secondary.dark}`,
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.09)'
                }
              }}>
                <CardHeader
                  avatar={
                    <IconButton 
                      sx={{ 
                        bgcolor: `${theme.palette.secondary.main}15`,
                        color: theme.palette.secondary.dark,
                        p: 1,
                        '&:hover': {
                          bgcolor: `${theme.palette.secondary.main}25`,
                        }
                      }}
                    >
                      <ReceiptIcon />
                    </IconButton>
                  }
                  title="Transactions per User"
                  titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                />
                <CardContent sx={{ pt: 0 }}>
                  {metricsSummaryLoading ? (
                    <CircularProgress size={24} />
                  ) : metricsSummaryError ? (
                    <Typography color="error">Error loading data</Typography>
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.secondary.dark }}>
                      {metricsSummary?.transactionsPerUser?.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) || '0.0'}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Transaction Trends Chart */}
            <Grid item xs={12} lg={8}>
              <Paper sx={{ 
                p: 0, 
                overflow: 'hidden',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.09)'
                }
              }}>
                <Box sx={{ 
                  px: 3, 
                  py: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.primary.main}05)`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ShowChartIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="h6" sx={{ color: theme.palette.primary.dark }}>
                      Transaction Trends
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ p: 2, height: 350 }}>
                  {trendsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : trendsError ? (
                    <Alert severity="error">Failed to load transaction trends data</Alert>
                  ) : !trends || trends.length === 0 ? (
                    <Alert severity="info">No transaction trends data available</Alert>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trends}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(str) => {
                            const date = new Date(str);
                            return date.toLocaleDateString().split('/').slice(0, 2).join('/');
                          }}
                        />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <RechartsTooltip
                          formatter={(value, name) => {
                            if (name === 'count') return [value, 'Number of Transactions'];
                            if (name === 'value') return [`$${Number(value).toLocaleString()}`, 'Transaction Value'];
                            return [value, name];
                          }}
                          labelFormatter={(value) => {
                            const date = new Date(value);
                            return `Date: ${date.toLocaleDateString()}`;
                          }}
                        />
                        <Legend />
                        <Line
                          yAxisId="left" 
                          type="monotone" 
                          dataKey="count" 
                          name="Transaction Count"
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="value" 
                          name="Transaction Value ($)"
                          stroke="#82ca9d" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </Paper>
            </Grid>
            
            {/* User Activity Chart */}
            <Grid item xs={12} lg={4}>
              <Paper sx={{ 
                p: 0, 
                height: '100%',
                overflow: 'hidden',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.09)'
                }
              }}>
                <Box sx={{ 
                  px: 3, 
                  py: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main}10, ${theme.palette.secondary.main}05)`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ color: theme.palette.secondary.dark, mr: 1 }} />
                    <Typography variant="h6" sx={{ color: theme.palette.secondary.dark }}>
                      User Activity
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ p: 2, height: 335 }}>
                  {activityLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : activityError ? (
                    <Alert severity="error">Failed to load user activity data</Alert>
                  ) : !userActivity ? (
                    <Alert severity="info">No user activity data available</Alert>
                  ) : (
                    <Box>
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Active Users: <strong>{userActivity.totalActiveUsers}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          User Growth: <strong>{(userActivity.userGrowthRate * 100).toFixed(1)}%</strong>
                        </Typography>
                      </Box>
                      
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart
                          data={transformUserActivityData(userActivity)}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(str) => {
                              const date = new Date(str);
                              return date.toLocaleDateString().split('/').slice(0, 2).join('/');
                            }}
                          />
                          <YAxis />
                          <RechartsTooltip
                            formatter={(value, name) => {
                              if (name === 'newUsers') return [value, 'New Users'];
                              if (name === 'activeUsers') return [value, 'Active Users'];
                              if (name === 'transactions') return [value, 'Transactions'];
                              return [value, name];
                            }}
                            labelFormatter={(value) => `Date: ${value}`}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="activeUsers"
                            name="Active Users"
                            stroke="#82ca9d"
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="newUsers"
                            name="New Users"
                            stroke="#ff7300"
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="transactions"
                            name="Transactions"
                            stroke="#8884d8"
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Recent Transactions Table */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  height: '100%'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Recent Transactions
                  </Typography>
                  {transactionsData && (
                    <Typography variant="body2" color="text.secondary">
                      Showing {transactionsData.content.length} of {transactionsData.totalElements} transactions
                    </Typography>
                  )}
                </Box>
                <Box sx={{ overflow: 'auto' }}>
                  {transactionsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                      <CircularProgress size={40} />
                    </Box>
                  ) : transactionsError ? (
                    <Alert severity="error">
                      Failed to load recent transactions. Please try refreshing the page.
                    </Alert>
                  ) : (
                    <>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>From</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>To</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {transactionsData?.content.map((tx) => (
                              <TableRow key={tx.id}>
                                <TableCell>#{tx.id}</TableCell>
                                <TableCell>
                                  <Tooltip title={tx.userName} placement="top">
                                    <Typography
                                      sx={{
                                        maxWidth: 150,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        fontWeight: 500
                                      }}
                                    >
                                      {tx.userName}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                                <TableCell>
                                  <Tooltip title={tx.receiverName} placement="top">
                                    <Typography
                                      sx={{
                                        maxWidth: 150,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        fontWeight: 500
                                      }}
                                    >
                                      {tx.receiverName || 'N/A'}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 500, color: theme.palette.secondary.dark }}>
                                  ${typeof tx.amount === 'number' ? tx.amount.toFixed(2) : tx.amount}
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={tx.type} 
                                    size="small"
                                    sx={{ 
                                      fontWeight: 500,
                                      backgroundColor: `${theme.palette.primary.main}15`,
                                      color: theme.palette.primary.dark,
                                      boxShadow: '0 2px 5px rgba(0,0,0,0.08)'
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={tx.status} 
                                    color={getStatusColor(tx.status)}
                                    size="small"
                                    sx={{ 
                                      fontWeight: 500,
                                      boxShadow: '0 2px 5px rgba(0,0,0,0.08)'
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  {tx.description ? (
                                    <Tooltip 
                                      title={tx.description} 
                                      placement="top"
                                    >
                                      <Typography
                                        sx={{
                                          maxWidth: 200,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          color: theme.palette.text.secondary
                                        }}
                                      >
                                        {tx.description}
                                      </Typography>
                                    </Tooltip>
                                  ) : (
                                    <Typography
                                      sx={{
                                        color: theme.palette.text.disabled,
                                        fontStyle: 'italic'
                                      }}
                                    >
                                      No description
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>{formatTimestamp(tx.timestamp)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        alignItems: 'center',
                        mt: 2,
                        gap: 2
                      }}>
                        <FormControl variant="standard" sx={{ minWidth: 120 }}>
                          <Select
                            value={transactionPageSize}
                            onChange={handleTransactionRowsPerPageChange}
                            sx={{ height: 30 }}
                          >
                            <MenuItem value={5}>5 per page</MenuItem>
                            <MenuItem value={10}>10 per page</MenuItem>
                            <MenuItem value={25}>25 per page</MenuItem>
                          </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton 
                            onClick={(e) => handleTransactionPageChange(e, transactionPage - 1)}
                            disabled={!transactionsData?.content.length || transactionsData.first}
                          >
                            <NavigateBeforeIcon />
                          </IconButton>
                          <Typography variant="body2" sx={{ mx: 2 }}>
                            Page {transactionPage + 1} of {transactionsData?.totalPages || 1}
                          </Typography>
                          <IconButton
                            onClick={(e) => handleTransactionPageChange(e, transactionPage + 1)}
                            disabled={!transactionsData?.content.length || transactionsData.last}
                          >
                            <NavigateNextIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
    
    {/* Troubleshooting Dialog */}
    <Dialog
      open={troubleshootDialogOpen}
      onClose={closeTroubleshootDialog}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: theme.palette.primary.main, 
        color: '#fff',
        borderBottom: `1px solid ${theme.palette.primary.dark}`
      }}>
        API Connection Troubleshooting
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>Common Issues</Typography>
        
        <Typography 
          variant="subtitle1" 
          gutterBottom
          sx={{ 
            color: theme.palette.primary.dark,
            fontWeight: 600,
            mt: 2
          }}
        >
          1. CORS (Cross-Origin Resource Sharing) Issues
        </Typography>
        <Typography variant="body2" paragraph>
          The most common reason for API connection failures is CORS restrictions. Your Spring Boot backend
          needs to be configured to allow requests from your frontend origin ({window.location.origin}).
        </Typography>
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={copyBackendCorsConfig}
            startIcon={<ContentCopyIcon />}
            sx={{ borderRadius: 2 }}
          >
            Copy Java Config
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={copyPropertiesCorsConfig}
            startIcon={<ContentCopyIcon />}
            sx={{ borderRadius: 2 }}
          >
            Copy Properties Config
          </Button>
        </Box>
        
        <Typography 
          variant="subtitle1" 
          gutterBottom
          sx={{ 
            color: theme.palette.primary.dark,
            fontWeight: 600,
            mt: 2
          }}
        >
          2. Backend Server Not Running
        </Typography>
        <Typography variant="body2" paragraph>
          Verify that your Spring Boot application is running at {API_BASE_URL} and 
          that you can access it directly in your browser (try {`${API_BASE_URL}/actuator/health`} 
          or {`${API_BASE_URL}/api/admin/dashboard/summary`}).
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          gutterBottom
          sx={{ 
            color: theme.palette.primary.dark,
            fontWeight: 600,
            mt: 2
          }}
        >
          3. Incorrect API Paths
        </Typography>
        <Typography variant="body2" paragraph>
          Ensure that the API endpoints in your dashboard service match the actual endpoints in your Spring Boot application:
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'monospace', 
            bgcolor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1,
            border: `1px solid ${theme.palette.grey[300]}`
          }} 
          paragraph
        >
          SUMMARY: '/api/admin/dashboard/summary'<br/>
          TRANSACTION_TRENDS: '/api/admin/dashboard/transaction-trends'<br/>
          USER_ACTIVITY: '/api/admin/dashboard/user-activity'<br/>
          RECENT_TRANSACTIONS: '/api/admin/dashboard/recent-transactions'
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          gutterBottom
          sx={{ 
            color: theme.palette.primary.dark,
            fontWeight: 600,
            mt: 2
          }}
        >
          4. Network/Firewall Issues
        </Typography>
        <Typography variant="body2" paragraph>
          If you're running the frontend and backend on different networks or machines, ensure that:
          <br/>- There are no firewall restrictions blocking access to port 8080
          <br/>- The Spring Boot server is bound to the correct interface (not just localhost)
          <br/>- If using Docker, ports are properly mapped and exposed
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button 
          onClick={closeTroubleshootDialog}
          sx={{ borderRadius: 2 }}
        >
          Close
        </Button>
        <Button 
          onClick={testConnection} 
          variant="contained"
          color="primary"
          sx={{ borderRadius: 2 }}
        >
          Test Connection Again
        </Button>
      </DialogActions>
    </Dialog>
    
    {/* Snackbar for notifications */}
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleSnackbarClose} 
        severity={snackbarSeverity} 
        sx={{ 
          width: '100%',
          boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
          borderRadius: 2
        }}
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>
  </ErrorBoundary>
  );
};

export default Dashboard; 