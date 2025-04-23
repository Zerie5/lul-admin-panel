import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Avatar
} from '@mui/material';

const SimpleProfile: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={2}>
            <Avatar
              sx={{ width: 100, height: 100, mx: 'auto' }}
              alt="User Profile"
              src="/placeholder-avatar.jpg"
            />
          </Grid>
          <Grid item xs={12} md={10}>
            <Typography variant="h5">John Doe</Typography>
            <Typography variant="body1" color="textSecondary">
              Administrator
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Member since: January 15, 2023
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Personal Information
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="First Name"
              defaultValue="John"
              margin="normal"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Last Name"
              defaultValue="Doe"
              margin="normal"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              defaultValue="john.doe@example.com"
              margin="normal"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              defaultValue="+1 (555) 123-4567"
              margin="normal"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              defaultValue="123 Main Street, Anytown, USA"
              margin="normal"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" color="primary" sx={{ mr: 2 }}>
                Save Changes
              </Button>
              <Button variant="outlined">
                Cancel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SimpleProfile; 