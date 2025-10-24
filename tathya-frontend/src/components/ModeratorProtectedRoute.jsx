import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ModeratorProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUserRole = () => {
      try {
        const user = JSON.parse(localStorage.getItem('tathya_user') || 'null');
        const userRole = user?.role || null;
        
        // If user is a moderator, redirect to home or moderator dashboard
        if (userRole === 'moderator') {
          navigate('/moderator-dashboard');
          return;
        }
        
        setIsChecking(false);
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsChecking(false);
      }
    };

    checkUserRole();
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ModeratorProtectedRoute;