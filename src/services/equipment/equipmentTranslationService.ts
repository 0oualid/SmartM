
/**
 * Service responsable des traductions liées aux équipements
 * Contient les fonctions pour traduire les statuts et autres informations
 */

/**
 * Traduit le statut d'équipement en fonction de la langue
 * 
 * @param {string} status - Le statut à traduire
 * @param {string} language - La langue cible (fr par défaut)
 * @returns {string} Le statut traduit
 */
export const translateEquipmentStatus = (status: string, language: string = 'fr'): string => {
  if (language === 'fr') {
    switch (status) {
      case 'operational': return 'Opérationnel';
      case 'maintenance': return 'En maintenance';
      case 'outOfService': return 'Hors service';
      default: return status;
    }
  } else {
    switch (status) {
      case 'operational': return 'Operational';
      case 'maintenance': return 'Maintenance';
      case 'outOfService': return 'Out of service';
      default: return status;
    }
  }
};
