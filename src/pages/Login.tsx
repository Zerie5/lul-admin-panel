import React from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  InputAdornment,
  IconButton,
  useTheme,
  CircularProgress,
  Alert
} from '@mui/material';
import Link from '@mui/material/Link';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import logo from '../assets/images/logo.png';
import { SuccessDialog, ErrorDialog } from '../components/DialogBoxes';
import authService from '../services/authService';

interface LoginProps {
  onLoginSuccess?: () => void;
}

interface FormErrors {
  username?: string;
  password?: string;
  general?: string;
}

const Login = ({ onLoginSuccess }: LoginProps) => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({
    username: '',
    password: '',
  });
  const [formErrors, setFormErrors] = React.useState<FormErrors>({});
  const [loading, setLoading] = React.useState(false);
  const [successDialog, setSuccessDialog] = React.useState(false);
  const [errorDialog, setErrorDialog] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    setFormErrors(prev => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    setErrorMessage('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.login(formData);
      
      console.log('Login successful:', {
        username: response.username,
        roles: response.roles,
      });
      
      setSuccessDialog(true);
      
      // Redirect after successful login
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.error === 'Validation failed' && error.details) {
        // Handle validation errors
        setFormErrors(error.details);
      } else if (error.error === 'Account is locked') {
        setErrorMessage('Your account is locked. Please contact support.');
      } else if (error.error === 'Invalid credentials') {
        setErrorMessage('Invalid username or password.');
      } else {
        setErrorMessage(error.error || 'An unexpected error occurred. Please try again.');
      }
      
      setErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        bgcolor: theme.palette.primary.main,
      }}
    >
      {/* Left side with logo */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: { xs: '0%', md: '50%' },
          p: 4,
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <Box 
          component="img"
          src={logo}
          alt="Company Logo"
          sx={{
            maxWidth: '300px',
            mb: 2
          }}
        />
      </Box>

      {/* Right side with login form */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: { xs: '100%', md: '50%' },
          p: 4,
        }}
      >
        {/* Small logo for mobile */}
        <Box 
          component="img"
          src={logo}
          alt="Company Logo"
          sx={{
            display: { xs: 'block', md: 'none' },
            maxWidth: '200px',
            mb: 4
          }}
        />
        
        <Box sx={{ maxWidth: '400px', width: '100%' }}>
          <Typography variant="h4" color="white" fontWeight="500" mb={1}>
            Welcome
          </Typography>
          <Typography variant="body1" color="white" mb={4}>
            Please login to Admin Dashboard.
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              error={!!formErrors.username}
              helperText={formErrors.username}
              disabled={loading}
              InputProps={{
                sx: { 
                  bgcolor: 'white',
                  borderRadius: '4px',
                }
              }}
            />

            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={loading}
              InputProps={{
                sx: { 
                  bgcolor: 'white',
                  borderRadius: '4px',
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            {formErrors.general && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formErrors.general}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                bgcolor: theme.palette.success.main,
                '&:hover': {
                  bgcolor: theme.palette.success.dark,
                },
                mb: 2,
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'LOGIN'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link
                href="#"
                underline="hover"
                sx={{ color: 'white', fontSize: '0.9rem' }}
              >
                Forgotten Your Password?
              </Link>
            </Box>
          </form>
        </Box>
      </Box>
      
      {/* Success Dialog */}
      <SuccessDialog
        open={successDialog}
        onClose={() => setSuccessDialog(false)}
        title="Login Successful"
        message="You have successfully logged in. Redirecting to dashboard..."
        confirmButtonText="OK"
      />
      
      {/* Error Dialog */}
      <ErrorDialog
        open={errorDialog}
        onClose={() => setErrorDialog(false)}
        title="Login Failed"
        message={errorMessage}
        confirmButtonText="Try Again"
      />
    </Box>
  );
};

export default Login; 