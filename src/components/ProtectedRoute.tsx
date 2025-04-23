import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute = ({ children, requiredRoles = [] }: ProtectedRouteProps) => {
  // Simple check if authenticated
  const isAuthenticated = authService.isAuthenticated();
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // If roles are required, check if user has any required role
  if (requiredRoles.length > 0) {
    const userRoles = authService.getUserRoles();
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      // Redirect to unauthorized page or dashboard
      return <Navigate to="/unauthorized" />;
    }
  }
  
  // If authenticated and has required roles, render the children
  return <>{children}</>;
};

export default ProtectedRoute; 