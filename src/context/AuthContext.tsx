import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService, { UserData, LoginRequest, AuthError } from '../services/authService';

// Define the Auth Context type
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userData: UserData | null;
  user: UserData | null; // Alias for userData for backward compatibility
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
  error: AuthError | null;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userData: null,
  user: null,
  login: async () => {},
  logout: () => {},
  hasRole: () => false,
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
      // Convert LoginResponse to UserData format
      const userData: UserData = {
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        roles: response.roles
      };
      setUserData(userData);
      setIsAuthenticated(true);
      
      // Start session monitoring
      authService.startSessionMonitor(() => {
        handleLogout();
        navigate('/login');
      });
      
      // Redirect based on password change requirement
      if (userData.forcePasswordChange) {
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

  // Role checking function
  const hasRole = (roles: string[]): boolean => {
    if (!userData || !userData.roles) return false;
    return roles.some(role => userData.roles.includes(role));
  };

  // Context value
  const value = {
    isAuthenticated,
    isLoading,
    userData,
    user: userData, // Alias for backward compatibility
    login: handleLogin,
    logout: handleLogout,
    hasRole,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 