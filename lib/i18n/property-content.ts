import { type Locale, type PropertyTranslation } from "./config";

const contentFields = ["title", "short_description", "description", "meta_title", "meta_description"] as const;
function nonblank(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function localizedContent(translations: PropertyTranslation[], locale: Locale, legacy: Record<string, unknown> = {}): PropertyTranslation {
  const requested = translations.find(value => value.locale === locale);
  const otherLocale = locale === "id" ? "en" : "id";
  const other = translations.find(value => value.locale === otherLocale);
  const fields = Object.fromEntries(contentFields.map(field => {
    const value = [requested?.[field], other?.[field], legacy[field]].find(nonblank);
    return [field, value ?? ""];
  })) as Omit<PropertyTranslation, "locale">;
  // Content origin informs SEO only; it never changes the interface or public visibility.
  const editorial = contentFields.slice(0, 3);
  const contentLocale = editorial.some(field => nonblank(requested?.[field])) ? locale
    : editorial.some(field => nonblank(other?.[field])) ? otherLocale : locale;
  return { locale: contentLocale, ...fields };
}

// Staff titles identify drafts independently of publication status.
export function adminPropertyTitle(property: { property_translations?: PropertyTranslation[] }, locale: Locale): string {
  const translations = property.property_translations ?? [];
  return translations.find(value => value.locale === locale)?.title.trim() || translations.find(value => value.title.trim())?.title || "Untitled property";
}
