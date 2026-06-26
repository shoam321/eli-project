"use client";

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

import { translations, type Lang, type TranslationKey } from "@/lib/translations";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ilab-lang");
      if (saved === "en" || saved === "he") return saved;
    }
    return "en";
  });

  function setLang(next: Lang) {
    setLangState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("ilab-lang", next);
    }
  }

  const isRTL = lang === "he";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [lang, isRTL]);

  function t(key: TranslationKey): string {
    return translations[lang][key];
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
