
// Statuts possibles pour une synchronisation
export type SyncStatus = 'pending' | 'synced' | 'error';

// Types d'entités qui peuvent être synchronisées
export type EntityType = 'equipment' | 'personnel' | 'instances' | 'consumptions' | 'failures';

// Interface pour l'état de synchronisation
export interface SyncState {
  pendingCount: number;
  lastSyncAttempt?: string;
  lastSuccessfulSync?: string;
  autoSync: boolean;
  syncFrequency: number; // fréquence en minutes
  entities: {
    [key in EntityType]?: {
      pendingCount: number;
      lastSync?: string;
    };
  };
}

// État initial de synchronisation
export const initialSyncState: SyncState = {
  pendingCount: 0,
  autoSync: false,
  syncFrequency: 30, // 30 minutes par défaut
  entities: {}
};

// Récupérer l'état de synchronisation depuis localStorage
export const getSyncState = (): SyncState => {
  try {
    const storedState = localStorage.getItem('smartm_sync_state');
    if (storedState) {
      return JSON.parse(storedState);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'état de synchronisation:', error);
  }
  
  return { ...initialSyncState };
};

// Sauvegarder l'état de synchronisation dans localStorage
export const saveSyncState = (state: SyncState): void => {
  try {
    localStorage.setItem('smartm_sync_state', JSON.stringify(state));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'état de synchronisation:', error);
  }
};

// Mettre à jour le compteur pour une entité spécifique
export const updateEntityPendingCount = (entityType: EntityType, count: number): void => {
  const state = getSyncState();
  
  if (!state.entities[entityType]) {
    state.entities[entityType] = {
      pendingCount: 0
    };
  }
  
  state.entities[entityType]!.pendingCount = count;
  
  // Recalculer le total
  state.pendingCount = Object.values(state.entities).reduce(
    (sum, entity) => sum + (entity?.pendingCount || 0), 
    0
  );
  
  saveSyncState(state);
};

// Marquer qu'une entité est en attente de synchronisation
export const markEntityForSync = (entityType: EntityType, entityId: number): void => {
  const state = getSyncState();
  
  if (!state.entities[entityType]) {
    state.entities[entityType] = {
      pendingCount: 0
    };
  }
  
  state.entities[entityType]!.pendingCount += 1;
  state.pendingCount += 1;
  
  saveSyncState(state);
  
  // Enregistrer l'ID spécifique dans une liste séparée pour une synchronisation ultérieure
  try {
    const pendingItemsKey = `smartm_pending_sync_${entityType}`;
    const storedItems = localStorage.getItem(pendingItemsKey);
    let pendingItems: number[] = storedItems ? JSON.parse(storedItems) : [];
    
    if (!pendingItems.includes(entityId)) {
      pendingItems.push(entityId);
      localStorage.setItem(pendingItemsKey, JSON.stringify(pendingItems));
    }
  } catch (error) {
    console.error(`Erreur lors du marquage de l'entité ${entityType} pour synchronisation:`, error);
  }
};

// Mettre à jour les paramètres de synchronisation automatique
export const updateAutoSyncSettings = (autoSync: boolean, syncFrequency: number): void => {
  const state = getSyncState();
  
  state.autoSync = autoSync;
  state.syncFrequency = syncFrequency;
  
  saveSyncState(state);
};

// Simuler une synchronisation avec le serveur
export const simulateSync = async (
  entityTypes: EntityType[], 
  mode: 'online' | 'local'
): Promise<boolean> => {
  try {
    const state = getSyncState();
    const timestamp = new Date().toISOString();
    
    // Mettre à jour les timestamps
    state.lastSyncAttempt = timestamp;
    
    // Si mode en ligne, simuler un appel API
    if (mode === 'online') {
      console.log(`[Info] Synchronisation en ligne des entités: ${entityTypes.join(', ')}`);
      
      // Simuler un délai de réseau
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 90% de chance de réussite
      const success = Math.random() < 0.9;
      
      if (!success) {
        console.error('[Error] Échec de la synchronisation en ligne');
        return false;
      }
    }
    
    // Mettre à jour l'état pour chaque type d'entité
    entityTypes.forEach(entityType => {
      if (state.entities[entityType]) {
        state.entities[entityType]!.pendingCount = 0;
        state.entities[entityType]!.lastSync = timestamp;
      }
      
      // Vider la liste des éléments en attente
      localStorage.removeItem(`smartm_pending_sync_${entityType}`);
    });
    
    // Recalculer le total
    state.pendingCount = Object.values(state.entities).reduce(
      (sum, entity) => sum + (entity?.pendingCount || 0), 
      0
    );
    
    state.lastSuccessfulSync = timestamp;
    
    saveSyncState(state);
    return true;
  } catch (error) {
    console.error('Erreur lors de la simulation de synchronisation:', error);
    return false;
  }
};
