"use client";

import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type UiLanguage = "es" | "en";

type UiLanguageContextValue = {
  uiLanguage: UiLanguage;
  setUiLanguage: (lang: UiLanguage) => void;
};

const UiLanguageContext = createContext<UiLanguageContextValue | undefined>(
  undefined
);

export function UiLanguageProvider({ children }: { children: ReactNode }) {
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>("es");

  return (
    <UiLanguageContext.Provider value={{ uiLanguage, setUiLanguage }}>
      {children}
    </UiLanguageContext.Provider>
  );
}

export function useUiLanguage() {
  const ctx = useContext(UiLanguageContext);
  if (!ctx) {
    throw new Error("useUiLanguage must be used within UiLanguageProvider");
  }
  return ctx;
}
