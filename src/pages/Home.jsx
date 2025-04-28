import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MainFeature from "../components/MainFeature";

const Home = () => {
  const [lists, setLists] = useState(() => {
    const savedLists = localStorage.getItem("taskflow-lists");
    return savedLists ? JSON.parse(savedLists) : [
      { id: "default", name: "My Tasks", color: "#6366f1" }
    ];
  });
  
  const [activeListId, setActiveListId] = useState(() => {
    const savedActiveList = localStorage.getItem("taskflow-active-list");
    return savedActiveList || "default";
  });

  useEffect(() => {
    localStorage.setItem("taskflow-lists", JSON.stringify(lists));
  }, [lists]);

  useEffect(() => {
    localStorage.setItem("taskflow-active-list", activeListId);
  }, [activeListId]);

  const handleAddList = (newList) => {
    setLists(prev => [...prev, newList]);
    setActiveListId(newList.id);
  };

  const handleDeleteList = (listId) => {
    if (lists.length <= 1) return;
    
    setLists(prev => prev.filter(list => list.id !== listId));
    
    if (activeListId === listId) {
      setActiveListId(lists.find(list => list.id !== listId)?.id || "");
    }
  };

  const activeList = lists.find(list => list.id === activeListId) || lists[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div 
          className="lg:col-span-3 space-y-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-3">My Lists</h2>
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
            
            <div className="mt-4">
              <button 
                onClick={() => {
                  const newList = {
                    id: `list-${Date.now()}`,
                    name: `List ${lists.length + 1}`,
                    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                  };
                  handleAddList(newList);
                }}
                className="btn btn-outline w-full flex items-center justify-center gap-2"
              >
                <span>+</span>
                <span>Add List</span>
              </button>
            </div>
          </div>
          
          <div className="card p-4 hidden lg:block">
            <h2 className="text-lg font-semibold mb-3">Statistics</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Completed</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "65%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>In Progress</span>
                  <span className="font-medium">35%</span>
                </div>
                <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: "35%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="lg:col-span-9"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
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
        </motion.div>
      </div>
    </div>
  );
};

export default Home;