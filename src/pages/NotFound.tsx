import { Box, Button, Container, Typography } from '@mui/material';
import React from 'react';
// import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  // const navigate = useNavigate();
  
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', mb: 2 }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px' }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>
        <Button variant="contained" size="large" onClick={handleGoHome}>
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound; 