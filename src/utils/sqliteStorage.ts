import { LocalStorage } from 'node-localstorage'; // Importer pour Node.js

class SQLiteStorage {
  private initialized: boolean = false;
  private dbName: string = 'smartm-db';
  private isMobileApp: boolean = false;
  private localStorage: Storage;

  constructor() {
    this.detectEnvironment();
    this.initializeStorage();
  }

  // Détecter si l'environnement est une application mobile native ou navigateur
  private detectEnvironment(): void {
    try {
      if (typeof window !== 'undefined' && 'Capacitor' in window) {
        this.isMobileApp = true;
        console.info('[Info] Exécution dans un environnement mobile natif');
        // Vous pouvez également configurer un autre stockage ici pour Capacitor si nécessaire
      } else if (typeof window !== 'undefined' && window.localStorage) {
        console.info('[Info] Exécution dans un environnement navigateur');
        this.localStorage = window.localStorage;
      } else {
        console.info('[Info] Exécution dans un environnement Node.js');
        this.localStorage = new LocalStorage('./scratch'); // Répertoire local pour Node.js
      }
    } catch (error) {
      console.error('Erreur lors de la détection de l\'environnement:', error);
      this.isMobileApp = false;
      this.localStorage = new LocalStorage('./scratch'); // Par défaut, utiliser node-localstorage
    }
  }

  // Initialiser le stockage
  initializeStorage(): void {
    if (this.initialized) return;

    try {
      if (!this.localStorage.getItem(`${this.dbName}_initialized`)) {
        this.localStorage.setItem(`${this.dbName}_initialized`, 'true');
        this.localStorage.setItem(`${this.dbName}_users`, JSON.stringify([]));
      }

      this.initialized = true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du stockage:', error);
    }
  }

  // Obtenir un élément du stockage
  getItem(key: string): string | null {
    try {
      return this.localStorage.getItem(key);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'élément:', error);
      return null;
    }
  }

  // Ajouter ou mettre à jour un élément dans le stockage
  setItem(key: string, value: string): void {
    try {
      this.localStorage.setItem(key, value);
    } catch (error) {
      console.error('Erreur lors de la définition de l\'élément:', error);
    }
  }

  // Supprimer un élément du stockage
  removeItem(key: string): void {
    try {
      this.localStorage.removeItem(key);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'élément:', error);
    }
  }

  // Effacer tout le stockage
  clear(): void {
    try {
      this.localStorage.clear();
    } catch (error) {
      console.error('Erreur lors de l\'effacement du stockage:', error);
    }
  }

  // Exécution d'une requête SQL (simulée pour le navigateur)
  executeQuery(sql: string, params: any[] = []): any {
    console.log('Requête SQLite (simulée):', sql, params);
    return { success: true };
  }
}

// Créer et exporter une instance singleton
const sqliteStorage = new SQLiteStorage();

// Fonction getter pour accéder à l'instance singleton
export const getStorage = (): SQLiteStorage => {
  return sqliteStorage;
};

export default sqliteStorage;
