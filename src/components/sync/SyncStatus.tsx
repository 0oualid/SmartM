
import React from 'react';
import { useSync } from '@/hooks/useSync';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, RefreshCw, WifiOff, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EntityType } from '@/utils/syncUtils';
import { SyncSettings } from './SyncSettings';
import { useLanguage } from '@/contexts/LanguageContext';

// Composant pour afficher la dernière synchronisation
const LastSync: React.FC<{ timestamp?: string }> = ({ timestamp }) => {
  const { t } = useLanguage();
  
  if (!timestamp) return (
    <span className="text-sm text-muted-foreground">
      {t('Jamais synchronisé', 'Never synchronized')}
    </span>
  );
  
  try {
    const date = parseISO(timestamp);
    const formattedDate = format(date, 'dd MMM yyyy à HH:mm', { locale: fr });
    return (
      <span className="text-sm text-muted-foreground flex items-center gap-1">
        <Check className="h-3 w-3 text-green-500" />
        {formattedDate}
      </span>
    );
  } catch (e) {
    return (
      <span className="text-sm text-muted-foreground">
        {t('Format de date invalide', 'Invalid date format')}
      </span>
    );
  }
};

// Mapping des types d'entités vers des noms plus lisibles
const entityNames: Record<EntityType, { fr: string, en: string }> = {
  'equipment': { fr: 'Équipements', en: 'Equipment' },
  'personnel': { fr: 'Personnel', en: 'Personnel' },
  'instances': { fr: 'Tâches', en: 'Tasks' },
  'consumptions': { fr: 'Consommations', en: 'Consumptions' },
  'failures': { fr: 'Pannes', en: 'Failures' }
};

export const SyncStatus: React.FC = () => {
  const { syncState, isSyncing, performSync } = useSync();
  const { t } = useLanguage();
  
  const handleSync = async (mode: 'online' | 'local') => {
    await performSync([], mode);
  };

  // Obtenir le nom traduit de l'entité
  const getEntityName = (entityType: EntityType) => {
    const entityName = entityNames[entityType] || { fr: entityType, en: entityType };
    return t(entityName.fr, entityName.en);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          {t('Statut de synchronisation', 'Synchronization status')}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSync('local')}
            disabled={isSyncing || syncState.pendingCount === 0}
          >
            <WifiOff className="h-4 w-4 mr-2" />
            {t('Local', 'Local')}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleSync('online')}
            disabled={isSyncing || syncState.pendingCount === 0}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {t('Synchroniser', 'Synchronize')}
          </Button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">
            {t('Éléments en attente:', 'Pending items:')} {syncState.pendingCount}
          </span>
          <LastSync timestamp={syncState.lastSuccessfulSync} />
        </div>
        <Progress value={syncState.pendingCount > 0 ? 0 : 100} className="h-2" />
      </div>
      
      {/* Paramètres de synchronisation automatique */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md dark:bg-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-medium">
            {t('Configuration de la synchronisation', 'Synchronization configuration')}
          </h4>
        </div>
        <SyncSettings />
      </div>
      
      <Separator className="my-4" />
      
      {/* Détails par type d'entité */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium mb-2">
          {t('Détails par catégorie', 'Details by category')}
        </h4>
        
        {Object.entries(syncState.entities).map(([type, data]) => {
          if (!data) return null;
          const entityType = type as EntityType;
          return (
            <div key={type} className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium">{getEntityName(entityType)}</span>
                <div className="text-xs text-muted-foreground">
                  {t(`${data.pendingCount} en attente`, `${data.pendingCount} pending`)}
                </div>
              </div>
              <LastSync timestamp={data.lastSync} />
            </div>
          );
        })}
        
        {Object.keys(syncState.entities).length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-2">
            {t('Aucune donnée à synchroniser', 'No data to synchronize')}
          </div>
        )}
      </div>
    </div>
  );
};
