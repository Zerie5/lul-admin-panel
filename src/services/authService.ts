import axios from 'axios';
import { API_BASE_URL } from '../config';

console.log("Auth Service API URL:", API_BASE_URL);

// Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  roles: string[];
  token: string;
}

export interface ValidationError {
  error: string;
  details: {
    [key: string]: string;
  };
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName?: string;
  avatar?: string;
  forcePasswordChange?: boolean;
  lastLogin?: string;
  roles: string[];
}

export interface AuthError {
  status: string;
  message: string;
}

// Token management
const TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';
const LAST_ACTIVITY_KEY = 'last_activity';

// Get token from localStorage
const getToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  
  // Verify token format for debugging
  if (token) {
    if (token.startsWith('Bearer ')) {
      console.error('⚠️ [authService] Token stored with Bearer prefix! This is incorrect.');
      // Return the token without the Bearer prefix to fix the issue
      return token.substring(7);
    }
    
    // Check if token appears to be a valid JWT
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('⚠️ [authService] Token does not appear to be in valid JWT format (should have 3 parts)');
    }
  }
  
  return token;
};

// Store token in localStorage
const setToken = (token: string | null | undefined): void => {
  // Handle null or undefined token
  if (!token) {
    console.error('❌ [authService] Attempted to store null or undefined token');
    return;
  }
  
  // Make sure we don't store the Bearer prefix
  const tokenToStore = token.startsWith('Bearer ') 
    ? token.substring(7) // Remove the 'Bearer ' prefix
    : token;
    
  localStorage.setItem(TOKEN_KEY, tokenToStore);
  
  // Verify the token was stored correctly
  const storedToken = localStorage.getItem(TOKEN_KEY);
  console.log('💡 [authService] Token verification after storage:', {
    stored: !!storedToken,
    matches: storedToken === tokenToStore,
    length: storedToken?.length || 0
  });
};

// Remove token from localStorage
const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Get user data from localStorage
const getUserData = (): UserData | null => {
  const userData = localStorage.getItem(USER_DATA_KEY);
  return userData ? JSON.parse(userData) : null;
};

// Store user data in localStorage
const setUserData = (userData: UserData): void => {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

// Remove user data from localStorage
const removeUserData = (): void => {
  localStorage.removeItem(USER_DATA_KEY);
};

// Initialize auth state from localStorage
const initializeAuth = (): void => {
  const token = getToken();
  if (token) {
    console.log('Auth initialized: Token found in localStorage');
  } else {
    console.log('Auth initialized: No token found');
  }
};

// Authentication service functions
const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  console.log("💡 [authService] Login attempt for user:", credentials.username);
  
  try {
    console.log(`💡 [authService] Sending login request to: ${API_BASE_URL}/api/internal/auth/login`);
    
    const response = await axios.post<LoginResponse>(
      `${API_BASE_URL}/api/internal/auth/login`,
      credentials
    );
    
    console.log('💡 [authService] Login response status:', response.status);
    
    // Validate response data
    if (!response.data) {
      throw new Error('No response data received');
    }
    
    const { token, ...responseData } = response.data;
    
    if (!token) {
      throw new Error('No token received in response');
    }
    
    // Store token without Bearer prefix
    setToken(token);
    
    // Store the user data directly from response
    setUserData(responseData as UserData);
    
    // Update last activity
    updateLastActivity();
    
    console.log('💡 [authService] Login successful:', {
      userId: responseData.id,
      username: responseData.username,
      roles: responseData.roles,
      tokenReceived: !!token
    });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ [authService] Login error:', error);
    
    // Handle specific error responses
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      switch (status) {
        case 401:
          throw { error: 'Invalid credentials', details: errorData.details };
        case 400:
          throw { error: 'Validation failed', details: errorData.details };
        case 403:
          throw { error: 'Account is locked' };
        default:
          throw { error: 'Login failed', details: errorData?.details || {} };
      }
    }
    
    // Handle network or other errors
    throw { error: 'Network error', details: { message: 'Could not connect to server' } };
  }
};

// Log the user out
const logout = (): void => {
  console.log('💡 [authService] Logging out user');
  
  // Clear all auth-related data from localStorage
  removeToken();
  removeUserData();
  removeLastActivity();
  
  // Also clear any other potentially sensitive data
  try {
    // Log keys being removed for debugging
    const keysToRemove = [TOKEN_KEY, USER_DATA_KEY, LAST_ACTIVITY_KEY];
    console.log('💡 [authService] Clearing localStorage keys:', keysToRemove);
    
    // Log current authentication state before logout
    const hasToken = !!localStorage.getItem(TOKEN_KEY);
    console.log('💡 [authService] Authentication state before logout:', {
      hasToken,
      isAuthenticated: isAuthenticated()
    });
    
    // Double-check that items are removed
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('💡 [authService] Logout complete, auth data cleared');
    
    // Log authentication state after logout
    const tokenAfter = localStorage.getItem(TOKEN_KEY);
    console.log('💡 [authService] Authentication state after logout:', {
      hasToken: !!tokenAfter,
      token: tokenAfter
    });
  } catch (error) {
    console.error('❌ [authService] Error during logout:', error);
  }
};

// Check if user is logged in
const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) {
    return false;
  }
  
  // Check session timeout
  if (hasSessionTimedOut()) {
    logout();
    return false;
  }
  
  return true;
};

// Check if user needs to change password
const needsPasswordChange = (): boolean => {
  const userData = getUserData();
  return userData?.forcePasswordChange || false;
};

// Get user roles
const getUserRoles = (): string[] => {
  const userData = getUserData();
  return userData?.roles || [];
};

// Session timeout management
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Update last activity timestamp
const updateLastActivity = (): void => {
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
};

// Get last activity timestamp
const getLastActivity = (): number => {
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
  return lastActivity ? parseInt(lastActivity, 10) : 0;
};

// Remove last activity timestamp
const removeLastActivity = (): void => {
  localStorage.removeItem(LAST_ACTIVITY_KEY);
};

// Check if session has timed out
const hasSessionTimedOut = (): boolean => {
  const lastActivity = getLastActivity();
  if (!lastActivity) return true;
  
  const currentTime = Date.now();
  const hasTimedOut = currentTime - lastActivity > SESSION_DURATION;
  return hasTimedOut;
};

// Start session monitoring
let sessionMonitorInterval: any = null;

const startSessionMonitor = (onTimeout: () => void): void => {
  // Clear any existing interval
  if (sessionMonitorInterval) {
    clearInterval(sessionMonitorInterval);
  }
  
  // Check every minute
  sessionMonitorInterval = setInterval(() => {
    if (hasSessionTimedOut()) {
      stopSessionMonitor();
      onTimeout();
    }
  }, 60 * 1000); // Check every minute
};

const stopSessionMonitor = (): void => {
  if (sessionMonitorInterval) {
    clearInterval(sessionMonitorInterval);
    sessionMonitorInterval = null;
  }
};

// Listen for user activity to extend session
const setupActivityListeners = (): void => {
  const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
  
  const handleUserActivity = () => {
    if (isAuthenticated()) {
      updateLastActivity();
    }
  };
  
  activityEvents.forEach(event => {
    window.addEventListener(event, handleUserActivity);
  });
};

// Clear all authentication data
const clearAllAuth = (): void => {
  removeToken();
  removeUserData();
  removeLastActivity();
  localStorage.clear();
};

// Export service
const authService = {
  login,
  logout,
  isAuthenticated,
  initializeAuth,
  getUserData,
  needsPasswordChange,
  getUserRoles,
  startSessionMonitor,
  stopSessionMonitor,
  setupActivityListeners,
  clearAllAuth,
  getToken
};

export default authService; 