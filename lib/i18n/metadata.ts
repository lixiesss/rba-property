import type { Metadata } from "next";
import { locales, localizedPath, type Locale } from "./config";
export function localeMetadata(locale: Locale, path: string, title: string, description?: string, available: readonly Locale[] = locales): Metadata {
  return {
    title: title === "RBA Property" ? title : `${title} | RBA Property`, description,
    alternates: { canonical: localizedPath(path, locale), languages: Object.fromEntries(available.map(value => [value, localizedPath(path, value)])) },
    openGraph: { title, description, locale: locale === "id" ? "id_ID" : "en_US", url: localizedPath(path, locale) },
  };
}
