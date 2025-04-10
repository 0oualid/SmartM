
import React, { useEffect, useState } from 'react';
import { useSync } from '@/hooks/useSync';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

export const LoginSyncComponent: React.FC = () => {
  const { syncState, isSyncing, performSync } = useSync();
  const { pendingCount } = syncState;
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  // Ne pas afficher immédiatement pour éviter un flash durant le chargement
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(pendingCount > 0);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [pendingCount]);

  if (!visible) return null;

  return (
    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Badge 
            variant="outline" 
            className="bg-yellow-100 text-yellow-800 border-yellow-200 mr-2"
          >
            {pendingCount}
          </Badge>
          <span className="text-sm font-medium text-yellow-800">
            {t(
              `${pendingCount} élément(s) en attente de synchronisation`,
              `${pendingCount} item(s) pending synchronization`
            )}
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="bg-white"
          onClick={() => performSync()}
          disabled={isSyncing}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
          {t('Synchroniser', 'Sync')}
        </Button>
      </div>
    </div>
  );
};
