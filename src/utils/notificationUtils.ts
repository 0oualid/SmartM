
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, Clock, InfoIcon } from "lucide-react";
import { addNotification, getPersonnelAbsences, getTasks, savePersonnelAbsences, saveTasks } from "./localStorageService";

// Function to check if a date is within a certain number of hours from now
export const isWithinHours = (dateStr: string, hours: number): boolean => {
  const targetDate = new Date(dateStr);
  const now = new Date();
  const diffInHours = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffInHours >= 0 && diffInHours <= hours;
};

// Function to check if a date is within a certain number of days from now
export const isWithinDays = (dateStr: string, days: number): boolean => {
  return isWithinHours(dateStr, days * 24);
};

// Function to calculate days remaining until a date
export const getDaysRemaining = (dateStr: string): number => {
  const targetDate = new Date(dateStr);
  const now = new Date();
  const diffInDays = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return Math.ceil(diffInDays);
};

// Function to format date to a readable string
export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Function to check equipment operability based on sensitivity
export const checkOperability = (status: string, sensitivity: number): number => {
  // Convert status to numeric value (operational: 1, maintenance: 0.5, outOfService: 0)
  const statusValues: Record<string, number> = {
    operational: 1,
    maintenance: 0.5,
    outOfService: 0
  };
  
  // Calculate operability percentage based on status and sensitivity
  // More sensitive equipment (higher value) has a more significant impact
  const baseValue = statusValues[status] || 0;
  const operabilityPercentage = baseValue * (1 - ((sensitivity - 1) / 10));
  
  // Return percentage (0-100)
  return Math.round(operabilityPercentage * 100);
};

// Demander la permission pour les notifications natives
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Ce navigateur ne prend pas en charge les notifications de bureau');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

// Notification functions - updated to add to notification history and use native notifications
export const notifyEquipmentEntry = (name: string, entryDate: string) => {
  const daysRemaining = getDaysRemaining(entryDate);
  const message = `${name} sera livré dans ${daysRemaining} jours (${formatDate(entryDate)})`;
  
  addNotification({
    title: "Entrée d'équipement imminente",
    message,
    type: 'info'
  });
};

export const notifyPersonnelReturn = (name: string, returnDate: string) => {
  const daysRemaining = getDaysRemaining(returnDate);
  const message = `${name} reviendra dans ${daysRemaining} jours (${formatDate(returnDate)})`;
  
  addNotification({
    title: "Retour de personnel imminent",
    message,
    type: 'info'
  });
};

export const notifyTaskExpiration = (title: string, dueDate: string) => {
  const daysRemaining = getDaysRemaining(dueDate);
  const message = `La tâche "${title}" expire dans ${daysRemaining} jours (${formatDate(dueDate)})`;
  
  addNotification({
    title: "Tâche à compléter bientôt",
    message,
    type: 'warning'
  });
};

// Fonction de notification pour l'opérabilité globale seulement (suppression des notifications individuelles)
export const notifyLowTotalOperability = (operability: number) => {
  // Vérifier si la notification a déjà été envoyée
  const notificationSent = localStorage.getItem('lowOperabilityNotificationSent');
  
  if (notificationSent !== 'true') {
    const message = `L'opérabilité totale du parc d'équipements est à ${operability}%, en dessous du seuil de 50%`;
    
    addNotification({
      title: "Alerte d'opérabilité globale",
      message,
      type: 'error'
    });
    
    // Marquer la notification comme envoyée
    localStorage.setItem('lowOperabilityNotificationSent', 'true');
  }
};

// Fonction pour vérifier les notifications de retour de personnel (une seule fois)
export const checkPersonnelReturnNotifications = (): void => {
  const absences = getPersonnelAbsences();
  let modified = false;
  
  absences.forEach(absence => {
    // Vérifie si l'absence se termine dans les 48h et que la notification n'a pas déjà été envoyée
    if (isWithinHours(absence.endDate, 48) && absence.notified !== true) {
      notifyPersonnelReturn(absence.label, absence.endDate);
      absence.notified = true;
      modified = true;
    }
  });
  
  // Sauvegarde les changements si nécessaire
  if (modified) {
    savePersonnelAbsences(absences);
  }
};

// Fonction pour vérifier les notifications de tâches (une fois par jour)
export const checkTaskNotifications = (): void => {
  const tasks = getTasks();
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  let modified = false;
  
  tasks.forEach(task => {
    if (task.status === 'pending' && isWithinDays(task.dueDate, 4)) {
      // Si aucune notification n'a encore été envoyée ou si la dernière notification date d'hier ou avant
      if (!task.lastNotified || new Date(task.lastNotified).toISOString().split('T')[0] !== today) {
        notifyTaskExpiration(task.title, task.dueDate);
        task.lastNotified = now.toISOString();
        modified = true;
      }
    }
  });
  
  // Sauvegarde les changements si nécessaire
  if (modified) {
    saveTasks(tasks);
  }
};
