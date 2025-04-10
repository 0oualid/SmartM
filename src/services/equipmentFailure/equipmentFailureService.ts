
/**
 * Service principal pour la gestion des avaries d'équipement
 * Détecte l'environnement et utilise le service approprié (localStorage ou base de données)
 */

import { EquipmentFailure, FailureStatistics } from './types';
import * as localStorageService from './localStorageService';
import * as dbService from './dbService';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Récupère tous les historiques d'avarie pour un équipement
 * 
 * @param {number} equipmentId - L'identifiant de l'équipement
 * @returns {EquipmentFailure[]} Liste des avaries
 */
export const getEquipmentFailures = (equipmentId: number): EquipmentFailure[] => {
  if (isBrowser) {
    return localStorageService.getFailuresFromLocalStorage(equipmentId);
  } else {
    return dbService.getFailuresFromDb(equipmentId);
  }
};

/**
 * Sauvegarder une nouvelle avarie
 * 
 * @param {EquipmentFailure} failure - L'avarie à sauvegarder
 * @returns {number | null} L'ID de la nouvelle avarie ou null en cas d'erreur
 */
export const saveEquipmentFailure = (failure: EquipmentFailure): number | null => {
  try {
    if (isBrowser) {
      return localStorageService.saveFailureToLocalStorage(failure);
    } else {
      return dbService.saveFailureToDb(failure);
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'avarie:', error);
    return null;
  }
};

/**
 * Mettre à jour une avarie existante
 * 
 * @param {EquipmentFailure} failure - L'avarie à mettre à jour
 * @returns {boolean} true si la mise à jour a réussi, false sinon
 */
export const updateEquipmentFailure = (failure: EquipmentFailure): boolean => {
  try {
    if (!failure.id) return false;
    
    if (isBrowser) {
      return localStorageService.updateFailureInLocalStorage(failure);
    } else {
      return dbService.updateFailureInDb(failure);
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'avarie:', error);
    return false;
  }
};

/**
 * Supprimer une avarie
 * 
 * @param {number} id - L'ID de l'avarie à supprimer
 * @returns {boolean} true si la suppression a réussi, false sinon
 */
export const deleteEquipmentFailure = (id: number): boolean => {
  try {
    if (isBrowser) {
      return localStorageService.deleteFailureFromLocalStorage(id);
    } else {
      return dbService.deleteFailureFromDb(id);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avarie:', error);
    return false;
  }
};

/**
 * Calculer les statistiques d'avarie pour un équipement
 * 
 * @param {number} equipmentId - L'identifiant de l'équipement
 * @returns {FailureStatistics} Les statistiques des avaries
 */
export const getFailureStatistics = (equipmentId: number): FailureStatistics => {
  try {
    if (isBrowser) {
      return localStorageService.getStatisticsFromLocalStorage(equipmentId);
    } else {
      return dbService.getStatisticsFromDb(equipmentId);
    }
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    return {
      total: 0,
      byType: {},
      byComponent: {},
      byDate: {}
    };
  }
};

/**
 * Migrer les avaries depuis localStorage
 * Cette fonction est utilisée uniquement dans un environnement Node.js
 */
export const migrateEquipmentFailuresFromLocalStorage = (): void => {
  // Only needed in Node.js environment
  if (isBrowser) return;
  
  dbService.migrateFailuresFromLocalStorage();
};

// Exporter le type pour être utilisé ailleurs
export type { EquipmentFailure, FailureStatistics };
