
"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { getDictionary } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dictionary: Dictionary | null;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('en');
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale | null;
    if (savedLocale) {
      setLocale(savedLocale);
    }
  }, []);

  useEffect(() => {
    const fetchDictionary = async () => {
      const dict = await getDictionary(locale);
      setDictionary(dict);
    };
    fetchDictionary();
    localStorage.setItem('locale', locale);
  }, [locale]);
  
  const value = useMemo(() => ({ locale, setLocale, dictionary }), [locale, dictionary]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === null) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
