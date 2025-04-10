
import db from '../server/db';

// Redéfinir l'interface Notification pour éviter le conflit avec le type global
export interface AppNotification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: string;
}

// Récupérer toutes les notifications
export const getNotifications = (): AppNotification[] => {
  try {
    const notifications = db.prepare(`
      SELECT 
        id, 
        title, 
        message, 
        date, 
        read, 
        type
      FROM notifications
    `).all();
    
    return notifications;
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return [];
  }
};

// Sauvegarder les notifications
export const saveNotifications = (notifications: AppNotification[]): void => {
  try {
    const transaction = db.transaction(() => {
      // Supprimer toutes les notifications existantes
      db.prepare('DELETE FROM notifications').run();
      
      // Insérer les nouvelles notifications
      const insertStmt = db.prepare(`
        INSERT INTO notifications (id, title, message, date, read, type)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      notifications.forEach(notification => {
        insertStmt.run(
          notification.id,
          notification.title,
          notification.message,
          notification.date,
          notification.read ? 1 : 0,
          notification.type
        );
      });
    });
    
    transaction();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des notifications:', error);
  }
};

// Migrer les notifications depuis localStorage
export const migrateNotificationsFromLocalStorage = (): void => {
  try {
    // Vérifier si des données existent déjà dans la base
    const notificationCount = db.prepare('SELECT COUNT(*) as count FROM notifications').get().count;
    
    if (notificationCount > 0) {
      return; // Ne pas migrer si des données existent déjà
    }
    
    // Récupérer les données depuis localStorage
    if (typeof localStorage !== 'undefined') {
      const storedData = localStorage.getItem('notifications');
      if (storedData) {
        const notifications = JSON.parse(storedData);
        saveNotifications(notifications);
      }
    } else {
      console.log('localStorage not available for notifications migration');
    }
  } catch (error) {
    console.error('Erreur lors de la migration des notifications:', error);
  }
};
