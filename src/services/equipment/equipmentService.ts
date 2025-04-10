
/**
 * Service principal pour la gestion des équipements
 * Regroupe les fonctionnalités des sous-services et expose une API unifiée
 */

import { Equipment } from '../../utils/types';
import * as equipmentDbService from './equipmentDbService';
import * as equipmentFailureDbService from './equipmentFailureDbService';
import { translateEquipmentStatus } from './equipmentTranslationService';

// Réexporter toutes les fonctions des sous-services
export const getAllEquipments = equipmentDbService.getAllEquipments;
export const getEquipmentById = equipmentDbService.getEquipmentById;
export const saveEquipment = equipmentDbService.saveEquipment;
export const updateEquipment = equipmentDbService.updateEquipment;
export const migrateEquipmentFromLocalStorage = equipmentDbService.migrateEquipmentFromLocalStorage;

// Réexporter les fonctions du service d'avaries
export const getEquipmentFailuresById = equipmentFailureDbService.getEquipmentFailuresById;
export const addEquipmentFailure = equipmentFailureDbService.addEquipmentFailure;
export const getFailureStatistics = equipmentFailureDbService.getFailureStatistics;

// Exporter directement la fonction de traduction
export { translateEquipmentStatus };
