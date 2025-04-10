import db from '../server/db';
import { Personnel, PersonnelAbsence } from '../utils/types';
import { 
  calculateAbsenceDays, 
  refreshAbsenceDaysForAllPersonnel, 
  calculateAnnualLeaveDays as calculateAnnualLeaveDaysUtil 
} from '../utils/personnelUtils';
import { getPersonnelFromLocalStorage } from '../utils/localStorageService';

// Récupérer tout le personnel
export const getAllPersonnel = (): Personnel[] => {
  try {
    // Vérifier d'abord si nous sommes dans un environnement de navigateur
    if (typeof window !== 'undefined') {
      // Dans le navigateur, utiliser localStorage au lieu de la base de données
      const personnel = getPersonnelFromLocalStorage();
      console.log("Personnel récupéré depuis localStorage:", personnel);
      return personnel;
    }
    
    // Sinon, utiliser la base de données SQLite
    const personnel = db.prepare(`
      SELECT id, name, absence_days as absenceDays, created_at as createdAt
      FROM personnel
    `).all();
    
    return personnel;
  } catch (error) {
    console.error('Erreur lors de la récupération du personnel:', error);
    return [];
  }
};

// Make sure we properly export calculateAnnualLeaveDays function
export const calculateAnnualLeaveDays = calculateAnnualLeaveDaysUtil;

// Export the calculateAbsenceDays function from personnelUtils
export { calculateAbsenceDays };

// Récupérer un membre du personnel par ID
export const getPersonnelById = (id: number): Personnel | null => {
  try {
    // Vérifier d'abord si nous sommes dans un environnement de navigateur
    if (typeof window !== 'undefined') {
      // Dans le navigateur, utiliser localStorage au lieu de la base de données
      const personnel = getPersonnelFromLocalStorage();
      return personnel.find(p => p.id === id) || null;
    }
    
    const person = db.prepare(`
      SELECT id, name, absence_days as absenceDays, created_at as createdAt
      FROM personnel
      WHERE id = ?
    `).get(id);
    
    return person || null;
  } catch (error) {
    console.error(`Erreur lors de la récupération du personnel ${id}:`, error);
    return null;
  }
};

// Supprimer un membre du personnel
export const deletePersonnel = (id: number): boolean => {
  try {
    const stmt = db.prepare(`
      DELETE FROM personnel
      WHERE id = ?
    `);
    
    const result = stmt.run(id);
    
    return result.changes > 0;
  } catch (error) {
    console.error(`Erreur lors de la suppression du personnel ${id}:`, error);
    return false;
  }
};

// Récupérer les absences d'un membre du personnel
export const getPersonnelAbsencesById = (personnelId: number): PersonnelAbsence[] => {
  try {
    const absences = db.prepare(`
      SELECT id, personnel_id as personnelId, personnel_name as personnelName, 
             label, reason, start_date as startDate, end_date as endDate, 
             notified, rejoined, date_rejoined as dateRejoined
      FROM personnel_absences
      WHERE personnel_id = ?
      ORDER BY start_date DESC
    `).all(personnelId);
    
    return absences.map(absence => ({
      ...absence,
      notified: Boolean(absence.notified),
      rejoined: Boolean(absence.rejoined)
    }));
  } catch (error) {
    console.error(`Erreur lors de la récupération des absences pour le personnel ${personnelId}:`, error);
    return [];
  }
};

// Récupérer toutes les absences
export const getAllPersonnelAbsences = (): PersonnelAbsence[] => {
  try {
    const absences = db.prepare(`
      SELECT id, personnel_id as personnelId, personnel_name as personnelName, 
             label, reason, start_date as startDate, end_date as endDate, 
             notified, rejoined, date_rejoined as dateRejoined
      FROM personnel_absences
      ORDER BY start_date DESC
    `).all();
    
    return absences.map(absence => ({
      ...absence,
      notified: Boolean(absence.notified),
      rejoined: Boolean(absence.rejoined)
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des absences du personnel:', error);
    return [];
  }
};

// Ajouter un nouveau membre du personnel
export const addPersonnel = (personnel: Omit<Personnel, 'id' | 'createdAt'>): number => {
  try {
    // Vérifier si nous sommes dans un environnement de navigateur
    if (typeof window !== 'undefined') {
      // Dans le navigateur, utiliser localStorage au lieu de la base de données
      const existingPersonnel = getPersonnelFromLocalStorage();
      const newId = existingPersonnel.length > 0 ? Math.max(...existingPersonnel.map(p => p.id)) + 1 : 1;
      
      const newPerson: Personnel = {
        id: newId,
        name: personnel.name,
        absenceDays: personnel.absenceDays || 0,
        createdAt: new Date().toISOString()
      };
      
      const updatedPersonnel = [...existingPersonnel, newPerson];
      localStorage.setItem('smartm_personnel', JSON.stringify(updatedPersonnel));
      console.log("Personnel ajouté au localStorage:", newPerson);
      
      return newId;
    }
    
    // Utiliser une transaction pour s'assurer que tout est sauvegardé correctement
    const stmt = db.prepare(`
      INSERT INTO personnel (name, absence_days, created_at)
      VALUES (?, ?, datetime('now'))
    `);
    
    const result = stmt.run(
      personnel.name,
      personnel.absenceDays || 0
    );
    
    return result.lastInsertRowid as number;
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un membre du personnel:', error);
    return -1;
  }
};

// Mettre à jour un membre du personnel existant
export const updatePersonnel = (personnel: Personnel): boolean => {
  try {
    const stmt = db.prepare(`
      UPDATE personnel
      SET name = ?, absence_days = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(
      personnel.name,
      personnel.absenceDays,
      personnel.id
    );
    
    return result.changes > 0;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du personnel:', error);
    return false;
  }
};

// Ajouter une absence pour un membre du personnel
export const addPersonnelAbsence = (absence: Omit<PersonnelAbsence, 'id'>): number => {
  try {
    // Vérifier si le personnel existe
    const person = getPersonnelById(absence.personnelId);
    if (!person) {
      console.error(`Le personnel avec l'ID ${absence.personnelId} n'existe pas`);
      return -1;
    }
    
    // Utiliser une transaction pour s'assurer que tout est sauvegardé correctement
    db.transaction(() => {
      // Ajouter l'absence
      const stmtAbsence = db.prepare(`
        INSERT INTO personnel_absences (
          personnel_id, personnel_name, label, reason, 
          start_date, end_date, notified, rejoined, date_rejoined
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmtAbsence.run(
        absence.personnelId,
        absence.personnelName,
        absence.label,
        absence.reason,
        absence.startDate,
        absence.endDate,
        absence.notified ? 1 : 0,
        absence.rejoined ? 1 : 0,
        absence.dateRejoined || null
      );
      
      // Mettre à jour les jours d'absence du personnel
      const allAbsences = getAllPersonnelAbsences();
      const absenceDays = calculateAbsenceDays(absence.personnelId, allAbsences);
      
      const stmtUpdatePersonnel = db.prepare(`
        UPDATE personnel 
        SET absence_days = ? 
        WHERE id = ?
      `);
      
      stmtUpdatePersonnel.run(absenceDays, absence.personnelId);
    })();
    
    return db.prepare('SELECT last_insert_rowid() as id').get().id;
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'une absence:', error);
    return -1;
  }
};

// Mettre à jour tous les jours d'absence pour le personnel
export const updateAllPersonnelAbsenceDays = (): boolean => {
  try {
    const personnel = getAllPersonnel();
    const absences = getAllPersonnelAbsences();
    
    db.transaction(() => {
      const stmt = db.prepare(`
        UPDATE personnel
        SET absence_days = ?
        WHERE id = ?
      `);
      
      personnel.forEach(person => {
        const absenceDays = calculateAbsenceDays(person.id, absences);
        stmt.run(absenceDays, person.id);
      });
    })();
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des jours d\'absence:', error);
    return false;
  }
};

// Marquer une absence comme terminée
export const markAbsenceAsRejoined = (absenceId: number, dateRejoined: string): boolean => {
  try {
    const stmt = db.prepare(`
      UPDATE personnel_absences
      SET rejoined = 1, date_rejoined = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(dateRejoined, absenceId);
    
    if (result.changes > 0) {
      // Récupérer l'absence mise à jour pour connaître le personnel_id
      const updatedAbsence = db.prepare(`
        SELECT personnel_id as personnelId
        FROM personnel_absences
        WHERE id = ?
      `).get(absenceId);
      
      if (updatedAbsence) {
        // Mettre à jour les jours d'absence du personnel
        updateAllPersonnelAbsenceDays();
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Erreur lors du marquage de l'absence ${absenceId} comme terminée:`, error);
    return false;
  }
};

// Migrer les données du personnel depuis le localStorage
export const migratePersonnelFromLocalStorage = (): void => {
  try {
    // Vérifier si des données existent déjà dans la base
    const personnelCount = db.prepare('SELECT COUNT(*) as count FROM personnel').get().count;
    
    if (personnelCount > 0) {
      return; // Ne pas migrer si des données existent déjà
    }
    
    // Récupérer les données depuis localStorage
    const storedPersonnel = localStorage.getItem('smartm_personnel');
    const storedAbsences = localStorage.getItem('smartm_personnel_absences');
    
    if (storedPersonnel) {
      const personnel: Personnel[] = JSON.parse(storedPersonnel);
      const absences: PersonnelAbsence[] = storedAbsences ? JSON.parse(storedAbsences) : [];
      
      // Utiliser une transaction pour s'assurer que tout est sauvegardé correctement
      db.transaction(() => {
        // Insérer le personnel
        const stmtPersonnel = db.prepare(`
          INSERT INTO personnel (id, name, absence_days, created_at)
          VALUES (?, ?, ?, ?)
        `);
        
        personnel.forEach(person => {
          stmtPersonnel.run(
            person.id,
            person.name,
            person.absenceDays,
            person.createdAt
          );
        });
        
        // Insérer les absences
        if (absences.length > 0) {
          const stmtAbsences = db.prepare(`
            INSERT INTO personnel_absences (
              id, personnel_id, personnel_name, label, reason,
              start_date, end_date, notified, rejoined, date_rejoined
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          absences.forEach(absence => {
            stmtAbsences.run(
              absence.id,
              absence.personnelId,
              absence.personnelName,
              absence.label,
              absence.reason,
              absence.startDate,
              absence.endDate,
              absence.notified ? 1 : 0,
              absence.rejoined ? 1 : 0,
              absence.dateRejoined || null
            );
          });
        }
      })();
    }
  } catch (error) {
    console.error('Erreur lors de la migration des données du personnel:', error);
  }
};
