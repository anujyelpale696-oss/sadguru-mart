import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, translations } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('sadguru_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('sadguru_lang', currentLang);
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  const t = (key) => {
    if (!translations[currentLang]) {
      return translations['en'][key] || key;
    }
    return translations[currentLang][key] || translations['en'][key] || key;
  };

  const changeLanguage = (code) => {
    if (translations[code]) {
      setCurrentLang(code);
    }
  };

  const currentLanguageObj =
    LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language: currentLang,
        currentLanguageObj,
        languages: LANGUAGES,
        changeLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
