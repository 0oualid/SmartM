
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { getStorage } from '@/utils/sqliteStorage';
import { authenticateUser, authenticateWithGoogle, verifyToken } from '@/services/auth';

const storage = getStorage();

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string, rememberMe: boolean) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  user: { username: string; email?: string } | null;
}

// Configuration - with fallback for browser mode
const isDevelopment = process.env.NODE_ENV === 'development' || true;
const API_BASE_URL = isDevelopment ? '/api' : 'https://5b28-105-71-18-95.ngrok-free.app/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ username: string; email?: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated via JWT
    const checkAuthentication = async () => {
      setIsLoading(true);
      const token = storage.getItem('authToken');
      
      if (token) {
        try {
          // Get user info
          const userInfo = storage.getItem('userInfo');
          if (userInfo) {
            const userData = JSON.parse(userInfo);
            setUser({ username: userData.username, email: userData.email });
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error("Error retrieving user data", error);
          logout(); // Logout on error
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuthentication();
    
    // Handle application going to background/foreground in mobile
    const handleAppStateChange = async () => {
      try {
        // Dynamically import the required plugin
        const capacitorApp = await import('@capacitor/app');
        
        // Use the imported instance of the App plugin
        capacitorApp.App.addListener('appStateChange', ({ isActive }) => {
          if (isActive) {
            // App came to foreground - check token validity
            const token = storage.getItem('authToken');
            if (token) {
              try {
                const { valid } = verifyToken(token);
                if (!valid) {
                  console.log('Token expired while app was in background');
                  // Either refresh token or logout
                  logout();
                }
              } catch (error) {
                console.error('Error verifying token on app resume', error);
                logout();
              }
            }
          }
        });
        
        return () => {
          capacitorApp.App.removeAllListeners();
        };
      } catch (error) {
        console.error('Error setting up app state change listener', error);
      }
    };
    
    // Only set up the listener in mobile environments
    const isMobileApp = storage.getItem('storage_mode') === 'capacitor';
    if (isMobileApp) {
      handleAppStateChange();
    }
  }, []);

  const login = async (username: string, password: string, rememberMe: boolean): Promise<boolean> => {
    try {
      setIsLoading(true);
      // In browser mode, we'll use direct auth instead of API
      const response = await authenticateUser(username, password);
      
      if (response.success && response.token) {
        // Store authentication token
        storage.setItem('authToken', response.token);
        
        if (rememberMe) {
          storage.setItem('rememberMe', 'true');
          storage.setItem('userInfo', JSON.stringify({ 
            username: response.user.username,
            email: response.user.email 
          }));
        }
        
        setUser({ 
          username: response.user.username,
          email: response.user.email
        });
        setIsAuthenticated(true);
        return true;
      } else {
        toast({
          title: "Erreur d'authentification",
          description: "Nom d'utilisateur ou mot de passe incorrect",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error during authentication", error);
      
      // Fallback to simulated authentication if server is not available
      toast({
        title: "Service indisponible",
        description: "Connexion en mode hors ligne",
        variant: "destructive"
      });
      
      // In this degraded mode, we accept any credentials
      if (rememberMe) {
        storage.setItem('rememberMe', 'true');
        storage.setItem('userInfo', JSON.stringify({ username, email: `${username}@example.com` }));
      }
      
      storage.setItem('authToken', 'offline-mode-token');
      setUser({ username, email: `${username}@example.com` });
      setIsAuthenticated(true);
      
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Show toast to indicate that we're simulating Google authentication
      toast({
        title: "Simulation",
        description: "L'authentification Google est simulée",
        variant: "default"
      });
      
      // Simulate a delay for the Google auth process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock Google user data
      const mockGoogleData = {
        email: `user${Math.floor(Math.random() * 1000)}@gmail.com`,
        name: `Google User ${Math.floor(Math.random() * 100)}`,
        googleId: `google_${Math.random().toString(36).substring(2, 15)}`
      };
      
      // Use direct auth in browser mode instead of API
      const result = await authenticateWithGoogle(mockGoogleData);
      
      if (result.success && result.token && result.user) {
        // Store authentication data
        storage.setItem('authToken', result.token);
        storage.setItem('rememberMe', 'true'); // Google auth typically remembers user
        storage.setItem('userInfo', JSON.stringify({ 
          username: result.user.username,
          email: result.user.email 
        }));
        
        setUser({ 
          username: result.user.username,
          email: result.user.email
        });
        setIsAuthenticated(true);
        return true;
      } else {
        toast({
          title: "Erreur d'authentification",
          description: "L'authentification Google a échoué",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error during Google authentication", error);
      
      // Fallback authentication with mock data if API is unavailable
      toast({
        title: "Service indisponible",
        description: "Connexion avec Google en mode hors ligne",
        variant: "default"
      });
      
      // Create random Google user for offline mode
      const username = `googleuser${Math.floor(Math.random() * 1000)}`;
      const email = `${username}@gmail.com`;
      
      storage.setItem('authToken', 'google-offline-mode-token');
      storage.setItem('rememberMe', 'true');
      storage.setItem('userInfo', JSON.stringify({ username, email }));
      
      setUser({ username, email });
      setIsAuthenticated(true);
      
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate password reset
      console.log(`[Mode navigateur] Demande de réinitialisation pour: ${email}`);
      
      // Simulate delay for more realistic experience
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Email envoyé",
        description: "Si cette adresse email est associée à un compte, vous recevrez un lien de réinitialisation",
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error("Error resetting password", error);
      
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser le mot de passe",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Remove authentication information
    storage.removeItem('authToken');
    storage.removeItem('rememberMe');
    storage.removeItem('userInfo');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  if (isLoading) {
    // Return a loading state if we're checking authentication
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      loginWithGoogle, 
      logout, 
      resetPassword, 
      user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
