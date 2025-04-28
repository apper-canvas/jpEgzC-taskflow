import { initApperClient } from './apperService';

// Constants
const TASK_TABLE = 'task16';

/**
 * Fetch all tasks for a specific list
 * @param {string} listId - The ID of the list to fetch tasks for
 * @returns {Promise<Array>} - A promise resolving to an array of tasks
 */
export const fetchTasks = async (listId) => {
  try {
    const apperClient = initApperClient();
    
    const params = {
      fields: ['Id', 'title', 'description', 'isCompleted', 'priority', 'dueDate', 'CreatedOn', 'ModifiedOn', 'list'],
      filters: [
        {
          field: 'list',
          operator: 'equals',
          value: parseInt(listId)
        },
        {
          field: 'IsDeleted',
          operator: 'equals',
          value: false
        }
      ],
      pagingInfo: { limit: 100, offset: 0 },
      orderBy: [{ field: 'CreatedOn', direction: 'desc' }]
    };
    
    const response = await apperClient.fetchRecords(TASK_TABLE, params);
    
    if (!response || !response.data) {
      return [];
    }
    
    // Map the response data to a more usable format
    return response.data.map(task => ({
      id: task.Id,
      title: task.title,
      description: task.description || '',
      isCompleted: task.isCompleted || false,
      createdAt: task.CreatedOn,
      updatedAt: task.ModifiedOn,
      priority: task.priority || 'medium',
      dueDate: task.dueDate || null,
      listId: task.list
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Create a new task
 * @param {Object} taskData - The task data to create
 * @returns {Promise<Object>} - A promise resolving to the created task
 */
export const createTask = async (taskData) => {
  try {
    const apperClient = initApperClient();
    
    const params = {
      record: {
        title: taskData.title,
        description: taskData.description || '',
        isCompleted: false,
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate || null,
        list: parseInt(taskData.listId)
      }
    };
    
    const response = await apperClient.createRecord(TASK_TABLE, params);
    
    if (!response || !response.data) {
      throw new Error('Failed to create task');
    }
    
    return {
      id: response.data.Id,
      title: response.data.title,
      description: response.data.description || '',
      isCompleted: response.data.isCompleted || false,
      createdAt: response.data.CreatedOn,
      updatedAt: response.data.ModifiedOn,
      priority: response.data.priority || 'medium',
      dueDate: response.data.dueDate || null,
      listId: response.data.list
    };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Update an existing task
 * @param {string} taskId - The ID of the task to update
 * @param {Object} taskData - The updated task data
 * @returns {Promise<Object>} - A promise resolving to the updated task
 */
export const updateTask = async (taskId, taskData) => {
  try {
    const apperClient = initApperClient();
    
    const params = {
      record: {
        title: taskData.title,
        description: taskData.description,
        isCompleted: taskData.isCompleted,
        priority: taskData.priority,
        dueDate: taskData.dueDate
      }
    };
    
    const response = await apperClient.updateRecord(TASK_TABLE, taskId, params);
    
    if (!response || !response.data) {
      throw new Error('Failed to update task');
    }
    
    return {
      id: response.data.Id,
      title: response.data.title,
      description: response.data.description || '',
      isCompleted: response.data.isCompleted || false,
      createdAt: response.data.CreatedOn,
      updatedAt: response.data.ModifiedOn,
      priority: response.data.priority || 'medium',
      dueDate: response.data.dueDate || null,
      listId: response.data.list
    };
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Toggle task completion status
 * @param {string} taskId - The ID of the task to toggle
 * @param {boolean} isCompleted - The new completion status
 * @returns {Promise<Object>} - A promise resolving to the updated task
 */
export const toggleTaskCompletion = async (taskId, isCompleted) => {
  try {
    const apperClient = initApperClient();
    
    const params = {
      record: {
        isCompleted: isCompleted
      }
    };
    
    const response = await apperClient.updateRecord(TASK_TABLE, taskId, params);
    
    if (!response || !response.data) {
      throw new Error('Failed to toggle task completion');
    }
    
    return {
      id: response.data.Id,
      isCompleted: response.data.isCompleted
    };
  } catch (error) {
    console.error('Error toggling task completion:', error);
    throw error;
  }
};

/**
 * Delete a task
 * @param {string} taskId - The ID of the task to delete
 * @returns {Promise<boolean>} - A promise resolving to true if successful
 */
export const deleteTask = async (taskId) => {
  try {
    const apperClient = initApperClient();
    await apperClient.deleteRecord(TASK_TABLE, taskId);
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

/**
 * Delete all completed tasks for a list
 * @param {string} listId - The ID of the list
 * @returns {Promise<boolean>} - A promise resolving to true if successful
 */
export const clearCompletedTasks = async (listId) => {
  try {
    const apperClient = initApperClient();
    
    // First fetch all completed tasks for this list
    const params = {
      fields: ['Id'],
      filters: [
        {
          field: 'list',
          operator: 'equals',
          value: parseInt(listId)
        },
        {
          field: 'isCompleted',
          operator: 'equals',
          value: true
        },
        {
          field: 'IsDeleted',
          operator: 'equals',
          value: false
        }
      ],
      pagingInfo: { limit: 100, offset: 0 }
    };
    
    const response = await apperClient.fetchRecords(TASK_TABLE, params);
    
    if (!response || !response.data) {
      return true;
    }
    
    // Delete each completed task
    for (const task of response.data) {
      await apperClient.deleteRecord(TASK_TABLE, task.Id);
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing completed tasks:', error);
    throw error;
  }
};