
import db from '../server/db';
import { Task } from '../utils/localStorageService';
import { Instance, InstanceCategory } from '../utils/types';

// Récupérer toutes les tâches
export const getTasks = (): Task[] => {
  try {
    const tasks = db.prepare(`
      SELECT 
        id, 
        title, 
        description, 
        assignee, 
        due_date as dueDate, 
        status, 
        reference, 
        last_notified as lastNotified,
        notification_sent as notificationSent,
        category
      FROM instances
      WHERE category = 'task'
    `).all();
    
    return tasks.map(task => ({
      ...task,
      notificationSent: Boolean(task.notificationSent)
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    return [];
  }
};

// Récupérer toutes les instances
export const getInstances = (): Instance[] => {
  try {
    const instances = db.prepare(`
      SELECT 
        id, 
        title, 
        description,
        category,
        assignee, 
        due_date as dueDate, 
        status, 
        reference, 
        last_notified as lastNotified,
        notification_sent as notificationSent
      FROM instances
    `).all();
    
    return instances.map(instance => ({
      ...instance,
      notificationSent: Boolean(instance.notificationSent)
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des instances:', error);
    return [];
  }
};

// Récupérer les instances par catégorie
export const getInstancesByCategory = (category: InstanceCategory | 'all'): Instance[] => {
  try {
    if (category === 'all') {
      return getInstances();
    }
    
    const instances = db.prepare(`
      SELECT 
        id, 
        title, 
        description,
        category,
        assignee, 
        due_date as dueDate, 
        status, 
        reference, 
        last_notified as lastNotified,
        notification_sent as notificationSent
      FROM instances
      WHERE category = ?
    `).all(category);
    
    return instances.map(instance => ({
      ...instance,
      notificationSent: Boolean(instance.notificationSent)
    }));
  } catch (error) {
    console.error(`Erreur lors de la récupération des instances de catégorie ${category}:`, error);
    return [];
  }
};

// Sauvegarder les tâches
export const saveTasks = (tasks: Task[]): void => {
  try {
    const transaction = db.transaction(() => {
      // Supprimer toutes les tâches existantes
      db.prepare("DELETE FROM instances WHERE category = 'task'").run();
      
      // Insérer les nouvelles tâches
      const insertStmt = db.prepare(`
        INSERT INTO instances (
          id, title, description, assignee, due_date, status, reference, last_notified, notification_sent, category
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'task')
      `);
      
      tasks.forEach(task => {
        insertStmt.run(
          task.id,
          task.title,
          task.description || null,
          task.assignee,
          task.dueDate,
          task.status,
          task.reference || null,
          task.lastNotified || null,
          task.notificationSent ? 1 : 0
        );
      });
    });
    
    transaction();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des tâches:', error);
  }
};

// Sauvegarder les instances
export const saveInstances = (instances: Instance[]): void => {
  try {
    const transaction = db.transaction(() => {
      // Supprimer toutes les instances existantes
      db.prepare("DELETE FROM instances").run();
      
      // Insérer les nouvelles instances
      const insertStmt = db.prepare(`
        INSERT INTO instances (
          id, title, description, assignee, due_date, status, reference, last_notified, notification_sent, category
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      instances.forEach(instance => {
        insertStmt.run(
          instance.id,
          instance.title,
          instance.description || null,
          instance.assignee,
          instance.dueDate,
          instance.status,
          instance.reference || null,
          instance.lastNotified || null,
          instance.notificationSent ? 1 : 0,
          instance.category
        );
      });
    });
    
    transaction();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des instances:', error);
  }
};

// Migrer les tâches depuis localStorage
export const migrateTasksFromLocalStorage = (): void => {
  try {
    // Vérifier si des données existent déjà dans la base
    const taskCount = db.prepare("SELECT COUNT(*) as count FROM instances WHERE category = 'task'").get().count;
    
    if (taskCount > 0) {
      return; // Ne pas migrer si des données existent déjà
    }
    
    // Récupérer les données depuis localStorage
    const storedData = localStorage.getItem('smartm_tasks');
    if (storedData) {
      const tasks = JSON.parse(storedData);
      saveTasks(tasks);
    }
  } catch (error) {
    console.error('Erreur lors de la migration des tâches:', error);
  }
};

// Traduire le statut d'une tâche
export const translateTaskStatus = (status: string, language: string): string => {
  if (language === 'fr') {
    return status === 'completed' ? 'Terminé' : 'En cours';
  } else {
    return status === 'completed' ? 'Completed' : 'Pending';
  }
};

// Traduire la catégorie d'une tâche
export const translateTaskCategory = (category: string, language: string): string => {
  if (language === 'fr') {
    switch (category) {
      case 'task': return 'Tâche';
      case 'inspection': return 'Inspection';
      case 'event': return 'Événement';
      case 'other': return 'Autre';
      default: return category;
    }
  } else {
    switch (category) {
      case 'task': return 'Task';
      case 'inspection': return 'Inspection';
      case 'event': return 'Event';
      case 'other': return 'Other';
      default: return category;
    }
  }
};
