const CANVAS_ID = "fb2da59dd56e4fb781c0ec19bc0047a5";

/**
 * Initialize ApperClient with the provided Canvas ID
 * @returns {Object} ApperClient instance
 */
export const initApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  const apperClient = new ApperClient(CANVAS_ID);
  return apperClient;
};

/**
 * Get ApperUI for authentication
 * @returns {Object} ApperUI instance
 */
export const getApperUI = () => {
  const { ApperUI } = window.ApperSDK;
  return ApperUI;
};

/**
 * Handle logout
 * @param {Function} dispatch Redux dispatch function for user state
 * @param {Function} navigate Router navigate function
 */
export const handleLogout = (dispatch, navigate) => {
  const apperClient = initApperClient();
  apperClient.logout().then(() => {
    dispatch({ type: 'user/clearUser' });
    navigate('/login');
  });
};

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} Promise resolving to authentication status
 */
export const checkAuth = async () => {
  try {
    const apperClient = initApperClient();
    const response = await apperClient.isAuthenticated();
    return response;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};