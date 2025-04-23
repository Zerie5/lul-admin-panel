import axios from 'axios';
import { debug, logError, logRequest, logResponse } from '../utils/debug';
import authService from './authService';

// Log environment variables to diagnose loading issues
console.log('Environment variables from import.meta.env:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_DEBUG: import.meta.env.VITE_DEBUG,
  VITE_USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA,
  MODE: import.meta.env.MODE, // development, production, etc.
});

// Using environment variable or fallback to the Spring Boot backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Log the API URL always, not just in debug mode
console.log('API Base URL:', API_BASE_URL);

// Create axios instance
// @ts-ignore - suppress TypeScript error for axios.create
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
  withCredentials: true, // Enable credentials for cross-origin requests when using auth
});

// Initialize auth header if token exists
const token = localStorage.getItem('auth_token');
if (token) {
  // Make sure headers exist and are properly initialized
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('📝 Initialized axios with auth token:', {
    tokenExists: !!token,
    tokenLength: token.length,
    headerSet: true
  });
}

// Enhanced function to test if the API is reachable
const testApiConnection = async (customApiUrl?: string) => {
  // Use the provided URL or fall back to the default
  const apiUrlToUse = customApiUrl || API_BASE_URL;
  console.log('Testing connection to API at:', apiUrlToUse);
  
  if (!apiUrlToUse) {
    console.error('API URL is undefined or empty! Check environment variables.');
    return false;
  }
  
  // Try multiple endpoints to check connectivity
  const endpointsToTry = [
    { url: '/health-check', name: 'Health Check' },
    { url: '/', name: 'Root Endpoint' },
    { url: '/api/admin/dashboard/summary', name: 'Dashboard Summary' },
    { url: '/actuator/health', name: 'Spring Boot Actuator Health' }, // Common Spring Boot endpoint
  ];
  
  // Network-level check
  try {
    console.log(`🧪 Basic network connectivity test: Simple fetch to ${apiUrlToUse}`);
    
    // First try fetch API for a more basic connectivity test
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await fetch(`${apiUrlToUse}`, { 
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'Origin': window.location.origin
        }
      });
      clearTimeout(timeoutId);
      
      console.log('✅ Basic network test succeeded with status:', response.status);
      console.log('Response headers:', {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers')
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('❌ Basic network test failed:', fetchError.message);
      console.error('This indicates a fundamental network connectivity issue or CORS problem');
      
      // Check if it's a CORS issue
      if (fetchError.message && fetchError.message.includes('CORS')) {
        console.error('🚨 CORS issue detected. Your backend needs to allow cross-origin requests from your frontend');
      }
    }
  } catch (error) {
    console.error('❌ Basic network test failed completely');
  }
  
  // Now try the endpoints
  let anyEndpointSucceeded = false;
  
  for (const endpoint of endpointsToTry) {
    try {
      console.log(`🧪 Trying ${endpoint.name} endpoint: ${apiUrlToUse}${endpoint.url}`);
      
      const response = await fetch(`${apiUrlToUse}${endpoint.url}`, { 
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Accept': 'application/json, text/plain, */*',
          'Origin': window.location.origin
        }
      });
      
      console.log(`✅ ${endpoint.name} succeeded with status: ${response.status}`);
      console.log('Response headers:', {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers')
      });
      
      anyEndpointSucceeded = true;
    } catch (error) {
      console.warn(`❌ ${endpoint.name} failed:`, error.message);
      
      // Log detailed error information
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log('Headers:', error.response.headers);
      } else if (error.request) {
        console.log('No response received');
      }
    }
  }
  
  if (anyEndpointSucceeded) {
    console.log('🟢 At least one API endpoint succeeded. The backend is partially reachable.');
    return true;
  }
  
  // All endpoints failed, log detailed diagnostics
  console.error('🔴 All API endpoints failed. Detailed diagnosis:');
  
  // Check if it's a CORS issue
  console.log('Checking for CORS issues...');
  try {
    await fetch(`${apiUrlToUse}/api/admin/dashboard/summary`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'GET'
      }
    });
  } catch (corsError) {
    console.error('CORS preflight check failed:', corsError.message);
  }
  
  // Suggest solutions
  console.error('Possible solutions:');
  console.error('1. Ensure the backend server is running at', apiUrlToUse);
  console.error('2. Check if the backend has CORS enabled for', window.location.origin);
  console.error('3. Verify that the API endpoints are correct');
  console.error('4. Check if there are network restrictions between frontend and backend');
  console.error(`5. Add this Spring Boot configuration to enable CORS:
  
  @Configuration
  public class CorsConfig implements WebMvcConfigurer {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
          registry.addMapping("/**")
              .allowedOrigins("${window.location.origin}")
              .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
              .allowedHeaders("*")
              .allowCredentials(true);
      }
  }
  `);
  
  return false;
};

// Run the connection test immediately
testApiConnection().then((isConnected) => {
  if (isConnected) {
    console.log('🟢 API connection test passed. The backend is reachable.');
  } else {
    console.error('🔴 API connection test failed. The backend is not reachable. See console for detailed diagnostics.');
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage directly to avoid any transformation
    const token = localStorage.getItem('auth_token');
    
    // Add auth header if token exists
    if (token) {
      // Make sure headers exist and are properly initialized
      config.headers = config.headers || {};
      
      // Set the Authorization header with the exact token as received from server
      // Format: "Bearer [token]" without any modification to the token
      config.headers.Authorization = `Bearer ${token}`;
      
      // Debug log the exact header being sent - mask most of the token for security
      const tokenPreview = token.length > 20 
        ? `${token.substring(0, 10)}...${token.substring(token.length - 5)}`
        : token;
        
      console.log('🔑 Auth header set:', `Bearer ${tokenPreview}`);
    } else {
      console.warn('⚠️ No authentication token available for request');
    }
    
    // Always log requests with headers (but mask sensitive info)
    const headersToLog = { ...config.headers };
    if (headersToLog.Authorization) {
      const authHeader = headersToLog.Authorization as string;
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const tokenPreview = token.length > 20 
          ? `${token.substring(0, 10)}...${token.substring(token.length - 5)}`
          : token;
        headersToLog.Authorization = `Bearer ${tokenPreview}`;
      }
    }
    
    console.log(`🚀 Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      params: config.params,
      data: config.data,
      headers: headersToLog
    });
    
    // Log the request details with the debug utility
    logRequest(
      config.method?.toUpperCase() || 'UNKNOWN',
      `${config.baseURL}${config.url}`,
      config.params,
      config.data
    );
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    logError('HttpService', 'Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Always log responses, not just in debug mode
    console.log(`✅ Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      data: response.data,
      headers: response.headers
    });
    
    // Log the response details with the debug utility
    logResponse(
      response.config.method?.toUpperCase() || 'UNKNOWN',
      `${response.config.baseURL}${response.config.url}`,
      response.status,
      response.data
    );
    
    return response;
  },
  (error) => {
    // Always log detailed error information
    console.error('❌ Response Error:', {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase() || 'UNKNOWN',
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      logError(
        'HttpService',
        `Error ${error.response.status}: ${error.response.statusText}`,
        error.response.data
      );
      
      // Handle authentication errors
      if (error.response.status === 401) {
        console.error('🚨 Authentication error (401 Unauthorized)');
        
        // Get token from localStorage for debugging
        const storedToken = localStorage.getItem('auth_token');
        console.error('📝 Stored token:', storedToken ? {
          exists: true,
          length: storedToken.length,
          preview: storedToken.length > 20 ? 
            `${storedToken.substring(0, 10)}...${storedToken.substring(storedToken.length - 5)}` : 
            storedToken
        } : 'No token stored');
        
        // Check request authorization header
        const authHeader = error.config?.headers?.Authorization;
        console.error('📝 Request Authorization header:', authHeader ? {
          exists: true,
          value: authHeader.startsWith('Bearer ') ? 
            `Bearer ${authHeader.substring(7, 17)}...${authHeader.substring(authHeader.length - 5)}` : 
            'Malformed header (missing Bearer prefix)'
        } : 'No Authorization header sent');
        
        // Check token validity
        if (!storedToken) {
          console.error('❌ No token found in localStorage - user not authenticated');
        } else {
          console.error('⚠️ Token exists but is being rejected by the server');
          
          try {
            // Check token format
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
              console.error('❌ Authorization header does not have Bearer prefix');
            }
            
            // Get the actual token from the header
            const headerToken = authHeader?.substring(7); // Remove 'Bearer ' prefix
            
            // Compare stored token with header token
            if (headerToken && storedToken && headerToken !== storedToken) {
              console.error('❌ Token mismatch: stored token differs from sent token!');
            }
            
            // Check if token might be expired or malformed
            const tokenParts = storedToken.split('.');
            if (tokenParts.length !== 3) {
              console.error('❌ Token does not appear to be a valid JWT (should have 3 parts separated by dots)');
            } else {
              console.log('✅ Token format appears to be valid JWT (has 3 parts)');
              
              // Check if token might be expired
              try {
                // Base64Url decode function for JWT tokens
                const base64UrlDecode = (str: string) => {
                  // Convert base64url to base64
                  let input = str.replace(/-/g, '+').replace(/_/g, '/');
                  
                  // Pad with '=' if needed
                  const pad = input.length % 4;
                  if (pad) {
                    if (pad === 1) {
                      throw new Error('Invalid base64url string');
                    }
                    input += new Array(5-pad).join('=');
                  }
                  
                  // Decode and convert to string
                  try {
                    return decodeURIComponent(atob(input).split('').map(function(c) {
                      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                  } catch (e) {
                    return atob(input);
                  }
                };
                
                const payload = JSON.parse(base64UrlDecode(tokenParts[1]));
                console.log('📝 Token payload:', {
                  exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No expiration',
                  iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'No issued at',
                  sub: payload.sub ? payload.sub : 'No subject'
                });
                
                if (payload.exp && payload.exp * 1000 < Date.now()) {
                  console.error('❌ Token is expired');
                }
              } catch (e) {
                console.error('❌ Failed to decode token payload:', e);
              }
            }
          } catch (tokenCheckError) {
            console.error('❌ Error checking token format:', tokenCheckError);
          }
        }
        
        // Clear token and redirect to login
        console.log('🔄 Clearing authentication data and redirecting to login page');
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      
      // Handle CORS errors
      if (error.response.status === 0 || 
          (error.message && error.message.includes('Network Error'))) {
        console.error('Possible CORS issue detected. Check server CORS configuration.');
        console.error('Request URL:', error.config?.url);
        console.error('Request headers:', error.config?.headers);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('📡 Network Error: No response received from server', error.request);
      console.error('Request details:', {
        method: error.config?.method,
        url: error.config?.url,
        headers: error.config?.headers,
        data: error.config?.data
      });
      logError('HttpService', 'No response received from server', error.request);
    } else {
      // Error in request setup
      console.error('🔧 Request Setup Error:', error.message);
      logError('HttpService', 'Error setting up request', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Create cancel token
// @ts-ignore - suppress TypeScript error for CancelToken
const CancelToken = axios.CancelToken;

// Add token debugging function
const debugAuthToken = () => {
  const storedToken = localStorage.getItem('auth_token');
  console.log('🔍 AUTH TOKEN DEBUG 🔍');
  
  if (!storedToken) {
    console.log('❌ No token found in localStorage');
    return false;
  }
  
  console.log('✅ Token exists in localStorage');
  console.log('📏 Token length:', storedToken.length);
  
  if (storedToken.startsWith('Bearer ')) {
    console.error('⚠️ Token starts with "Bearer " prefix - this is incorrect!');
    console.error('The token itself should be stored, not the full header');
    return false;
  }
  
  // Check JWT format (three parts separated by dots)
  const parts = storedToken.split('.');
  if (parts.length !== 3) {
    console.error('❌ Not a valid JWT format - should have 3 parts separated by dots');
    return false;
  }
  
  console.log('✅ Valid JWT format (3 parts)');
  
  // Try to decode the payload
  try {
    // Base64Url decode function for JWT tokens
    const base64UrlDecode = (str: string) => {
      // Convert base64url to base64
      let input = str.replace(/-/g, '+').replace(/_/g, '/');
      
      // Pad with '=' if needed
      const pad = input.length % 4;
      if (pad) {
        if (pad === 1) {
          throw new Error('Invalid base64url string');
        }
        input += new Array(5-pad).join('=');
      }
      
      // Decode and convert to string
      try {
        return decodeURIComponent(atob(input).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
      } catch (e) {
        return atob(input);
      }
    };
    
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    console.log('📝 Token payload:', {
      exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No expiration',
      iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'No issued at',
      sub: payload.sub || 'No subject',
      roles: payload.roles || 'No roles'
    });
    
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.error('❌ Token is expired');
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('❌ Failed to decode token payload:', e);
    return false;
  }
};

// Test authentication against backend
const testAuth = async () => {
  console.log('🔍 TESTING AUTHENTICATION 🔍');
  
  // Get the current token
  const storedToken = localStorage.getItem('auth_token');
  if (!storedToken) {
    console.error('❌ No authentication token found in localStorage');
    return false;
  }
  
  console.log('✅ Found token in localStorage');
  
  // Check token format
  const tokenParts = storedToken.split('.');
  if (tokenParts.length !== 3) {
    console.error('❌ Token is not in valid JWT format (should have 3 parts separated by dots)');
    return false;
  }
  
  // Test authentication against a simple endpoint
  try {
    console.log('🧪 Testing authentication against API...');
    
    // Create a specific headers object for this test
    const headers = {
      'Authorization': `Bearer ${storedToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    console.log('📝 Request headers:', headers);
    
    // Make request with explicit headers
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/summary`, {
      method: 'GET',
      headers: headers
    });
    
    console.log('📝 Response status:', response.status);
    console.log('📝 Response headers:', Object.fromEntries([...response.headers.entries()]));
    
    if (response.status === 401 || response.status === 403) {
      console.error('❌ Authentication failed with status:', response.status);
      
      // Try to get the response body for more details
      try {
        const errorBody = await response.text();
        console.error('Response body:', errorBody);
      } catch (e) {
        console.error('Could not read response body');
      }
      
      return false;
    }
    
    console.log('✅ Authentication test succeeded!');
    return true;
  } catch (error) {
    console.error('❌ Authentication test error:', error);
    return false;
  }
};

// Http service methods
const httpService = {
  get: async (url: string, params = {}) => {
    console.log(`📩 Making GET request to ${url}`, { params });
    try {
      const response = await api.get(url, { params });
      return response.data;
    } catch (error) {
      console.error(`❌ GET request to ${url} failed:`, error);
      logError('HttpService', `GET request failed: ${url}`, error);
      throw error;
    }
  },
  
  post: async (url: string, data = {}, params = {}) => {
    console.log(`📩 Making POST request to ${url}`, { data, params });
    try {
      const response = await api.post(url, data, { params });
      return response.data;
    } catch (error) {
      console.error(`❌ POST request to ${url} failed:`, error);
      logError('HttpService', `POST request failed: ${url}`, error);
      throw error;
    }
  },
  
  // Add methods for API connection testing
  testConnection: testApiConnection,
  
  // Add CORS check method
  checkCorsConfig: async (customApiUrl?: string) => {
    const apiUrlToUse = customApiUrl || API_BASE_URL;
    try {
      const response = await fetch(`${apiUrlToUse}/health-check`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET'
        }
      });
      
      const corsEnabled = response.headers.get('access-control-allow-origin') != null;
      return { success: true, corsEnabled };
    } catch (error) {
      return { success: false, corsEnabled: false, error: error.message };
    }
  },
  
  // Test Spring Boot CORS configuration
  testSpringBootCors: async (customApiUrl?: string) => {
    const apiUrlToUse = customApiUrl || API_BASE_URL;
    const results = {
      success: false,
      corsConfigured: false,
      details: [] as string[],
      endpoints: [] as any[]
    };
    
    try {
      // Test a few endpoints with OPTIONS request
      const testEndpoints = [
        '/api/admin/dashboard/summary',
        '/health-check',
        '/actuator/health'
      ];
      
      for (const endpoint of testEndpoints) {
        try {
          const response = await fetch(`${apiUrlToUse}${endpoint}`, {
            method: 'OPTIONS',
            headers: {
              'Origin': window.location.origin,
              'Access-Control-Request-Method': 'GET'
            }
          });
          
          const corsAllowOrigin = response.headers.get('access-control-allow-origin');
          
          results.endpoints.push({
            url: endpoint,
            status: response.status,
            corsAllowOrigin: corsAllowOrigin != null,
          });
          
          if (corsAllowOrigin) {
            results.corsConfigured = true;
            results.success = true;
          }
        } catch (error) {
          results.endpoints.push({
            url: endpoint,
            error: error.message
          });
        }
      }
      
      if (results.corsConfigured) {
        results.details.push('CORS is properly configured on your backend');
      } else {
        results.details.push('CORS is not properly configured on your backend');
        results.details.push(`Backend should allow requests from: ${window.location.origin}`);
      }
      
      return results;
    } catch (error) {
      results.details.push(`Error testing CORS: ${error.message}`);
      return results;
    }
  },
  
  // Debug authentication token
  debugAuthToken,
  
  // Test authentication
  testAuth
};

export default httpService;