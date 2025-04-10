
import React from 'react';
import { useSync } from '@/hooks/useSync';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { SyncStatus } from './SyncStatus';

export const SyncIndicator: React.FC = () => {
  const { syncState, isSyncing, performSync } = useSync();
  const { pendingCount } = syncState;
  
  return (
    <DrawerTrigger asChild>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={(e) => {
                // Empêcher que le clic déclenche à la fois le drawer et la synchronisation
                e.stopPropagation();
              }}
            >
              <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
              {pendingCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {pendingCount > 99 ? '99+' : pendingCount}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{pendingCount > 0 
              ? `${pendingCount} élément(s) en attente de synchronisation` 
              : 'Synchronisation à jour'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </DrawerTrigger>
  );
};

// Composant pour utiliser ensemble l'indicateur et le drawer
export const SyncDrawer: React.FC = () => {
  return (
    <Drawer>
      <SyncIndicator />
      <DrawerContent>
        <div className="p-4 max-h-[80vh] overflow-auto">
          <SyncStatus />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
