import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  TextField,
  MenuItem
} from '@mui/material';

const Settings: React.FC = () => {
  const [settings, setSettings] = React.useState({
    theme: 'light',
    language: 'en',
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: true,
    twoFactorAuth: false
  });

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };

  const handleSaveSettings = () => {
    // In a real app, you would save the settings here
    alert('Settings saved successfully!');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ mb: 3 }}>
                <TextField
                  select
                  fullWidth
                  label="Theme"
                  name="theme"
                  value={settings.theme}
                  onChange={handleChange}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System Default</MenuItem>
                </TextField>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <TextField
                  select
                  fullWidth
                  label="Language"
                  name="language"
                  value={settings.language}
                  onChange={handleChange}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                </TextField>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ mb: 3 }}>
                <TextField
                  select
                  fullWidth
                  label="Email Notifications"
                  name="emailNotifications"
                  value={settings.emailNotifications ? "enabled" : "disabled"}
                  onChange={(e: any) => setSettings({
                    ...settings,
                    emailNotifications: e.target.value === "enabled"
                  })}
                >
                  <MenuItem value="enabled">Enabled</MenuItem>
                  <MenuItem value="disabled">Disabled</MenuItem>
                </TextField>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Receive email notifications about account activity
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <TextField
                  select
                  fullWidth
                  label="Push Notifications"
                  name="pushNotifications"
                  value={settings.pushNotifications ? "enabled" : "disabled"}
                  onChange={(e: any) => setSettings({
                    ...settings,
                    pushNotifications: e.target.value === "enabled"
                  })}
                >
                  <MenuItem value="enabled">Enabled</MenuItem>
                  <MenuItem value="disabled">Disabled</MenuItem>
                </TextField>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Receive push notifications on your devices
                </Typography>
              </Box>
              
              <Box>
                <TextField
                  select
                  fullWidth
                  label="Two-Factor Authentication"
                  name="twoFactorAuth"
                  value={settings.twoFactorAuth ? "enabled" : "disabled"}
                  onChange={(e: any) => setSettings({
                    ...settings,
                    twoFactorAuth: e.target.value === "enabled"
                  })}
                >
                  <MenuItem value="enabled">Enabled</MenuItem>
                  <MenuItem value="disabled">Disabled</MenuItem>
                </TextField>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Enable two-factor authentication for enhanced security
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSaveSettings}
            >
              Save Settings
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings; 