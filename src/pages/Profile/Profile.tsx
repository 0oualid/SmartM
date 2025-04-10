
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { SyncDrawer } from '@/components/sync/SyncIndicator';
import { SyncSettings } from '@/components/sync/SyncSettings';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    const notifs = localStorage.getItem('notifications') !== 'false';
    
    setIsDarkMode(darkMode);
    setNotifications(notifs);
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  const handleDarkModeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    localStorage.setItem('darkMode', checked.toString());
    
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  const handleNotificationChange = (checked: boolean) => {
    setNotifications(checked);
    localStorage.setItem('notifications', checked.toString());
  };
  
  const handleSaveChanges = () => {
    toast({
      title: t("Profil mis à jour", "Profile updated"),
      description: t("Vos informations ont été enregistrées avec succès", "Your information has been successfully saved"),
    });
  };

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {t('Profil Utilisateur', 'User Profile')}
        </h1>
        <SyncDrawer />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('Informations personnelles', 'Personal Information')}</CardTitle>
          <CardDescription>
            {t('Consultez et modifiez vos informations personnelles', 
               'View and edit your personal information')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("Nom d'utilisateur", 'Username')}</Label>
              <Input id="username" defaultValue={user?.username || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email || ''} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="current-password">
              {t('Mot de passe actuel', 'Current Password')}
            </Label>
            <Input id="current-password" type="password" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">
                {t('Nouveau mot de passe', 'New Password')}
              </Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                {t('Confirmer le mot de passe', 'Confirm Password')}
              </Label>
              <Input id="confirm-password" type="password" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-5">
          <Button variant="outline">{t('Annuler', 'Cancel')}</Button>
          <Button onClick={handleSaveChanges}>
            {t('Enregistrer les modifications', 'Save Changes')}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('Préférences', 'Preferences')}</CardTitle>
          <CardDescription>
            {t('Gérez vos préférences de notification et d\'affichage', 
               'Manage your notification and display preferences')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">{t('Mode sombre', 'Dark Mode')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('Activer le thème sombre pour l\'interface', 
                     'Enable dark theme for the interface')}
                </p>
              </div>
              <Switch 
                id="dark-mode" 
                checked={isDarkMode}
                onCheckedChange={handleDarkModeChange}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">{t('Notifications', 'Notifications')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('Recevoir des notifications par email', 
                     'Receive email notifications')}
                </p>
              </div>
              <Switch 
                id="notifications" 
                checked={notifications}
                onCheckedChange={handleNotificationChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-5">
          <Button onClick={() => toast({
            title: t("Préférences enregistrées", "Preferences saved"),
            description: t("Vos préférences ont été mises à jour", 
                         "Your preferences have been updated")
          })}>
            {t('Enregistrer les préférences', 'Save Preferences')}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('Synchronisation', 'Synchronization')}</CardTitle>
          <CardDescription>
            {t('Gérez la synchronisation des données avec le serveur', 
               'Manage data synchronization with the server')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SyncSettings />
            <div className="p-2 mt-4 border rounded-lg">
              <SyncDrawer />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
