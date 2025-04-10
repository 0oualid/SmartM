
// Mobile Optimization Utilities for Capacitor
import { useEffect } from 'react';
import { getStorage } from './sqliteStorage';

const storage = getStorage();

// Fonction d'initialisation de Capacitor avec optimisations mobiles
export const initializeCapacitor = async () => {
  try {
    // Dynamically import Capacitor core only when needed
    const { Capacitor } = await import('@capacitor/core');
    
    // Check if running on a native platform
    if (Capacitor.isNativePlatform()) {
      console.log('Running on', Capacitor.getPlatform());
      
      try {
        // Import status bar plugin dynamically
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        // Set status bar to be visible with dark text
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
      } catch (e) {
        console.error('Error setting up StatusBar:', e);
      }
      
      try {
        // Import splash screen plugin dynamically
        const { SplashScreen } = await import('@capacitor/splash-screen');
        // Hide the splash screen with a fade out animation
        await SplashScreen.hide({
          fadeOutDuration: 500
        });
      } catch (e) {
        console.error('Error handling SplashScreen:', e);
      }
      
      // Configure le stockage pour le mode Capacitor
      storage.setItem('storage_mode', 'capacitor');
      
      // Activate touch optimization
      document.documentElement.classList.add('touch-device');
      
      // Prevent zoom on double tap (iOS)
      const metaViewport = document.querySelector('meta[name=viewport]');
      if (metaViewport) {
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.getElementsByTagName('head')[0].appendChild(meta);
      }
      
      // Add mobile app CSS class to body
      document.body.classList.add('mobile-app');
    } else {
      console.log('Running on web');
      storage.setItem('storage_mode', 'web');
      
      // Still add mobile-optimized CSS for responsive web viewing
      document.body.classList.add('mobile-optimized');
    }
  } catch (error) {
    console.error('Error initializing Capacitor:', error);
  }
};

// Hook pour utiliser Capacitor dans les composants React
export const useCapacitorInit = () => {
  useEffect(() => {
    // Appeler la fonction d'initialisation
    initializeCapacitor().catch(err => {
      console.error('Failed to initialize Capacitor:', err);
    });
    
    // Add event listener for app resume (for refreshing data)
    const setupAppLifecycle = async () => {
      try {
        // Properly import the App plugin from @capacitor/app
        const capacitorApp = await import('@capacitor/app');
        
        capacitorApp.App.addListener('appStateChange', ({ isActive }) => {
          if (isActive) {
            console.log('App has become active, refreshing data...');
            // Here you would typically refresh your data
          }
        });
        
        return () => {
          capacitorApp.App.removeAllListeners();
        };
      } catch (error) {
        console.error('Error setting up app lifecycle hooks:', error);
      }
    };
    
    setupAppLifecycle();
  }, []);
};

// Helper function to detect if running in a mobile app environment
export const isMobileApp = async (): Promise<boolean> => {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor.isNativePlatform();
  } catch (error) {
    console.error('Error checking if running in mobile app:', error);
    return false;
  }
};

// Helper function to get platform (ios, android, web)
export const getPlatform = async (): Promise<string> => {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor.getPlatform();
  } catch (error) {
    console.error('Error getting platform:', error);
    return 'web';
  }
};
