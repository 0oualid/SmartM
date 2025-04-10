import db from '../../server/db';
import { getStorage } from '../../utils/sqliteStorage';
import { registerUser } from './authCore';

const storage = getStorage();

// Function to migrate users from localStorage to SQLite
export const migrateUsersFromLocalStorage = async (): Promise<void> => {
  try {
    // Check if there are already users in the database
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    
    if (userCount > 0) {
      return; // Don't migrate if users already exist
    }
    
    // Check if localStorage is available
    if (typeof storage !== 'undefined') {
      const userCredentials = storage.getItem('userCredentials');
      
      if (userCredentials) {
        try {
          const credentials = JSON.parse(userCredentials);
          
          const username = credentials.username || 'admin'; // Default to 'admin' if no username in localStorage
          const password = credentials.password || 'admin123'; // Default password if none in localStorage
          
          // Register the user with the retrieved credentials or defaults
          await registerUser(username, credentials.email || '', password);
        } catch (error) {
          console.error('Error parsing user credentials from localStorage, creating default user:', error);
          // Fallback to creating a default user in case of error
          await registerUser('admin', '', 'admin123');
        }
      } else {
        // If no userCredentials found in localStorage, create default user
        console.log('No user credentials found in localStorage, creating default user');
        await registerUser('admin', '', 'admin123');
      }
    } else {
      console.log('localStorage not available for user migration, creating default user');
      await registerUser('admin', '', 'admin123');
    }
  } catch (error) {
    console.error('Error migrating users:', error);
  }
};
