import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService, { UserData, LoginRequest, AuthError } from '../services/authService';

// Define the Auth Context type
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userData: UserData | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  error: AuthError | null;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userData: null,
  login: async () => {},
  logout: () => {},
  error: null
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: any;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<AuthError | null>(null);

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = () => {
      setIsLoading(true);
      
      try {
        // Initialize auth headers if token exists
        authService.initializeAuth();
        
        // Check if user is authenticated
        if (authService.isAuthenticated()) {
          const userData = authService.getUserData();
          setUserData(userData);
          setIsAuthenticated(true);
          
          // Start monitoring session activity
          authService.startSessionMonitor(() => {
            // Session timeout handler
            handleLogout();
            navigate('/login');
          });
          
          // Setup activity listeners to extend session
          authService.setupActivityListeners();
          
          // Check if password change is required
          if (authService.needsPasswordChange()) {
            navigate('/change-password');
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
    
    // Cleanup on unmount
    return () => {
      authService.stopSessionMonitor();
    };
  }, [navigate]);

  // Login handler
  const handleLogin = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      setUserData(response.userData);
      setIsAuthenticated(true);
      
      // Start session monitoring
      authService.startSessionMonitor(() => {
        handleLogout();
        navigate('/login');
      });
      
      // Redirect based on password change requirement
      if (response.userData.forcePasswordChange) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err as AuthError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    authService.logout();
    authService.stopSessionMonitor();
    setIsAuthenticated(false);
    setUserData(null);
    navigate('/login');
  };

  // Context value
  const value = {
    isAuthenticated,
    isLoading,
    userData,
    login: handleLogin,
    logout: handleLogout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 