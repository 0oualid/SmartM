
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Cpu, 
  Users, 
  DollarSign, 
  CheckSquare, 
  LayoutDashboard, 
  LogOut, 
  User,
  Menu,
  X,
  ChevronRight,
  Bell,
  InfoIcon,
  MessageSquare,
  FileText
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { getNotifications } from '@/utils/localStorageService';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { logout } = useAuth();
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
    { label: t('Tableau de bord', 'Dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { label: t('Équipements', 'Equipment'), icon: Cpu, path: '/equipment' },
    { label: t('Personnel', 'Personnel'), icon: Users, path: '/personnel' },
    { label: t('Finance', 'Finance'), icon: DollarSign, path: '/consumption' },
    { label: t('Instances', 'Tasks'), icon: CheckSquare, path: '/tasks' },
  ];

  const profileMenuItems = [
    { label: t('À propos', 'About'), icon: InfoIcon, path: '/about' },
    { label: t('Contact', 'Contact'), icon: MessageSquare, path: '/contact' },
    { label: t('Profil', 'Profile'), icon: User, path: '/profile' },
    { label: t('Rapport', 'Report'), icon: FileText, path: '/report' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {!isMobile && (
        <aside 
          className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-950 shadow-lg transition-transform duration-300 md:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:relative md:z-0`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-6 border-b">
              <Link to="/dashboard" className="flex items-center">
                <img 
                  src="/lovable-uploads/313a3b87-4513-4d9c-851f-6124baf408f4.png" 
                  alt="Logo" 
                  className="h-12 w-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/smartm-logo-fallback.svg';
                  }}
                />
              </Link>
              <button 
                className="md:hidden"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center text-sm rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                        isActive(item.path) 
                          ? 'bg-primary text-white hover:bg-primary/90 dark:hover:bg-primary/90' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.label}
                      {isActive(item.path) && (
                        <ChevronRight className="ml-auto h-4 w-4" />
                      )}
                    </Link>
                  </li>
                ))}
                
                <li className="mt-4 border-t pt-4">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {t('Utilisateur', 'User')}
                  </h3>
                </li>
                
                {profileMenuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center text-sm rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                        isActive(item.path) 
                          ? 'bg-primary text-white hover:bg-primary/90 dark:hover:bg-primary/90' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.label}
                      {isActive(item.path) && (
                        <ChevronRight className="ml-auto h-4 w-4" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="p-4 border-t">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                <LogOut className="mr-3 h-5 w-5" />
                {t('Déconnexion', 'Logout')}
              </Button>
            </div>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col max-w-full">
        {!isMobile && (
          <header className="flex items-center h-16 px-6 border-b bg-white dark:bg-gray-950 z-10 shadow-sm">
            <button 
              className="mr-4 md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <Link to="/dashboard" className="flex items-center">
              <img 
                src="/lovable-uploads/313a3b87-4513-4d9c-851f-6124baf408f4.png" 
                alt="Logo" 
                className="h-12 w-auto"
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center">
                    <Avatar className="h-8 w-8 cursor-pointer" style={{ backgroundColor: '#0EA5E9' }}>
                      <AvatarFallback className="text-white">
                        <User className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {profileMenuItems.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="flex items-center space-x-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
        )}

        {isMobile && (
          <header className="flex items-center h-16 px-4 border-b bg-white dark:bg-gray-950 z-10 shadow-sm">
            <Link to="/dashboard" className="flex items-center">
              <img 
                src="/lovable-uploads/313a3b87-4513-4d9c-851f-6124baf408f4.png" 
                alt="Logo" 
                className="h-12 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/smartm-logo-fallback.svg';
                }}
              />
            </Link>
            <div className="flex-1" />
            <div className="flex items-center space-x-2">
              <button 
                className="relative text-gray-500 hover:text-gray-700"
                onClick={() => navigate('/notifications')}
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer" style={{ backgroundColor: '#0EA5E9' }}>
                    <AvatarFallback className="text-white">
                      <User className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {profileMenuItems.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="flex items-center space-x-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
        )}

        <main className={`flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 ${isMobile ? 'pb-16' : ''}`}>
          {children}
        </main>

        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-t shadow-lg">
            <div className="flex items-center justify-around h-16">
              {menuItems.map((item) => (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.path}
                      className={`flex flex-col items-center justify-center py-2 px-1 ${
                        isActive(item.path)
                          ? 'text-primary'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-xs mt-1 text-center">{item.label}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Layout;
