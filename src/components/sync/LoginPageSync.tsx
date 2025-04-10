
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SyncStatus } from './SyncStatus';

export const LoginPageSync: React.FC = () => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Synchronisation de données</CardTitle>
        <CardDescription>
          Vérifiez et synchronisez vos données même en mode hors ligne
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SyncStatus />
      </CardContent>
    </Card>
  );
};
