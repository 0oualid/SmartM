
import { Personnel, PersonnelAbsence } from './types';
import { getPersonnelAbsences } from './localStorageService';

/**
 * Calcule le nombre total de jours d'absence pour un employé
 * @param personnelId ID de l'employé
 * @param absences Liste des absences (optionnel)
 * @returns Nombre total de jours d'absence
 */
export const calculateAbsenceDays = (personnelId: number, absences?: PersonnelAbsence[]): number => {
  const allAbsences = absences || getPersonnelAbsences();
  const personnelAbsences = allAbsences.filter(absence => absence.personnelId === personnelId);
  
  let totalDays = 0;
  
  personnelAbsences.forEach(absence => {
    const startDate = new Date(absence.startDate);
    const endDate = new Date(absence.endDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure le jour de début
    
    totalDays += diffDays;
  });
  
  return totalDays;
};

/**
 * Calcule les jours d'absence pour tous les employés
 * @param personnel Liste des employés
 * @param absences Liste des absences (optionnel)
 * @returns Liste des employés avec les jours d'absence calculés
 */
export const refreshAbsenceDaysForAllPersonnel = (personnel: Personnel[], absences?: PersonnelAbsence[]): Personnel[] => {
  return personnel.map(person => ({
    ...person,
    absenceDays: calculateAbsenceDays(person.id, absences)
  }));
};

/**
 * Génère un ID unique pour un nouvel employé
 * @param existingPersonnel Liste des employés existants
 * @returns Nouvel ID unique
 */
export const generateNewPersonnelId = (existingPersonnel: Personnel[]): number => {
  if (existingPersonnel.length === 0) return 1;
  
  const maxId = existingPersonnel.reduce(
    (max, person) => (person.id > max ? person.id : max), 
    existingPersonnel[0].id
  );
  
  return maxId + 1;
};

/**
 * Calcule les jours de congé annuel pour un employé pour une année spécifique
 * @param personnelId ID de l'employé
 * @param year Année pour laquelle calculer les jours de congé
 * @param absences Liste des absences (optionnel)
 * @returns Nombre de jours de congé pour l'année spécifiée
 */
export const calculateAnnualLeaveDays = (personnelId: number, year: number, absences?: PersonnelAbsence[]): number => {
  const allAbsences = absences || getPersonnelAbsences();
  const personnelAbsences = allAbsences.filter(absence => 
    absence.personnelId === personnelId && 
    absence.reason === "Congé" &&
    new Date(absence.startDate).getFullYear() === year
  );
  
  let totalDays = 0;
  
  personnelAbsences.forEach(absence => {
    const startDate = new Date(absence.startDate);
    const endDate = new Date(absence.endDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure le jour de début
    
    totalDays += diffDays;
  });
  
  return totalDays;
};
