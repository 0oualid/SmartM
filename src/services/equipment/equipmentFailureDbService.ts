
/**
 * Service responsable des opérations de base de données pour les avaries d'équipement
 * Contient les fonctions CRUD pour la table equipment_failures
 */

import db from '../../server/db';

/**
 * Récupère les avaries d'un équipement par son ID
 * 
 * @param {number} equipmentId - L'identifiant de l'équipement
 * @returns {any[]} Liste des avaries de l'équipement
 */
export const getEquipmentFailuresById = (equipmentId: number): any[] => {
  try {
    const failures = db.prepare(`
      SELECT id, equipment_id, failure_type, failure_date, component, reference
      FROM equipment_failures
      WHERE equipment_id = ?
      ORDER BY failure_date DESC
    `).all(equipmentId);
    
    return failures;
  } catch (error) {
    console.error(`Erreur lors de la récupération des avaries pour l'équipement ${equipmentId}:`, error);
    return [];
  }
};

/**
 * Ajoute une avarie pour un équipement
 * 
 * @param {number} equipmentId - L'identifiant de l'équipement
 * @param {string} failureType - Le type d'avarie
 * @param {string} failureDate - La date de l'avarie
 * @param {string} component - La composante en avarie
 * @param {string} [reference] - La référence optionnelle
 * @returns {number} L'ID de la nouvelle avarie ou -1 en cas d'erreur
 */
export const addEquipmentFailure = (
  equipmentId: number, 
  failureType: string, 
  failureDate: string, 
  component: string, 
  reference?: string
): number => {
  try {
    const stmt = db.prepare(`
      INSERT INTO equipment_failures (equipment_id, failure_type, failure_date, component, reference)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      equipmentId,
      failureType,
      failureDate,
      component,
      reference || null
    );
    
    return result.lastInsertRowid as number;
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'une avarie:', error);
    return -1;
  }
};

/**
 * Calcule les statistiques des avaries pour un équipement
 * 
 * @param {number} equipmentId - L'identifiant de l'équipement
 * @returns {Object} Les statistiques des avaries
 */
export const getFailureStatistics = (equipmentId: number): { total: number } => {
  try {
    const result = db.prepare(`
      SELECT COUNT(*) as total
      FROM equipment_failures
      WHERE equipment_id = ?
    `).get(equipmentId);
    
    return {
      total: result.total || 0
    };
  } catch (error) {
    console.error(`Erreur lors du calcul des statistiques pour l'équipement ${equipmentId}:`, error);
    return { total: 0 };
  }
};
