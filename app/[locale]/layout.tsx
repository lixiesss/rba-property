import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { LocaleProvider } from "@/lib/i18n/client";
export default async function PublicLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const locale = (await params).locale;
  if (!isLocale(locale)) notFound();
  return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
}
