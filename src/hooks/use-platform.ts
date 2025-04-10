
import { useEffect, useState } from 'react';

export type Platform = 'ios' | 'android' | 'web';

export function usePlatform() {
  const [platform, setPlatform] = useState<Platform>('web');

  useEffect(() => {
    const detectPlatform = async () => {
      try {
        // Dynamically import Capacitor only when needed
        const { Capacitor } = await import('@capacitor/core');
        
        if (Capacitor.isNativePlatform()) {
          if (Capacitor.getPlatform() === 'ios') {
            setPlatform('ios');
          } else if (Capacitor.getPlatform() === 'android') {
            setPlatform('android');
          }
        }
      } catch (error) {
        console.error('Error detecting platform:', error);
        // Default to web if there's an error
        setPlatform('web');
      }
    };

    detectPlatform();
  }, []);

  return platform;
}

// Helper functions
export function isNative(platform: Platform): boolean {
  return platform === 'ios' || platform === 'android';
}

export function isIOS(platform: Platform): boolean {
  return platform === 'ios';
}

export function isAndroid(platform: Platform): boolean {
  return platform === 'android';
}
