import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { fetchUserSuccess } from '../../store/slices/userSlice';
import authService, { LoginResponse } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import React from 'react';

interface FormValues {
  username: string;
  password: string;
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { login: authLogin } = useAuth();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Username is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values: FormValues, { setSubmitting, setStatus }) => {
      try {
        dispatch(loginStart());
        const response = await authService.login(values);
        
        dispatch(loginSuccess({
          token: response.token,
        }));
        
        dispatch(fetchUserSuccess({
          id: response.id,
          username: response.username,
          email: response.email,
          firstName: response.firstName,
          roles: response.roles,
        }));
        
        if (authLogin) {
          await authLogin(values);
        }
      } catch (error: any) {
        let errorMessage = 'Login failed. Please try again.';
        
        // Check if error has response data structure
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.error) {
          // Handle auth service custom error format
          errorMessage = error.error;
        }
        
        dispatch(loginFailure(errorMessage));
        setStatus({ error: errorMessage });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <Typography component="h2" variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
        Sign In
      </Typography>
      
      {formik.status?.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formik.status.error}
        </Alert>
      )}
      
      <form onSubmit={formik.handleSubmit}>
        <TextField
          margin="normal"
          fullWidth
          id="username"
          name="username"
          label="Username"
          autoComplete="username"
          autoFocus
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
        />
        
        <TextField
          margin="normal"
          fullWidth
          id="password"
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>
      </form>
    </Box>
  );
};

export default Login; 