
import React, { createContext, useContext, useEffect, useState } from 'react';

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (fr: string, en: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('language') || 'fr';
  });

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // Force reload to ensure all components update
    window.location.reload();
  };

  // Simple translation function
  const t = (fr: string, en: string) => {
    return language === 'fr' ? fr : en;
  };

  useEffect(() => {
    // Update language if it changes in localStorage from another tab
    const handleStorageChange = () => {
      const storedLanguage = localStorage.getItem('language');
      if (storedLanguage && storedLanguage !== language) {
        setLanguageState(storedLanguage);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
