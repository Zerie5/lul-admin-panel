import { UserData } from '../services/authService';

declare global {
  interface Window {
    __AUTH_STATE__: {
      isAuthenticated: boolean;
      userData: UserData | null;
    };
  }
} 