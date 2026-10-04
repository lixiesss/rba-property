export const locales = ["id", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "id";
export const localeCookie = "rba-locale";
export const adminLocaleCookie = "rba-admin-locale";
export function isLocale(value: unknown): value is Locale { return value === "id" || value === "en"; }
export function localizedPath(path: string, locale: Locale): string {
  if (!path.startsWith("/") || path.startsWith("//") || /^\/(admin|api|auth|_next)(\/|$)/.test(path)) return path;
  const unprefixed = path.replace(/^\/(id|en)(?=\/|\?|#|$)/, "");
  return `/${locale}${unprefixed === "/" ? "" : unprefixed}`;
}
export interface PropertyTranslation {
  locale: Locale;
  title: string;
  short_description: string;
  description: string;
  meta_title?: string | null;
  meta_description?: string | null;
}
export function translationReady(value: Partial<PropertyTranslation> | undefined | null): boolean {
  return Boolean(value && [value.title, value.short_description, value.description].every(text => typeof text === "string" && text.trim().length > 0));
}
