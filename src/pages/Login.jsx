import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, setLoading, setError } from '../store/userSlice';
import { initApperClient, getApperUI } from '../services/apperService';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    // Setup ApperUI for login
    const setupAuthUI = () => {
      const ApperUI = getApperUI();
      const apperClient = initApperClient();
      
      setIsLoading(true);
      dispatch(setLoading(true));
      
      ApperUI.setup(apperClient, {
        target: '#authentication',
        clientId: "fb2da59dd56e4fb781c0ec19bc0047a5",
        hide: [], // No authentication methods to hide
        view: 'login',
        onSuccess: function(user) {
          dispatch(setUser(user));
          navigate(from, { replace: true });
          setIsLoading(false);
        },
        onError: function(error) {
          console.error("Authentication failed:", error);
          setErrorMessage('Authentication failed. Please try again.');
          dispatch(setError('Authentication failed'));
          setIsLoading(false);
        }
      });
      
      ApperUI.showLogin("#authentication");
    };
    
    setupAuthUI();
    
    return () => {
      // Clean up authentication UI on unmount
      const authContainer = document.getElementById('authentication');
      if (authContainer) {
        authContainer.innerHTML = '';
      }
    };
  }, [dispatch, navigate, from]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-surface-50 dark:bg-surface-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">TaskFlow</h1>
          <p className="mt-2 text-surface-600 dark:text-surface-400">
            Sign in to manage your tasks efficiently
          </p>
        </div>
        
        <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">Sign In</h2>
            <p className="text-surface-500 text-sm">
              Welcome back! Please sign in to your account.
            </p>
          </div>
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
              {errorMessage}
            </div>
          )}
          
          <div 
            id="authentication" 
            className="min-h-[300px] flex items-center justify-center"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            )}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-surface-500 dark:text-surface-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;