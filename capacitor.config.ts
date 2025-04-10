import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartm.app',
  appName: 'Smart-M',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
