import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { LogOut, Settings, User } from "lucide-react";
import { clearUser } from "../store/userSlice";
import { handleLogout } from "../services/apperService";
import MainFeature from "../components/MainFeature";
import { fetchLists, createList, deleteList } from "../services/listService";

const Dashboard = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load lists on component mount
  useEffect(() => {
    const loadLists = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const fetchedLists = await fetchLists();
        setLists(fetchedLists);
        
        // Set active list to the first list or keep current if it exists
        if (fetchedLists.length > 0) {
          if (!activeListId || !fetchedLists.find(list => list.id === activeListId)) {
            setActiveListId(fetchedLists[0].id);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading lists:", err);
        setError("Failed to load task lists. Please try again.");
        setIsLoading(false);
      }
    };
    
    loadLists();
  }, [activeListId]);
  
  const handleAddList = async () => {
    try {
      const newListData = {
        name: `List ${lists.length + 1}`,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      };
      
      const newList = await createList(newListData);
      setLists(prev => [...prev, newList]);
      setActiveListId(newList.id);
    } catch (err) {
      console.error("Error adding list:", err);
      setError("Failed to create new list. Please try again.");
    }
  };
  
  const handleDeleteList = async (listId) => {
    if (lists.length <= 1) return;
    
    try {
      await deleteList(listId);
      
      const updatedLists = lists.filter(list => list.id !== listId);
      setLists(updatedLists);
      
      if (activeListId === listId) {
        setActiveListId(updatedLists[0].id);
      }
    } catch (err) {
      console.error("Error deleting list:", err);
      setError("Failed to delete list. Please try again.");
    }
  };
  
  const handleLogoutClick = () => {
    handleLogout(dispatch, navigate);
  };
  
  // Find the active list
  const activeList = lists.find(list => list.id === activeListId) || lists[0];
  
  if (isLoading && lists.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      {/* Header */}
      <header className="bg-white dark:bg-surface-800 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-primary">TaskFlow</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center mr-4">
              <span className="text-sm text-surface-600 dark:text-surface-400 mr-2">
                {user?.firstName} {user?.lastName}
              </span>
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                {user?.firstName?.[0] || user?.emailAddress?.[0] || "U"}
              </div>
            </div>
            
            <button 
              onClick={handleLogoutClick}
              className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 transition-colors"
              aria-label="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
            {error}
            <button 
              className="ml-2 underline"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div 
            className="lg:col-span-3 space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-3">My Lists</h2>
              {isLoading && lists.length === 0 ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {lists.map(list => (
                    <button
                      key={list.id}
                      onClick={() => setActiveListId(list.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                        activeListId === list.id
                          ? "bg-primary/10 text-primary dark:text-primary-light"
                          : "hover:bg-surface-100 dark:hover:bg-surface-700"
                      }`}
                    >
                      <span 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: list.color }}
                      />
                      <span className="flex-1 truncate">{list.name}</span>
                      {lists.length > 1 && activeListId === list.id && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteList(list.id);
                          }}
                          className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                        >
                          ×
                        </button>
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="mt-4">
                <button 
                  onClick={handleAddList}
                  className="btn btn-outline w-full flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  <span>+</span>
                  <span>Add List</span>
                </button>
              </div>
            </div>
            
            <div className="card p-4 hidden lg:block">
              <h2 className="text-lg font-semibold mb-3">User Info</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    {user?.firstName?.[0] || user?.emailAddress?.[0] || "U"}
                  </div>
                  <div>
                    <div className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-sm text-surface-500">
                      {user?.emailAddress}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogoutClick}
                  className="btn btn-outline w-full mt-4 flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:col-span-9"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {activeList && (
              <div className="card">
                <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex items-center">
                  <div 
                    className="h-4 w-4 rounded-full mr-3" 
                    style={{ backgroundColor: activeList.color }}
                  />
                  <h2 className="text-xl font-semibold">{activeList.name}</h2>
                </div>
                
                <MainFeature listId={activeListId} />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;