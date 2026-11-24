"use client";

import React, { useContext, useEffect, useState } from "react";
import type { LandingContent, Locale } from "../types";

export type LandingContentMap = Record<Locale, LandingContent>;

interface LandingContextValue {
  locale: Locale;
  setLocale: React.Dispatch<React.SetStateAction<Locale>>;
  content: LandingContent;
  contentByLocale: LandingContentMap;
}

const LandingContext = React.createContext<LandingContextValue | null>(null);

function isLocale(value: unknown): value is Locale {
  return value === "ja" || value === "en";
}

export function LandingProvider({
  children,
  contentByLocale,
}: {
  children: React.ReactNode;
  contentByLocale: LandingContentMap;
}) {
  const [locale, setLocale] = useState<Locale>("ja");

  useEffect(() => {
    const stored = window.localStorage.getItem("mirai-locale");
    if (isLocale(stored)) {
      setLocale(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("mirai-locale", locale);
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LandingContext.Provider
      value={{ locale, setLocale, content: contentByLocale[locale], contentByLocale }}
    >
      {children}
    </LandingContext.Provider>
  );
}

export function useLanding(): LandingContextValue {
  const value = useContext(LandingContext);
  if (!value) {
    throw new Error("useLanding must be used within LandingProvider");
  }
  return value;
}
