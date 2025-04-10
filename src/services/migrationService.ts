import { migrateUsersFromLocalStorage } from './auth/migrationService';
import { migratePersonnelFromLocalStorage } from './personnelService';
import { migrateTasksFromLocalStorage } from './taskService';
import { migrateEquipmentFromLocalStorage } from './equipmentService';
import { migrateNotificationsFromLocalStorage } from './notificationService';
import { migrateConsumptionsFromLocalStorage } from './consumptionService';
import { migrateEquipmentFailuresFromLocalStorage } from './equipmentFailureService';
import db from '../server/db';
import { getStorage } from '../utils/sqliteStorage';

const storage = getStorage();

// Fonction pour vérifier si la migration a déjà été effectuée
const hasMigrationBeenPerformed = (): boolean => {
  try {
    // Vérifier la table settings pour voir si une migration a déjà été effectuée
    const migrationStatus = db.prepare(`
      SELECT value FROM settings WHERE key = 'migration_completed'
    `).get();
    
    return migrationStatus && migrationStatus.value === 'true';
  } catch (error) {
    console.error('Erreur lors de la vérification du statut de migration:', error);
    return false;
  }
};

// Fonction pour marquer la migration comme terminée
const markMigrationAsCompleted = (): void => {
  try {
    // Enregistrer que la migration a été effectuée
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
    `);
    
    stmt.run('migration_completed', 'true');
    console.log('[Migration] Migration marquée comme terminée dans la base de données');
  } catch (error) {
    console.error('[Migration] Erreur lors de l\'enregistrement du statut de migration:', error);
  }
};

// Fonction pour migrer toutes les données de localStorage vers SQLite
export const migrateAllData = async (): Promise<void> => {
  try {
    console.log('[Migration] Début de la vérification de migration des données...');
    
    // Vérifier si la migration a déjà été effectuée
    if (hasMigrationBeenPerformed()) {
      console.log('[Migration] La migration a déjà été effectuée précédemment. Opération ignorée.');
      return;
    }
    
    console.log('[Migration] Début de la migration des données depuis le stockage local...');
    
    // Migrer les données d'authentification
    console.log('[Migration] Migration des utilisateurs...');
    await migrateUsersFromLocalStorage();
    
    // Migrer les autres données
    console.log('[Migration] Migration du personnel...');
    await migratePersonnelFromLocalStorage();
    
    console.log('[Migration] Migration des tâches...');
    await migrateTasksFromLocalStorage();
    
    console.log('[Migration] Migration des équipements...');
    await migrateEquipmentFromLocalStorage();
    
    console.log('[Migration] Migration des avaries d\'équipement...');
    await migrateEquipmentFailuresFromLocalStorage();
    
    console.log('[Migration] Migration des notifications...');
    await migrateNotificationsFromLocalStorage();
    
    console.log('[Migration] Migration des consommations...');
    await migrateConsumptionsFromLocalStorage();
    
    // Marquer la migration comme terminée
    markMigrationAsCompleted();
    
    console.log('[Migration] Migration des données terminée avec succès');
  } catch (error) {
    console.error('[Migration] Erreur lors de la migration des données:', error);
    throw error; // Propager l'erreur pour la gérer plus haut
  }
};

// Fonction pour vérifier le statut de synchronisation
export const getSyncStatus = (): { pendingCount: number, entities: string[] } => {
  try {
    // Cette fonction pourrait vérifier la table sync_status pour déterminer
    // quelles entités ont besoin d'être synchronisées
    const pendingSync = db.prepare(`
      SELECT entity_type, COUNT(*) as count 
      FROM sync_status 
      WHERE sync_status = 'pending' 
      GROUP BY entity_type
    `).all();
    
    const entities = pendingSync.map((row: any) => row.entity_type);
    const totalCount = pendingSync.reduce((sum: number, row: any) => sum + row.count, 0);
    
    return {
      pendingCount: totalCount,
      entities
    };
  } catch (error) {
    console.error('Erreur lors de la vérification du statut de synchronisation:', error);
    return {
      pendingCount: 0,
      entities: []
    };
  }
};

// Interface pour les options de synchronisation
export interface SyncOptions {
  entities: string[];
  mode: 'online' | 'local';
}

// Fonction pour synchroniser les données
export const synchronizeData = async (options: SyncOptions): Promise<boolean> => {
  try {
    // En mode local, simplement marquer les entités comme synchronisées
    if (options.mode === 'local') {
      const updateStmt = db.prepare(`
        UPDATE sync_status
        SET sync_status = 'synced', last_sync_success = ?
        WHERE entity_type IN (${options.entities.map(() => '?').join(',')})
        AND sync_status = 'pending'
      `);
      
      const timestamp = new Date().toISOString();
      updateStmt.run(timestamp, ...options.entities);
      
      return true;
    }
    
    // En mode en ligne, implémenter la logique de synchronisation avec le serveur
    // Pour l'instant, c'est un placeholder
    console.log(`[Info] Synchronisation en ligne pour les entités: ${options.entities.join(', ')}`);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la synchronisation des données:', error);
    return false;
  }
};

// Fonction pour initialiser la base de données SQLite et vérifier l'état de la migration
export const initializeDatabaseAndMigration = async (): Promise<void> => {
  console.log('[Migration] Initialisation de la base de données et vérification de la migration...');
  
  try {
    // Vérifier si une migration doit être effectuée
    if (!hasMigrationBeenPerformed()) {
      console.log('[Migration] Aucune migration précédente détectée. Démarrage de la migration...');
      await migrateAllData();
    } else {
      console.log('[Migration] La migration a déjà été effectuée. Aucune action nécessaire.');
    }
  } catch (error) {
    console.error('[Migration] Erreur lors de l\'initialisation de la base de données:', error);
  }
};
