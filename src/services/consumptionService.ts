
import db from '../server/db';
import { getStorage } from '../utils/sqliteStorage';

const storage = getStorage();

export interface Consumption {
  id: number;
  invoiceId: string;
  amount: number;
  date: string;
  description?: string;
}

// Récupérer toutes les factures
export const getConsumptions = (): Consumption[] => {
  try {
    const consumptions = db.prepare(`
      SELECT 
        id, 
        invoice_id as invoiceId, 
        amount, 
        date, 
        description
      FROM consumptions
    `).all();
    
    return consumptions;
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    return [];
  }
};

// Sauvegarder les factures
export const saveConsumptions = (consumptions: Consumption[]): void => {
  try {
    const transaction = db.transaction(() => {
      // Supprimer toutes les factures existantes
      db.prepare('DELETE FROM consumptions').run();
      
      // Insérer les nouvelles factures
      const insertStmt = db.prepare(`
        INSERT INTO consumptions (id, invoice_id, amount, date, description)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      consumptions.forEach(consumption => {
        insertStmt.run(
          consumption.id,
          consumption.invoiceId || null,
          consumption.amount,
          consumption.date,
          consumption.description || null
        );
      });
    });
    
    transaction();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des factures:', error);
  }
};

// Migrer les factures depuis localStorage
export const migrateConsumptionsFromLocalStorage = (): void => {
  try {
    // Vérifier si des données existent déjà dans la base
    const consumptionCount = db.prepare('SELECT COUNT(*) as count FROM consumptions').get().count;
    
    if (consumptionCount > 0) {
      return; // Ne pas migrer si des données existent déjà
    }
    
    // Vérifier si localStorage est disponible
    const storedData = storage.getItem('consumptions');
    if (storedData) {
      const consumptions = JSON.parse(storedData);
      saveConsumptions(consumptions);
    } else {
      console.log('Aucune donnée de consommation trouvée dans le stockage local');
    }
  } catch (error) {
    console.error('Erreur lors de la migration des factures:', error);
  }
};
