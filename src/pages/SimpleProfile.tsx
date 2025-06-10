import React from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Avatar, 
  Grid, 
  TextField, 
  Button,
  Divider
} from '@mui/material';

const SimpleProfile: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}
            src="/placeholder-avatar.jpg"
            alt="Profile"
          >
            U
          </Avatar>
          <Box>
            <Typography variant="h5">User Name</Typography>
            <Typography variant="body2" color="text.secondary">
              Administrator
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" gutterBottom>
          Profile Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              variant="outlined"
              placeholder="Enter first name"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              variant="outlined"
              placeholder="Enter last name"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              type="email"
              placeholder="Enter email address"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone"
              variant="outlined"
              placeholder="Enter phone number"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              variant="outlined"
              multiline
              rows={2}
              placeholder="Enter address"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary">
            Save Changes
          </Button>
          <Button variant="outlined">
            Cancel
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SimpleProfile; 