
import { Instance, InstanceCategory } from './types';
import { Task } from './localStorageService';

/**
 * Ensures that the status value is either 'pending' or 'completed'
 * @param status The status string to validate
 * @returns A valid task status ('pending' or 'completed')
 */
export const ensureValidTaskStatus = (status: string): 'pending' | 'completed' => {
  return status === 'completed' ? 'completed' : 'pending';
};

/**
 * Ensures that all tasks in the array have valid status values
 * @param tasks Array of tasks to validate
 * @returns Array of tasks with valid status values
 */
export const ensureValidTasksArray = (tasks: any[]): Task[] => {
  return tasks.map(task => ({
    ...task,
    status: ensureValidTaskStatus(task.status || 'pending')
  }));
};

/**
 * Updates a task's status
 * @param tasks Array of all tasks
 * @param taskId ID of the task to update
 * @param newStatus New status to set
 * @returns Updated array of tasks
 */
export const updateTaskStatus = (tasks: Task[], taskId: number, newStatus: 'pending' | 'completed'): Task[] => {
  return tasks.map(task => 
    task.id === taskId 
      ? { ...task, status: newStatus } 
      : task
  );
};

/**
 * Translates task status
 * @param status Status to translate
 * @param language Target language ('fr' or 'en')
 * @returns Translated status
 */
export const translateTaskStatus = (status: string, language: string): string => {
  if (language === 'fr') {
    return status === 'completed' ? 'Terminé' : 'En cours';
  } else {
    return status === 'completed' ? 'Completed' : 'Pending';
  }
};

/**
 * Translates task category
 * @param category Category to translate
 * @param language Target language ('fr' or 'en')
 * @returns Translated category
 */
export const translateTaskCategory = (category: string, language: string): string => {
  if (language === 'fr') {
    switch (category) {
      case 'task': return 'Tâche';
      case 'inspection': return 'Inspection';
      case 'event': return 'Événement';
      case 'reunion': return 'Réunion';
      case 'rendezvous': return 'Rendez-vous';
      case 'audit': return 'Audit';
      case 'other': return 'Autre';
      default: return category;
    }
  } else {
    switch (category) {
      case 'task': return 'Task';
      case 'inspection': return 'Inspection';
      case 'event': return 'Event';
      case 'reunion': return 'Meeting';
      case 'rendezvous': return 'Appointment';
      case 'audit': return 'Audit';
      case 'other': return 'Other';
      default: return category;
    }
  }
};

/**
 * Filters instances by category
 * @param instances Array of instances to filter
 * @param category Category to filter by, or 'all' for all categories
 * @returns Filtered array of instances
 */
export const filterInstancesByCategory = (instances: Instance[], category: InstanceCategory | 'all'): Instance[] => {
  if (category === 'all') {
    return instances;
  }
  return instances.filter(instance => instance.category === category);
};

/**
 * Gets all available instance categories
 * @returns Array of all possible instance categories
 */
export const getInstanceCategories = (): Array<InstanceCategory | 'all'> => {
  return ['all', 'task', 'inspection', 'event', 'reunion', 'rendezvous', 'audit', 'other'];
};

/**
 * Gets the translated name for a category
 * @param category The category to translate
 * @param language The language to translate to ('fr' or 'en')
 * @returns Translated category name
 */
export const getTranslatedCategoryName = (category: InstanceCategory | 'all', language: string): string => {
  if (category === 'all') {
    return language === 'fr' ? 'Toutes les catégories' : 'All categories';
  }
  return translateTaskCategory(category, language);
};
