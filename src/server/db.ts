// Implémentation de base de données SQLite compatible avec le navigateur

// Vérifier si nous sommes dans un environnement navigateur
const isBrowser = typeof window !== 'undefined';

// Créer une implémentation de base de données pour l'environnement approprié
let db: any;

if (isBrowser) {
  // En environnement navigateur, créer une implémentation qui utilise le stockage local
  console.log('[Info] Exécution dans un environnement navigateur, utilisation du stockage local comme solution de repli pour la base de données');
  
  // Implémentation factice qui simule l'interface SQLite mais utilise le stockage local
  db = createBrowserDb();
} else {
  // N'importer et utiliser SQLite que dans un environnement Node.js
  try {
    const Database = require('better-sqlite3');
    const { join } = require('path');
    const fs = require('fs');

    // S'assurer que le répertoire de la base de données existe
    const dbDir = join(process.cwd(), 'data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const DB_PATH = join(dbDir, 'smartm.db');
    db = new Database(DB_PATH);

    // Activer les contraintes de clé étrangère
    db.pragma('foreign_keys = ON');

    // Initialiser le schéma de la base de données
    initDb();
  } catch (error) {
    console.error('[Error] Échec d\'initialisation de la base de données SQLite:', error);
    // Fournir une solution de repli même côté serveur si l'initialisation SQLite échoue
    db = createMockDb();
  }
}

// Helper function to create a browser-compatible DB implementation
function createBrowserDb() {
  return {
    prepare: (sql: string) => {
      return {
        all: (...params: any[]) => {
          const tableName = extractTableName(sql);
          if (sql.includes('SELECT')) {
            return getLocalData(tableName) || [];
          }
          return [];
        },
        get: (...params: any[]) => {
          const tableName = extractTableName(sql);
          const data = getLocalData(tableName) || [];
          if (sql.includes('COUNT')) {
            return { count: data.length };
          }
          return data[0] || null;
        },
        run: (...params: any[]) => {
          return { lastInsertRowid: Date.now() }; // Simuler un ID d'insertion
        }
      };
    },
    transaction: (fn: Function) => {
      return () => fn(); // Passage simple pour les transactions
    },
    exec: (sql: string) => {
      // No-op pour la création de schéma dans le navigateur
      console.log('[Browser DB] Would execute:', sql);
    },
    pragma: (sql: string) => {
      // No-op pour pragma dans le navigateur
      console.log('[Browser DB] Would set pragma:', sql);
    }
  };
}

// Simple mock db for fallback
function createMockDb() {
  return {
    prepare: (sql: string) => ({
      all: () => [],
      get: () => null,
      run: () => ({ lastInsertRowid: Date.now() })
    }),
    transaction: (fn: Function) => () => fn(),
    exec: () => {},
    pragma: () => {}
  };
}

// Fonctions d'aide pour la base de données simulée du navigateur
function extractTableName(sql: string): string {
  // Regex simple pour extraire le nom de la table à partir de SQL
  const matches = sql.match(/FROM\s+([a-zA-Z0-9_]+)/i) || 
                   sql.match(/INTO\s+([a-zA-Z0-9_]+)/i) ||
                   sql.match(/UPDATE\s+([a-zA-Z0-9_]+)/i) ||
                   sql.match(/DELETE\s+FROM\s+([a-zA-Z0-9_]+)/i);
  return matches ? matches[1] : '';
}

function getLocalData(tableName: string): any[] {
  try {
    const key = `smartm_${tableName}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(`[Browser DB] Erreur lors de la récupération des données pour ${tableName}:`, e);
    return [];
  }
}

// Initialiser les tables de la base de données - uniquement utilisé dans l'environnement Node.js
function initDb() {
  if (isBrowser) return;

  // Initialiser toutes les tables de la base de données
  db.exec(`
      CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          googleId TEXT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE,
          password TEXT NOT NULL,
          reset_token TEXT,
          reset_token_expires TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
  `);

  db.exec(`
      CREATE TABLE IF NOT EXISTS personnel_absences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          label TEXT NOT NULL,
          reason TEXT NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          notified INTEGER DEFAULT 0,
          rejoined INTEGER DEFAULT 0,
          date_rejoined TEXT
      )
  `);

  db.exec(`
      CREATE TABLE IF NOT EXISTS personnel (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          absence_days INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
  `);

  db.exec(`
      CREATE TABLE IF NOT EXISTS instances (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          assignee TEXT NOT NULL,
          due_date TEXT NOT NULL,
          status TEXT NOT NULL,
          reference TEXT,
          last_notified TEXT,
          notification_sent INTEGER DEFAULT 0
      )
  `);

  db.exec(`
      CREATE TABLE IF NOT EXISTS equipment (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          service TEXT NOT NULL,
          status TEXT NOT NULL,
          sensitivity INTEGER NOT NULL
      )
  `);

  db.exec(`
      CREATE TABLE IF NOT EXISTS equipment_failures (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          equipment_id INTEGER NOT NULL,
          failure_type TEXT NOT NULL,
          failure_date TEXT NOT NULL,
          component TEXT NOT NULL,
          reference TEXT,
          FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
      )
  `);

  db.exec(`
      CREATE TABLE IF NOT EXISTS consumptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          invoice_id TEXT,
          amount REAL NOT NULL,
          date TEXT NOT NULL,
          description TEXT,
          category TEXT,
          image_path TEXT
      )
  `);

  db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          date TEXT NOT NULL,
          read INTEGER DEFAULT 0,
          type TEXT NOT NULL
      )
  `);

  db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
      )
  `);

  db.exec(`
      CREATE TABLE IF NOT EXISTS sync_status (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          entity_type TEXT NOT NULL,
          entity_id INTEGER NOT NULL,
          sync_status TEXT NOT NULL,
          last_sync_attempt TEXT,
          last_sync_success TEXT
      )
  `);

  // Ajouter une nouvelle table pour le stockage local
  db.exec(`
      CREATE TABLE IF NOT EXISTS local_storage (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
      )
  `);
}

export default db;
