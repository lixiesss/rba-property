"use client";
import { createContext, useContext, useMemo } from "react";
import { defaultLocale, localizedPath, type Locale } from "./config";
import { translator } from "./get-dictionary";

const LocaleContext = createContext<Locale>(defaultLocale);
export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}
export function useI18n() {
  const locale = useContext(LocaleContext);
  return useMemo(() => ({ locale, t: translator(locale), href: (path: string) => localizedPath(path, locale) }), [locale]);
}
