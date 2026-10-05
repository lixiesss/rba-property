import type { Locale } from "./i18n/config";
export const RBA_WHATSAPP_NUMBER = "6282139927129";
export const whatsappMessages: Record<Locale, string> = {
  id: "Halo RBA Property, saya tertarik mencari properti di Bali. Bisa bantu saya menemukan pilihan yang sesuai?",
  en: "Hi RBA Property, I'm interested in finding a property in Bali. Could you help me find a suitable option?",
};
export function getWhatsAppUrl(locale: Locale) {
  return `https://wa.me/${RBA_WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessages[locale])}`;
}
