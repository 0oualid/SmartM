
/**
 * Types centralisés pour l'application
 */

// Type pour le personnel
export interface Personnel {
  id: number;
  name: string;
  absenceDays: number; // Ce nombre sera calculé à partir des indisponibilités
  createdAt: string;
}

// Type pour les absences du personnel
export interface PersonnelAbsence {
  id: number;
  personnelId: number; // Reference to the personnel ID
  personnelName: string; // Name of the personnel for display purposes
  label: string;
  reason: string;
  startDate: string;
  endDate: string;
  notified?: boolean;
  rejoined?: boolean;
  dateRejoined?: string;
}

// Type pour les équipements
export interface Equipment {
  id: number;
  name: string;
  service: string;
  status: 'operational' | 'maintenance' | 'outOfService';
  sensitivity: number;
}

// Type pour les pannes d'équipement
export interface EquipmentFailure {
  id: number;
  equipment_id: number;
  failure_type: string;
  failure_date: string;
  component: string;
  reference?: string;
}

// Type pour les consommations et dépenses
export interface Consumption {
  id: number;
  invoice_id?: string;
  amount: number;
  date: string;
  description?: string;
  category?: string;
  image_path?: string;
}

// Type pour les catégories d'instances
export type InstanceCategory = 'task' | 'inspection' | 'event' | 'reunion' | 'rendezvous' | 'audit' | 'other';

// Type pour les tâches et instances
export interface Instance {
  id: number;
  title: string;
  description?: string;  // Added description field as optional
  category: InstanceCategory;
  assignee: string;
  dueDate: string;
  status: 'pending' | 'completed';
  reference?: string;
  lastNotified?: string;
  notificationSent?: boolean;
}

// Type pour les notifications
export interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}
