
/**
 * Service responsable des opérations de base de données pour les équipements
 * Contient les fonctions CRUD pour la table equipment
 */

import db from '../../server/db';
import { Equipment } from '../../utils/types';

/**
 * Récupère tous les équipements depuis la base de données
 * 
 * @returns {Equipment[]} Liste des équipements
 */
export const getAllEquipments = (): Equipment[] => {
  try {
    const equipments = db.prepare(`
      SELECT id, name, service, status, sensitivity
      FROM equipment
    `).all();
    
    return equipments;
  } catch (error) {
    console.error('Erreur lors de la récupération des équipements:', error);
    return [];
  }
};

/**
 * Récupère un équipement par son ID
 * 
 * @param {number} id - L'identifiant de l'équipement à récupérer
 * @returns {Equipment | null} L'équipement trouvé ou null
 */
export const getEquipmentById = (id: number): Equipment | null => {
  try {
    const equipment = db.prepare(`
      SELECT id, name, service, status, sensitivity
      FROM equipment
      WHERE id = ?
    `).get(id);
    
    return equipment || null;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'équipement ${id}:`, error);
    return null;
  }
};

/**
 * Enregistre un nouvel équipement dans la base de données
 * 
 * @param {Equipment} equipment - L'équipement à sauvegarder
 * @returns {number} L'ID du nouvel équipement ou -1 en cas d'erreur
 */
export const saveEquipment = (equipment: Equipment): number => {
  try {
    const stmt = db.prepare(`
      INSERT INTO equipment (name, service, status, sensitivity)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      equipment.name,
      equipment.service,
      equipment.status,
      equipment.sensitivity
    );
    
    return result.lastInsertRowid as number;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'équipement:', error);
    return -1;
  }
};

/**
 * Met à jour un équipement existant
 * 
 * @param {Equipment} equipment - L'équipement à mettre à jour
 * @returns {boolean} true si la mise à jour a réussi, false sinon
 */
export const updateEquipment = (equipment: Equipment): boolean => {
  try {
    const stmt = db.prepare(`
      UPDATE equipment
      SET name = ?, service = ?, status = ?, sensitivity = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(
      equipment.name,
      equipment.service,
      equipment.status,
      equipment.sensitivity,
      equipment.id
    );
    
    return result.changes > 0;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'équipement:', error);
    return false;
  }
};

/**
 * Migre les données d'équipement depuis localStorage vers la base de données
 */
export const migrateEquipmentFromLocalStorage = (): void => {
  try {
    // Vérifier si des données existent déjà dans la base
    const equipmentCount = db.prepare('SELECT COUNT(*) as count FROM equipment').get().count;
    
    if (equipmentCount > 0) {
      return; // Ne pas migrer si des données existent déjà
    }
    
    // Récupérer les données depuis localStorage
    const storedEquipment = localStorage.getItem('smartm_equipment');
    
    if (storedEquipment) {
      const equipment: Equipment[] = JSON.parse(storedEquipment);
      
      // Utiliser une transaction pour s'assurer que tout est sauvegardé correctement
      db.transaction(() => {
        // Insérer l'équipement
        const stmt = db.prepare(`
          INSERT INTO equipment (id, name, service, status, sensitivity)
          VALUES (?, ?, ?, ?, ?)
        `);
        
        equipment.forEach(item => {
          stmt.run(
            item.id,
            item.name,
            item.service,
            item.status,
            item.sensitivity
          );
        });
      })();
    }
  } catch (error) {
    console.error('Erreur lors de la migration des données d\'équipement:', error);
  }
};
