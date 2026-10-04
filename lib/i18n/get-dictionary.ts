import type { Locale } from "./config";
import { id } from "./messages/id";
import { en } from "./messages/en";
export type MessageKey = keyof typeof id;
export type Dictionary = Record<MessageKey, string>;
export function getDictionary(locale: Locale): Dictionary { return locale === "id" ? id : en; }
export function translator(locale: Locale) {
  const messages = getDictionary(locale);
  // Unknown values are editorial content (e.g. custom location/feature names).
  return (key: string): string => Object.hasOwn(messages, key) ? messages[key as MessageKey] : key;
}
