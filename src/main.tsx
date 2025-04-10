
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Wait for the device to be ready before mounting the app when using Capacitor
// This function automatically handles both web and mobile environments
const mount = async () => {
  // Try to import Capacitor dynamically
  try {
    const { Capacitor } = await import('@capacitor/core');
    
    // Check if we're running on a native platform
    if (Capacitor.isNativePlatform()) {
      // Add event listener for deviceready only in native environment
      document.addEventListener('deviceready', () => {
        console.log('Device is ready');
        mountApp();
      }, false);
    } else {
      // On web, mount immediately
      mountApp();
    }
  } catch (error) {
    // If Capacitor import fails, we're definitely on web
    console.log('Running on web without Capacitor');
    mountApp();
  }
};

// Function to mount the React app
function mountApp() {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  } else {
    console.error('Root element not found');
  }
}

// Start the mounting process
mount();
