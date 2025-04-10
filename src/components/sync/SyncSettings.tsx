
import React, { useState, useEffect } from 'react';
import { useSync } from '@/hooks/useSync';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

export const SyncSettings: React.FC = () => {
  const { syncState, setAutoSyncSettings } = useSync();
  const { t } = useLanguage();
  const [autoSync, setAutoSync] = useState(syncState.autoSync);
  const [syncFrequency, setSyncFrequency] = useState(syncState.syncFrequency.toString());
  
  // Options de fréquence de synchronisation en minutes
  const frequencyOptions = [
    { value: '5', label: t('5 minutes', '5 minutes') },
    { value: '15', label: t('15 minutes', '15 minutes') },
    { value: '30', label: t('30 minutes', '30 minutes') },
    { value: '60', label: t('1 heure', '1 hour') },
    { value: '120', label: t('2 heures', '2 hours') },
    { value: '360', label: t('6 heures', '6 hours') },
    { value: '720', label: t('12 heures', '12 hours') },
    { value: '1440', label: t('24 heures', '24 hours') },
  ];

  // Initialiser les valeurs depuis le state
  useEffect(() => {
    setAutoSync(syncState.autoSync);
    setSyncFrequency(syncState.syncFrequency.toString());
  }, [syncState.autoSync, syncState.syncFrequency]);

  // Gérer le changement d'activation
  const handleAutoSyncChange = (checked: boolean) => {
    setAutoSync(checked);
    setAutoSyncSettings(checked, parseInt(syncFrequency));
  };

  // Gérer le changement de fréquence
  const handleFrequencyChange = (value: string) => {
    setSyncFrequency(value);
    setAutoSyncSettings(autoSync, parseInt(value));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="auto-sync">
            {t('Synchronisation automatique', 'Automatic synchronization')}
          </Label>
          <p className="text-sm text-muted-foreground">
            {t(
              'Activer la synchronisation automatique en arrière-plan',
              'Enable automatic background synchronization'
            )}
          </p>
        </div>
        <Switch 
          id="auto-sync" 
          checked={autoSync}
          onCheckedChange={handleAutoSyncChange}
        />
      </div>
      
      {autoSync && (
        <div className="space-y-2">
          <Label htmlFor="sync-frequency">
            {t('Fréquence de synchronisation', 'Synchronization frequency')}
          </Label>
          <Select 
            value={syncFrequency} 
            onValueChange={handleFrequencyChange}
            disabled={!autoSync}
          >
            <SelectTrigger id="sync-frequency" className="w-full">
              <SelectValue placeholder={t('Sélectionner une fréquence', 'Select frequency')} />
            </SelectTrigger>
            <SelectContent>
              {frequencyOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {t(
              'La synchronisation automatique s\'effectuera uniquement s\'il y a des données à synchroniser',
              'Automatic synchronization will only occur if there is data to synchronize'
            )}
          </p>
        </div>
      )}
    </div>
  );
};
