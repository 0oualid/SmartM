
/**
 * Service responsable des opérations liées au stockage local pour les avaries d'équipement
 */

import { EquipmentFailure, FailureStatistics } from './types';
import { getStorage } from '../../utils/sqliteStorage';

const storage = getStorage();

// Clé de stockage dans le stockage local
const STORAGE_KEY = 'smartm_equipment_failures';

/**
 * Récupère toutes les avaries d'un équipement depuis le stockage local
 * 
 * @param {number} equipmentId - L'identifiant de l'équipement
 * @returns {EquipmentFailure[]} Liste des avaries
 */
export const getFailuresFromLocalStorage = (equipmentId: number): EquipmentFailure[] => {
  try {
    const storedData = storage.getItem(STORAGE_KEY);
    console.log('Récupération des avaries depuis le stockage local:', storedData);
    const failures = storedData ? JSON.parse(storedData) : [];
    return failures.filter((f: EquipmentFailure) => f.equipment_id === equipmentId);
  } catch (error) {
    console.error('Erreur lors de la récupération des avaries depuis le stockage local:', error);
    return [];
  }
};

/**
 * Sauvegarde une avarie dans le stockage local
 * 
 * @param {EquipmentFailure} failure - L'avarie à sauvegarder
 * @returns {number} L'ID de la nouvelle avarie
 */
export const saveFailureToLocalStorage = (failure: EquipmentFailure): number => {
  try {
    const storedData = storage.getItem(STORAGE_KEY);
    const failures = storedData ? JSON.parse(storedData) : [];
    
    // Générer un ID unique
    const newId = Date.now();
    const newFailure = { ...failure, id: newId };
    
    failures.push(newFailure);
    storage.setItem(STORAGE_KEY, JSON.stringify(failures));
    console.log('Nouvelle avarie sauvegardée:', newFailure);
    
    return newId;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'avarie dans le stockage local:', error);
    return 0;
  }
};

/**
 * Met à jour une avarie existante dans le stockage local
 * 
 * @param {EquipmentFailure} failure - L'avarie à mettre à jour
 * @returns {boolean} true si la mise à jour a réussi, false sinon
 */
export const updateFailureInLocalStorage = (failure: EquipmentFailure): boolean => {
  try {
    if (!failure.id) return false;
    
    const storedData = storage.getItem(STORAGE_KEY);
    if (!storedData) return false;
    
    const failures = JSON.parse(storedData);
    const index = failures.findIndex((f: EquipmentFailure) => f.id === failure.id);
    
    if (index === -1) return false;
    
    failures[index] = failure;
    storage.setItem(STORAGE_KEY, JSON.stringify(failures));
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'avarie dans le stockage local:', error);
    return false;
  }
};

/**
 * Supprime une avarie du stockage local
 * 
 * @param {number} id - L'ID de l'avarie à supprimer
 * @returns {boolean} true si la suppression a réussi, false sinon
 */
export const deleteFailureFromLocalStorage = (id: number): boolean => {
  try {
    const storedData = storage.getItem(STORAGE_KEY);
    if (!storedData) return false;
    
    const failures = JSON.parse(storedData);
    const filteredFailures = failures.filter((f: EquipmentFailure) => f.id !== id);
    
    storage.setItem(STORAGE_KEY, JSON.stringify(filteredFailures));
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avarie du stockage local:', error);
    return false;
  }
};

/**
 * Calcule les statistiques d'avaries pour un équipement depuis le stockage local
 * 
 * @param {number} equipmentId - L'identifiant de l'équipement
 * @returns {FailureStatistics} Les statistiques des avaries
 */
export const getStatisticsFromLocalStorage = (equipmentId: number): FailureStatistics => {
  try {
    const failures = getFailuresFromLocalStorage(equipmentId);
    
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
    console.error('Erreur lors du calcul des statistiques depuis le stockage local:', error);
    return {
      total: 0,
      byType: {},
      byComponent: {},
      byDate: {}
    };
  }
};
