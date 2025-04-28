import { initApperClient } from './apperService';

// Constants
const LIST_TABLE = 'task_list';
const TASK_TABLE = 'task16';

/**
 * Fetch all task lists for the current user
 * @returns {Promise<Array>} - A promise resolving to an array of task lists
 */
export const fetchLists = async () => {
  try {
    const apperClient = initApperClient();
    
    const params = {
      fields: ['Id', 'Name', 'color'],
      filters: [
        {
          field: 'IsDeleted',
          operator: 'equals',
          value: false
        }
      ],
      pagingInfo: { limit: 100, offset: 0 },
      orderBy: [{ field: 'CreatedOn', direction: 'asc' }]
    };
    
    const response = await apperClient.fetchRecords(LIST_TABLE, params);
    
    if (!response || !response.data || response.data.length === 0) {
      // If no lists exist, create a default list
      const defaultList = await createList({
        name: 'My Tasks',
        color: '#6366f1'
      });
      
      return [defaultList];
    }
    
    // Map the response data to a more usable format
    return response.data.map(list => ({
      id: list.Id,
      name: list.Name,
      color: list.color || '#6366f1'
    }));
  } catch (error) {
    console.error('Error fetching lists:', error);
    // Return default list on error
    return [
      { id: 'default', name: 'My Tasks', color: '#6366f1' }
    ];
  }
};

/**
 * Create a new task list
 * @param {Object} listData - The list data to create
 * @returns {Promise<Object>} - A promise resolving to the created list
 */
export const createList = async (listData) => {
  try {
    const apperClient = initApperClient();
    
    const params = {
      record: {
        Name: listData.name,
        color: listData.color
      }
    };
    
    const response = await apperClient.createRecord(LIST_TABLE, params);
    
    if (!response || !response.data) {
      throw new Error('Failed to create list');
    }
    
    return {
      id: response.data.Id,
      name: response.data.Name,
      color: response.data.color
    };
  } catch (error) {
    console.error('Error creating list:', error);
    throw error;
  }
};

/**
 * Delete a task list and all associated tasks
 * @param {string} listId - The ID of the list to delete
 * @returns {Promise<boolean>} - A promise resolving to true if successful
 */
export const deleteList = async (listId) => {
  try {
    const apperClient = initApperClient();
    
    // First delete all tasks associated with this list
    const taskParams = {
      fields: ['Id'],
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
      pagingInfo: { limit: 1000, offset: 0 }
    };
    
    const taskResponse = await apperClient.fetchRecords(TASK_TABLE, taskParams);
    
    if (taskResponse && taskResponse.data) {
      for (const task of taskResponse.data) {
        await apperClient.deleteRecord(TASK_TABLE, task.Id);
      }
    }
    
    // Then delete the list itself
    await apperClient.deleteRecord(LIST_TABLE, listId);
    
    return true;
  } catch (error) {
    console.error('Error deleting list:', error);
    throw error;
  }
};