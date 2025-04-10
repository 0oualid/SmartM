
/**
 * Service responsable des opérations liées à la base de données pour les avaries d'équipement
 */

import db from '../../server/db';
import { EquipmentFailure, FailureStatistics } from './types';

/**
 * Récupère toutes les avaries d'un équipement depuis la base de données
 * 
 * @param {number} equipmentId - L'identifiant de l'équipement
 * @returns {EquipmentFailure[]} Liste des avaries
 */
export const getFailuresFromDb = (equipmentId: number): EquipmentFailure[] => {
  try {
    return db.prepare('SELECT * FROM equipment_failures WHERE equipment_id = ? ORDER BY failure_date DESC')
      .all(equipmentId);
  } catch (error) {
    console.error('Erreur lors de la récupération des avaries depuis la base de données:', error);
    return [];
  }
};

/**
 * Sauvegarde une avarie dans la base de données
 * 
 * @param {EquipmentFailure} failure - L'avarie à sauvegarder
 * @returns {number} L'ID de la nouvelle avarie
 */
export const saveFailureToDb = (failure: EquipmentFailure): number => {
  try {
    const stmt = db.prepare(`
      INSERT INTO equipment_failures (equipment_id, failure_type, failure_date, component, reference)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      failure.equipment_id,
      failure.failure_type,
      failure.failure_date,
      failure.component,
      failure.reference || null
    );
    
    return result.lastInsertRowid as number;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'avarie dans la base de données:', error);
    return 0;
  }
};

/**
 * Met à jour une avarie existante dans la base de données
 * 
 * @param {EquipmentFailure} failure - L'avarie à mettre à jour
 * @returns {boolean} true si la mise à jour a réussi, false sinon
 */
export const updateFailureInDb = (failure: EquipmentFailure): boolean => {
  try {
    if (!failure.id) return false;
    
    const stmt = db.prepare(`
      UPDATE equipment_failures 
      SET failure_type = ?, failure_date = ?, component = ?, reference = ?
      WHERE id = ?
    `);
    
    stmt.run(
      failure.failure_type,
      failure.failure_date,
      failure.component,
      failure.reference || null,
      failure.id
    );
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'avarie dans la base de données:', error);
    return false;
  }
};

/**
 * Supprime une avarie de la base de données
 * 
 * @param {number} id - L'ID de l'avarie à supprimer
 * @returns {boolean} true si la suppression a réussi, false sinon
 */
export const deleteFailureFromDb = (id: number): boolean => {
  try {
    db.prepare('DELETE FROM equipment_failures WHERE id = ?').run(id);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avarie de la base de données:', error);
    return false;
  }
};

/**
 * Calcule les statistiques d'avaries pour un équipement depuis la base de données
 * 
 * @param {number} equipmentId - L'identifiant de l'équipement
 * @returns {FailureStatistics} Les statistiques des avaries
 */
export const getStatisticsFromDb = (equipmentId: number): FailureStatistics => {
  try {
    const failures = getFailuresFromDb(equipmentId);
    
    // Grouper par type d'avarie
    const typeStats = failures.reduce((acc: Record<string, number>, curr) => {
      acc[curr.failure_type] = (acc[curr.failure_type] || 0) + 1;
      return acc;
    }, {});
    
    // Grouper par composante
    const componentStats = failures.reduce((acc: Record<string, number>, curr) => {
      acc[curr.component] = (acc[curr.component] || 0) + 1;
      return acc;
    }, {});
    
    // Compter par mois/année
    const dateStats = failures.reduce((acc: Record<string, number>, curr) => {
      const date = new Date(curr.failure_date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total: failures.length,
      byType: typeStats,
      byComponent: componentStats,
      byDate: dateStats
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques depuis la base de données:', error);
    return {
      total: 0,
      byType: {},
      byComponent: {},
      byDate: {}
    };
  }
};

/**
 * Migre les avaries depuis localStorage vers la base de données
 */
export const migrateFailuresFromLocalStorage = (): void => {
  try {
    // Vérifier si des données existent déjà dans la base
    const failuresCount = db.prepare('SELECT COUNT(*) as count FROM equipment_failures').get().count;
    
    if (failuresCount > 0) {
      return; // Ne pas migrer si des données existent déjà
    }
    
    // Récupérer les données depuis localStorage
    const storedData = localStorage.getItem('smartm_equipment_failures');
    if (storedData) {
      const failures = JSON.parse(storedData);
      
      const insertStmt = db.prepare(`
        INSERT INTO equipment_failures (equipment_id, failure_type, failure_date, component, reference)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      failures.forEach((failure: EquipmentFailure) => {
        insertStmt.run(
          failure.equipment_id,
          failure.failure_type,
          failure.failure_date,
          failure.component,
          failure.reference || null
        );
      });
    }
  } catch (error) {
    console.error('Erreur lors de la migration des avaries:', error);
  }
};
