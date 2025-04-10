
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Notification, getNotifications, saveNotifications } from '@/utils/localStorageService';
import { Search, CheckCircle, AlertTriangle, Info, CheckSquare, Trash } from 'lucide-react';
import { formatDate } from '@/utils/notificationUtils';

const NotificationsList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // Charger les notifications au chargement de la page
    const loadedNotifications = getNotifications();
    
    // Trier par date (plus récent en premier)
    loadedNotifications.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setNotifications(loadedNotifications);
  }, []);
  
  // Filtrer les notifications en fonction de la recherche
  const filteredNotifications = notifications.filter(notification => 
    notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Marquer une notification comme lue
  const markAsRead = (id: number) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id 
        ? { ...notification, read: true } 
        : notification
    );
    
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };
  
  // Supprimer une notification
  const deleteNotification = (id: number) => {
    const updatedNotifications = notifications.filter(notification => notification.id !== id);
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };
  
  // Marquer toutes les notifications comme lues
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };
  
  // Supprimer toutes les notifications
  const deleteAllNotifications = () => {
    setNotifications([]);
    saveNotifications([]);
  };
  
  // Obtenir l'icône en fonction du type de notification
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Historique des Notifications</h1>
          <p className="text-muted-foreground">Consultez l'historique de vos notifications</p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckSquare className="h-4 w-4 mr-2" />
            Tout marquer comme lu
          </Button>
          <Button variant="destructive" onClick={deleteAllNotifications}>
            <Trash className="h-4 w-4 mr-2" />
            Supprimer tout
          </Button>
        </div>
      </header>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                {filteredNotifications.length} notification(s) au total
              </CardDescription>
            </div>
            <div className="w-full md:w-1/3 mt-4 md:mt-0 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une notification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Historique des notifications</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <TableRow key={notification.id} className={notification.read ? "" : "bg-gray-50 dark:bg-gray-800"}>
                    <TableCell>
                      <div className="flex items-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{notification.title}</TableCell>
                    <TableCell>{notification.message}</TableCell>
                    <TableCell>{formatDate(notification.date)}</TableCell>
                    <TableCell>
                      {notification.read ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                          Lu
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          Non lu
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {!notification.read && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckSquare className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Aucune notification trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsList;
