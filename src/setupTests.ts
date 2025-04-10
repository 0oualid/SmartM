
// Fichier de configuration pour les tests
import '@testing-library/jest-dom';

// Explicitly declare global Jest functions and objects to ensure TypeScript recognizes them
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toBeChecked(): R;
      toBeDisabled(): R;
    }
  }
  
  // Declare global Jest functions
  const describe: (name: string, fn: () => void) => void;
  const test: (name: string, fn: () => Promise<void> | void, timeout?: number) => void;
  const expect: any;
  const beforeEach: (fn: () => void) => void;
  const afterEach: (fn: () => void) => void;
  const beforeAll: (fn: () => void) => void;
  const afterAll: (fn: () => void) => void;
  const it: (name: string, fn: () => Promise<void> | void, timeout?: number) => void;
  const jest: any;
}
