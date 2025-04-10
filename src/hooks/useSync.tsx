
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getSyncState, 
  simulateSync, 
  updateAutoSyncSettings,
  EntityType,
  SyncState 
} from '@/utils/syncUtils';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const useSync = () => {
  const [syncState, setSyncState] = useState<SyncState>(getSyncState());
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const autoSyncIntervalRef = useRef<number | null>(null);

  // Rafraîchir l'état de synchronisation
  const refreshSyncState = useCallback(() => {
    setSyncState(getSyncState());
  }, []);

  // Effectuer une synchronisation manuelle
  const performSync = async (entityTypes: EntityType[] = [], mode: 'online' | 'local' = 'online') => {
    if (isSyncing) return false;
    
    try {
      setIsSyncing(true);
      
      // Si aucun type d'entité n'est spécifié, synchroniser toutes les entités avec des éléments en attente
      const typesToSync = entityTypes.length > 0 
        ? entityTypes 
        : Object.entries(syncState.entities)
            .filter(([_, entity]) => (entity?.pendingCount || 0) > 0)
            .map(([type]) => type as EntityType);
      
      if (typesToSync.length === 0) {
        toast({
          title: t("Synchronisation", "Synchronization"),
          description: t("Aucune donnée à synchroniser", "No data to synchronize"),
          variant: "default"
        });
        setIsSyncing(false);
        return true;
      }
      
      const success = await simulateSync(typesToSync, mode);
      
      if (success) {
        toast({
          title: t("Synchronisation réussie", "Synchronization successful"),
          description: t(
            `${typesToSync.length} catégorie(s) synchronisée(s)`,
            `${typesToSync.length} category(ies) synchronized`
          ),
          variant: "success"
        });
      } else {
        toast({
          title: t("Échec de synchronisation", "Synchronization failed"),
          description: t("Veuillez réessayer plus tard", "Please try again later"),
          variant: "destructive"
        });
      }
      
      refreshSyncState();
      return success;
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);
      toast({
        title: t("Erreur de synchronisation", "Synchronization error"),
        description: t(
          "Une erreur s'est produite pendant la synchronisation",
          "An error occurred during synchronization"
        ),
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Mise à jour des paramètres de synchronisation automatique
  const setAutoSyncSettings = useCallback((autoSync: boolean, syncFrequency: number) => {
    updateAutoSyncSettings(autoSync, syncFrequency);
    refreshSyncState();
  }, [refreshSyncState]);

  // Configurer la synchronisation automatique
  useEffect(() => {
    // Nettoyer l'intervalle précédent s'il existe
    if (autoSyncIntervalRef.current) {
      window.clearInterval(autoSyncIntervalRef.current);
      autoSyncIntervalRef.current = null;
    }

    // Si la synchronisation automatique est activée, configurer un nouvel intervalle
    if (syncState.autoSync && syncState.syncFrequency > 0) {
      const intervalMs = syncState.syncFrequency * 60 * 1000; // Convertir minutes en millisecondes
      
      autoSyncIntervalRef.current = window.setInterval(() => {
        // Vérifier s'il y a des éléments à synchroniser
        if (syncState.pendingCount > 0 && !isSyncing) {
          console.log(`[Auto Sync] Démarrage de la synchronisation automatique (${syncState.syncFrequency} minutes)`);
          performSync();
        }
      }, intervalMs);
      
      console.log(`[Info] Synchronisation automatique activée: ${syncState.syncFrequency} minutes`);
    } else {
      console.log('[Info] Synchronisation automatique désactivée');
    }

    // Nettoyer l'intervalle à la désactivation du composant
    return () => {
      if (autoSyncIntervalRef.current) {
        window.clearInterval(autoSyncIntervalRef.current);
        autoSyncIntervalRef.current = null;
      }
    };
  }, [syncState.autoSync, syncState.syncFrequency, syncState.pendingCount, isSyncing, performSync]);

  // Vérifier périodiquement l'état de synchronisation
  useEffect(() => {
    refreshSyncState();
    
    const interval = setInterval(refreshSyncState, 30000); // Vérifier toutes les 30 secondes
    
    return () => clearInterval(interval);
  }, [refreshSyncState]);

  return {
    syncState,
    isSyncing,
    performSync,
    refreshSyncState,
    setAutoSyncSettings
  };
};
