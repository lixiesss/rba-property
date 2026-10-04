import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { defaultLocale, isLocale, localizedPath } from "./config";
import { getDictionary, translator } from "./get-dictionary";

// Resolve request state outside persistent data caches.
export const getI18n = cache(async () => {
  const value = (await headers()).get("x-rba-locale");
  const locale = isLocale(value) ? value : defaultLocale;
  return { locale, t: translator(locale), messages: getDictionary(locale), href: (path: string) => localizedPath(path, locale) };
});
