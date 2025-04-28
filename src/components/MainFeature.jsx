import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Clock, AlertCircle, Calendar, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { 
  fetchTasks, 
  createTask, 
  updateTask, 
  toggleTaskCompletion, 
  deleteTask, 
  clearCompletedTasks 
} from "../services/taskService";

const priorityOptions = [
  { value: "low", label: "Low", color: "#10b981" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "high", label: "High", color: "#ef4444" }
];

const MainFeature = ({ listId }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: ""
  });
  
  const [filter, setFilter] = useState("all");
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  
  // Load tasks when listId changes
  useEffect(() => {
    const loadTasks = async () => {
      if (!listId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const fetchedTasks = await fetchTasks(listId);
        setTasks(fetchedTasks);
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading tasks:", err);
        setError("Failed to load tasks. Please try again.");
        setIsLoading(false);
      }
    };
    
    loadTasks();
  }, [listId]);
  
  // Handle click outside form to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setShowForm(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleAddTask = async (e) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) return;
    
    try {
      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        priority: newTask.priority,
        dueDate: newTask.dueDate || null,
        listId: listId
      };
      
      const createdTask = await createTask(taskData);
      setTasks(prev => [createdTask, ...prev]);
      
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        dueDate: ""
      });
      
      setShowForm(false);
    } catch (err) {
      console.error("Error adding task:", err);
      setError("Failed to add task. Please try again.");
    }
  };
  
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    
    if (!editingTask || !editingTask.title.trim()) return;
    
    try {
      const updatedTask = await updateTask(editingTask.id, {
        title: editingTask.title.trim(),
        description: editingTask.description.trim(),
        isCompleted: editingTask.isCompleted,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate
      });
      
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id ? updatedTask : task
      ));
      
      setEditingTask(null);
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task. Please try again.");
    }
  };
  
  const handleToggleComplete = async (taskId) => {
    try {
      const taskToToggle = tasks.find(task => task.id === taskId);
      if (!taskToToggle) return;
      
      const updatedStatus = !taskToToggle.isCompleted;
      
      // Optimistic update
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, isCompleted: updatedStatus }
          : task
      ));
      
      await toggleTaskCompletion(taskId, updatedStatus);
    } catch (err) {
      console.error("Error toggling task completion:", err);
      setError("Failed to update task status. Please try again.");
      
      // Revert optimistic update on error
      setTasks(prev => [...prev]);
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    try {
      // Optimistic delete
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      await deleteTask(taskId);
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task. Please try again.");
      
      // Reload tasks if delete fails
      try {
        const fetchedTasks = await fetchTasks(listId);
        setTasks(fetchedTasks);
      } catch (loadErr) {
        console.error("Error reloading tasks:", loadErr);
      }
    }
  };
  
  const handleClearCompleted = async () => {
    try {
      // Optimistic update
      setTasks(prev => prev.filter(task => !task.isCompleted));
      
      await clearCompletedTasks(listId);
    } catch (err) {
      console.error("Error clearing completed tasks:", err);
      setError("Failed to clear completed tasks. Please try again.");
      
      // Reload tasks if clearing fails
      try {
        const fetchedTasks = await fetchTasks(listId);
        setTasks(fetchedTasks);
      } catch (loadErr) {
        console.error("Error reloading tasks:", loadErr);
      }
    }
  };
  
  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    if (filter === "active") return !task.isCompleted;
    if (filter === "completed") return task.isCompleted;
    return true;
  });
  
  const activeTasks = tasks.filter(task => !task.isCompleted).length;
  const completedTasks = tasks.filter(task => task.isCompleted).length;
  
  return (
    <div className="p-4">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <button 
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-l-lg transition-colors ${
                filter === "all" 
                  ? "bg-primary text-white" 
                  : "bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600"
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter("active")}
              className={`px-3 py-1.5 transition-colors ${
                filter === "active" 
                  ? "bg-primary text-white" 
                  : "bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600"
              }`}
            >
              Active
            </button>
            <button 
              onClick={() => setFilter("completed")}
              className={`px-3 py-1.5 rounded-r-lg transition-colors ${
                filter === "completed" 
                  ? "bg-primary text-white" 
                  : "bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600"
              }`}
            >
              Completed
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex-1 sm:flex-none"
            disabled={isLoading}
          >
            Add Task
          </motion.button>
          
          {completedTasks > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleClearCompleted}
              className="btn btn-outline"
              disabled={isLoading}
            >
              Clear Completed
            </motion.button>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            <form ref={formRef} onSubmit={handleAddTask} className="card p-4 border-2 border-primary/20">
              <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="input"
                    placeholder="What needs to be done?"
                    autoFocus
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="input min-h-[80px]"
                    placeholder="Add details (optional)"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium mb-1">
                      Priority
                    </label>
                    <select
                      id="priority"
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                      className="input"
                    >
                      {priorityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      id="dueDate"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="input"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newTask.title.trim() || isLoading}
                >
                  Add Task
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="space-y-3">
        {isLoading && tasks.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <AnimatePresence>
            {filteredTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="text-surface-400 dark:text-surface-500 mb-2">
                  {filter === "all" 
                    ? "No tasks yet. Add your first task!" 
                    : filter === "active" 
                      ? "No active tasks. Great job!" 
                      : "No completed tasks yet."}
                </div>
                {filter === "all" && !showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    Add Your First Task
                  </button>
                )}
              </motion.div>
            ) : (
              filteredTasks.map((task) => (
                <AnimatePresence key={task.id} mode="popLayout">
                  {editingTask?.id === task.id ? (
                    <motion.form
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onSubmit={handleUpdateTask}
                      className="card p-4 border-2 border-primary/20"
                    >
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="edit-title" className="block text-sm font-medium mb-1">
                            Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="edit-title"
                            value={editingTask.title}
                            onChange={(e) => setEditingTask(prev => ({ ...prev, title: e.target.value }))}
                            className="input"
                            autoFocus
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="edit-description" className="block text-sm font-medium mb-1">
                            Description
                          </label>
                          <textarea
                            id="edit-description"
                            value={editingTask.description}
                            onChange={(e) => setEditingTask(prev => ({ ...prev, description: e.target.value }))}
                            className="input min-h-[80px]"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="edit-priority" className="block text-sm font-medium mb-1">
                              Priority
                            </label>
                            <select
                              id="edit-priority"
                              value={editingTask.priority}
                              onChange={(e) => setEditingTask(prev => ({ ...prev, priority: e.target.value }))}
                              className="input"
                            >
                              {priorityOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="edit-dueDate" className="block text-sm font-medium mb-1">
                              Due Date
                            </label>
                            <input
                              type="date"
                              id="edit-dueDate"
                              value={editingTask.dueDate || ""}
                              onChange={(e) => setEditingTask(prev => ({ ...prev, dueDate: e.target.value || null }))}
                              className="input"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-6">
                        <button
                          type="button"
                          onClick={() => setEditingTask(null)}
                          className="btn btn-outline"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={!editingTask.title.trim() || isLoading}
                        >
                          Save Changes
                        </button>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2 }}
                      layout
                      className="task-item group"
                    >
                      <div 
                        className={`task-checkbox ${task.isCompleted ? "task-checkbox-checked" : ""}`}
                        onClick={() => handleToggleComplete(task.id)}
                      >
                        {task.isCompleted && <Check size={14} className="text-white" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 
                            className={`font-medium ${
                              task.isCompleted 
                                ? "line-through text-surface-400 dark:text-surface-500" 
                                : ""
                            }`}
                          >
                            {task.title}
                          </h3>
                          
                          <div 
                            className="px-1.5 py-0.5 text-xs rounded-full" 
                            style={{ 
                              backgroundColor: priorityOptions.find(o => o.value === task.priority)?.color + "20",
                              color: priorityOptions.find(o => o.value === task.priority)?.color
                            }}
                          >
                            {task.priority}
                          </div>
                        </div>
                        
                        {task.description && (
                          <p 
                            className={`text-sm mt-1 text-surface-600 dark:text-surface-400 ${
                              task.isCompleted ? "line-through opacity-70" : ""
                            }`}
                          >
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3 mt-2 text-xs text-surface-500">
                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>Due: {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>Created: {format(new Date(task.createdAt), "MMM d")}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1.5 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 transition-colors"
                          aria-label="Edit task"
                          disabled={isLoading}
                        >
                          <Edit size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-surface-500 hover:text-red-600 dark:text-surface-400 dark:hover:text-red-400 transition-colors"
                          aria-label="Delete task"
                          disabled={isLoading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              ))
            )}
          </AnimatePresence>
        )}
      </div>
      
      {filteredTasks.length > 0 && (
        <div className="mt-6 text-sm text-surface-500 dark:text-surface-400 flex justify-between items-center">
          <div>
            {activeTasks} active, {completedTasks} completed
          </div>
          
          <div>
            Total: {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainFeature;