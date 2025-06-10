import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Box,
  Divider,
  Alert
} from '@mui/material';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field: keyof ProfileData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfile(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality with backend API
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    // TODO: Reset to original values from backend
    setIsEditing(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {showSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{ width: 100, height: 100, mr: 3, bgcolor: 'primary.main' }}
            alt="User Profile"
          >
            {profile.firstName?.[0] || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h4">
              {profile.firstName || profile.lastName 
                ? `${profile.firstName} ${profile.lastName}`.trim() 
                : 'User Profile'
              }
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Administrator
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Typography variant="h6" gutterBottom>
          Profile Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={profile.firstName}
              onChange={handleInputChange('firstName')}
              disabled={!isEditing}
              variant="outlined"
              placeholder="Enter first name"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={profile.lastName}
              onChange={handleInputChange('lastName')}
              disabled={!isEditing}
              variant="outlined"
              placeholder="Enter last name"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={profile.email}
              onChange={handleInputChange('email')}
              disabled={!isEditing}
              variant="outlined"
              type="email"
              placeholder="Enter email address"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone"
              value={profile.phone}
              onChange={handleInputChange('phone')}
              disabled={!isEditing}
              variant="outlined"
              placeholder="Enter phone number"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={profile.address}
              onChange={handleInputChange('address')}
              disabled={!isEditing}
              variant="outlined"
              multiline
              rows={3}
              placeholder="Enter address"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          {!isEditing ? (
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSave}
              >
                Save Changes
              </Button>
              <Button 
                variant="outlined"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile; 