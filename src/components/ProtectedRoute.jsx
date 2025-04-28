import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { checkAuth } from '../services/apperService';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.user);
  const [checking, setChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // If Redux already shows authenticated, no need to check again
        if (isAuthenticated) {
          setIsAuthorized(true);
          setChecking(false);
          return;
        }

        // Otherwise, check with the API
        const authStatus = await checkAuth();
        setIsAuthorized(authStatus);
        setChecking(false);
      } catch (error) {
        console.error("Authentication verification failed:", error);
        setIsAuthorized(false);
        setChecking(false);
      }
    };

    verifyAuth();
  }, [isAuthenticated]);

  if (checking) {
    // Return a loading indicator while checking authentication
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;