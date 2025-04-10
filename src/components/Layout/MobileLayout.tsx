
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Cpu, 
  Users, 
  DollarSign, 
  CheckSquare, 
  LayoutDashboard, 
  LogOut, 
  Bell,
  User,
  Info,
  MessageSquare,
  Menu,
  FileText
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { getNotifications } from '@/utils/localStorageService';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const location = useLocation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const notifications = getNotifications();
    const unread = notifications.filter(n => !n.read).length;
    setUnreadNotifications(unread);

    const interval = setInterval(() => {
      const notifications = getNotifications();
      const unread = notifications.filter(n => !n.read).length;
      setUnreadNotifications(unread);
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    
    toast({
      title: t("Déconnexion réussie", "Logout successful"),
      description: t("Vous avez été déconnecté avec succès.", "You have been successfully logged out."),
    });
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { label: t('Tableau', 'Dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { label: t('Équipements', 'Equipment'), icon: Cpu, path: '/equipment' },
    { label: t('Personnel', 'Personnel'), icon: Users, path: '/personnel' },
    { label: t('Finance', 'Finance'), icon: DollarSign, path: '/consumption' },
    { label: t('Instances', 'Tasks'), icon: CheckSquare, path: '/tasks' },
  ];

  const extraItems = [
    { label: t('À propos', 'About'), icon: Info, path: '/about' },
    { label: t('Contact', 'Contact'), icon: MessageSquare, path: '/contact' },
    { label: t('Profil', 'Profile'), icon: User, path: '/profile' },
    { label: t('Rapport', 'Report'), icon: FileText, path: '/report' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      <header className="sticky top-0 z-50 flex items-center h-14 px-4 border-b bg-white dark:bg-gray-950 shadow-sm">
        <Link to="/dashboard" className="flex items-center">
          <img 
            src="/lovable-uploads/313a3b87-4513-4d9c-851f-6124baf408f4.png" 
            alt="SmartM Logo" 
            className="h-10 w-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/smartm-logo-fallback.svg';
            }}
          />
        </Link>
        
        <div className="flex-1" />
        
        <div className="flex items-center space-x-3">
          <button 
            className="relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
          
          <Sheet>
            <SheetTrigger asChild>
              <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="py-4">
                <div className="flex items-center mb-6">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white mr-3">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{user?.username}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                
                <nav className="space-y-1 mb-6">
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <User className="h-5 w-5 mr-3 text-gray-500" />
                    <span>{t('Profil', 'Profile')}</span>
                  </Link>
                  
                  {extraItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        isActive(item.path) ? 'bg-gray-100 dark:bg-gray-800' : ''
                      }`}
                    >
                      <item.icon className="h-5 w-5 mr-3 text-gray-500" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
                
                <div className="pt-4 border-t">
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 w-full text-left rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>{t('Déconnexion', 'Logout')}</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center"
          >
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
              <User className="h-4 w-4" />
            </div>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 pb-16">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-t shadow-lg h-16">
        <div className="grid grid-cols-5 h-full">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 ${
                isActive(item.path)
                  ? 'text-primary'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;
