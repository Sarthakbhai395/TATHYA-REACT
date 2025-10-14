import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getProfile } from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('tathya_token');
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Try to fetch profile to verify token
        await getProfile();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear auth storage on failure
        localStorage.removeItem('tathya_user');
        localStorage.removeItem('tathya_token');
        localStorage.removeItem('tathya-is-authenticated');
        localStorage.removeItem('user-profile-data');
        // Dispatch custom event to notify navbar of auth state change
        window.dispatchEvent(new CustomEvent('authStateChanged'));
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;