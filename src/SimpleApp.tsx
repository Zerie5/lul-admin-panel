import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';

function SimpleApp() {
  return React.createElement(
    Container,
    { maxWidth: 'md', sx: { mt: 4 } },
    React.createElement(
      Paper,
      { elevation: 3, sx: { p: 3 } },
      React.createElement(
        Typography,
        { variant: 'h4', component: 'h1', gutterBottom: true },
        'Lul Admin Panel'
      ),
      React.createElement(
        Typography,
        { variant: 'body1', paragraph: true },
        'Welcome to the admin panel. If you can see this, React rendering with Material UI is working correctly.'
      ),
      React.createElement(
        Typography,
        { variant: 'body2', color: 'text.secondary' },
        'You can now start adding more complex components and functionality.'
      )
    )
  );
}

export default SimpleApp; 