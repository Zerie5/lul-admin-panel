import React from 'react';
import { Box, Typography, CircularProgress, Button, Alert } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SearchOffIcon from '@mui/icons-material/SearchOff';

interface ReportStateHandlerProps {
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

const ReportStateHandler = ({
  isLoading,
  error,
  isEmpty,
  emptyMessage = 'No data available for the selected time period',
  errorMessage = 'Failed to load data',
  onRetry,
  children
}: ReportStateHandlerProps) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, minHeight: 300 }}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Loading data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, minHeight: 300 }}>
        <ErrorOutlineIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" color="error" gutterBottom>
          Error Loading Data
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
          {errorMessage}
          {error.message && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error.message}
            </Alert>
          )}
        </Typography>
        {onRetry && (
          <Button variant="contained" color="primary" onClick={onRetry} sx={{ mt: 2 }}>
            Retry
          </Button>
        )}
      </Box>
    );
  }

  if (isEmpty) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, minHeight: 300 }}>
        <SearchOffIcon color="action" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Data Available
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ReportStateHandler; 