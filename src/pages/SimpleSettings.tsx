import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Grid,
  TextField
} from '@mui/material';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const SimpleSettings: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Notifications
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              color="primary"
            />
          }
          label="Email Notifications"
        />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
          Receive email notifications for important updates and activities.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Appearance
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              color="primary"
            />
          }
          label="Dark Mode"
        />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
          Switch between light and dark theme.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Regional Settings
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="language-select-label">Language</InputLabel>
              <Select
                labelId="language-select-label"
                value={language}
                label="Language"
                onChange={(e) => setLanguage(e.target.value as string)}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="de">German</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="timezone-select-label">Timezone</InputLabel>
              <Select
                labelId="timezone-select-label"
                value={timezone}
                label="Timezone"
                onChange={(e) => setTimezone(e.target.value as string)}
              >
                <MenuItem value="UTC">UTC</MenuItem>
                <MenuItem value="EST">Eastern Standard Time (EST)</MenuItem>
                <MenuItem value="CST">Central Standard Time (CST)</MenuItem>
                <MenuItem value="PST">Pacific Standard Time (PST)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Security
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              margin="normal"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="password"
              label="New Password"
              margin="normal"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              margin="normal"
              variant="outlined"
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" color="primary" sx={{ mr: 2 }}>
            Save Changes
          </Button>
          <Button variant="outlined">
            Reset to Defaults
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SimpleSettings; 