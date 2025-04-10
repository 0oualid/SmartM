import { Equipment, EquipmentFailure, Instance, Personnel, PersonnelAbsence } from './types';
import { getStorage } from './sqliteStorage';

const storage = getStorage();

/**
 * Service utilitaire pour gérer le stockage local des données
 */

// Re-export types for external use
export type { Equipment, EquipmentFailure, Personnel, PersonnelAbsence, Instance };

// Type for Task (compatibility with older code)
export type Task = Instance;

// Type pour les notifications
export interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: string;
}

// Récupérer les instances depuis le stockage local
export const getInstances = (): Instance[] => {
  try {
    const storedInstances = storage.getItem('smartm_instances');
    return storedInstances ? JSON.parse(storedInstances) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des instances:', error);
    return [];
  }
};

// Récupérer le personnel depuis le stockage local
export const getPersonnelFromLocalStorage = (): Personnel[] => {
  try {
    const stored = storage.getItem('smartm_personnel');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération du personnel:', error);
    return [];
  }
};

// Sauvegarder le personnel dans le stockage local
export const savePersonnelToLocalStorage = (personnel: Personnel[]): void => {
  try {
    storage.setItem('smartm_personnel', JSON.stringify(personnel));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du personnel:', error);
  }
};

// Récupérer les absences du personnel depuis le stockage local
export const getPersonnelAbsences = (): PersonnelAbsence[] => {
  try {
    const storedAbsences = storage.getItem('smartm_personnel_absences');
    return storedAbsences ? JSON.parse(storedAbsences) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des absences du personnel:', error);
    return [];
  }
};

// Récupérer les absences actives du personnel depuis le stockage local
export const getActivePersonnelAbsences = (): PersonnelAbsence[] => {
  try {
    const absences = getPersonnelAbsences();
    return absences.filter(absence => !absence.rejoined);
  } catch (error) {
    console.error('Erreur lors de la récupération des absences actives du personnel:', error);
    return [];
  }
};

// Sauvegarder les absences du personnel dans le stockage local
export const savePersonnelAbsences = (absences: PersonnelAbsence[]): void => {
  try {
    storage.setItem('smartm_personnel_absences', JSON.stringify(absences));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des absences du personnel:', error);
  }
};

// Récupérer le nombre total de personnel depuis le stockage local
export const getTotalPersonnel = (): number => {
  try {
    const storedTotal = storage.getItem('smartm_total_personnel');
    return storedTotal ? parseInt(storedTotal, 10) : 50; // Valeur par défaut: 50
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre total de personnel:', error);
    return 50; // Valeur par défaut: 50
  }
};

// Sauvegarder le nombre total de personnel dans le stockage local
export const saveTotalPersonnel = (total: number): void => {
  try {
    storage.setItem('smartm_total_personnel', total.toString());
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du nombre total de personnel:', error);
  }
};

// Récupérer les équipements depuis le stockage local
export const getEquipment = (): Equipment[] => {
  try {
    const storedEquipment = storage.getItem('smartm_equipment');
    return storedEquipment ? JSON.parse(storedEquipment) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des équipements:', error);
    return [];
  }
};

// Sauvegarder les équipements dans le stockage local
export const saveEquipment = (equipment: Equipment[]): void => {
  try {
    storage.setItem('smartm_equipment', JSON.stringify(equipment));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des équipements:', error);
  }
};

// Récupérer les avaries d'équipement depuis le stockage local
export const getEquipmentFailures = (): EquipmentFailure[] => {
  try {
    const storedFailures = storage.getItem('smartm_equipment_failures');
    return storedFailures ? JSON.parse(storedFailures) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des avaries d\'équipement:', error);
    return [];
  }
};

// Sauvegarder les avaries d'équipement dans le stockage local
export const saveEquipmentFailures = (failures: EquipmentFailure[]): void => {
  try {
    storage.setItem('smartm_equipment_failures', JSON.stringify(failures));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des avaries d\'équipement:', error);
  }
};

// Ajouter un nouvel élément à la liste des instances
export const addInstance = (instance: Omit<Instance, 'id'>): void => {
  try {
    const instances = getInstances();
    const newId = instances.length > 0 ? Math.max(...instances.map(t => t.id)) + 1 : 1;
    const newInstance = { ...instance, id: newId };
    
    instances.push(newInstance);
    storage.setItem('smartm_instances', JSON.stringify(instances));
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'une instance:', error);
  }
};

// Mettre à jour le statut d'une instance
export const updateInstanceStatus = (id: number, status: 'pending' | 'completed'): void => {
  try {
    const instances = getInstances();
    const updatedInstances = instances.map(instance => 
      instance.id === id ? { ...instance, status } : instance
    );
    
    storage.setItem('smartm_instances', JSON.stringify(updatedInstances));
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de l\'instance:', error);
  }
};

// Marquer une absence du personnel comme rejointe
export const markPersonnelAsRejoined = (absenceId: number): void => {
  try {
    const absences = getPersonnelAbsences();
    const updatedAbsences = absences.map(absence =>
      absence.id === absenceId ? { ...absence, rejoined: true, dateRejoined: new Date().toISOString().split('T')[0] } : absence
    );
    savePersonnelAbsences(updatedAbsences);
  } catch (error) {
    console.error('Erreur lors du marquage de l\'absence comme rejointe:', error);
  }
};

// Calculer l'opérabilité totale
export const calculateTotalOperability = (): number => {
  const equipmentList = getEquipment();
  if (equipmentList.length === 0) return 100;

  const operationalEquipment = equipmentList.filter(equipment => 
    equipment.status === 'operational'
  );
  const operability = (operationalEquipment.length / equipmentList.length) * 100;
  return Math.round(operability);
};

// Récupérer les notifications depuis le stockage local
export const getNotifications = (): Notification[] => {
  try {
    const storedNotifications = storage.getItem('smartm_notifications');
    return storedNotifications ? JSON.parse(storedNotifications) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return [];
  }
};

// Sauvegarder les notifications dans le stockage local
export const saveNotifications = (notifications: Notification[]): void => {
  try {
    storage.setItem('smartm_notifications', JSON.stringify(notifications));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des notifications:', error);
  }
};

// Ajouter une nouvelle notification
export const addNotification = ({ title, message, type = 'info' }: { title: string, message: string, type: string }): void => {
  try {
    const notifications = getNotifications();
    const newId = notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1;
    
    const newNotification: Notification = {
      id: newId,
      title,
      message,
      date: new Date().toISOString(),
      read: false,
      type
    };
    
    notifications.push(newNotification);
    saveNotifications(notifications);
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'une notification:', error);
  }
};

// Compatibilité avec getTasks - Alias de getInstances
export const getTasks = getInstances;

// Compatibilité avec saveTasks - Alias pour sauvegarder les instances
export const saveTasks = (tasks: Instance[]): void => {
  try {
    storage.setItem('smartm_instances', JSON.stringify(tasks));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des tâches:', error);
  }
};
