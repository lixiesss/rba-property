"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { adminLocaleCookie, localeCookie, localizedPath, locales, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";

export function LanguageSwitcher({ admin = false }: { admin?: boolean }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  function remember(next: Locale) {
    // Browser preference persistence is an intentional event-handler side effect.
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `${admin ? adminLocaleCookie : localeCookie}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    if (admin) router.refresh();
  }
  const query = search.toString();
  return <nav aria-label={t(admin ? "Admin language" : "Language")} className="flex shrink-0 items-center gap-1 text-xs font-semibold">
    {locales.map(next => admin ? <button key={next} type="button" onClick={() => remember(next)} aria-pressed={locale === next} className={`min-h-11 min-w-8 ${locale === next ? "underline underline-offset-4" : "opacity-65"}`}>{next.toUpperCase()}</button> : <a key={next} href={`${localizedPath(pathname, next)}${query ? `?${query}` : ""}`} hrefLang={next} lang={next} aria-current={locale === next ? "true" : undefined} onClick={event => {
      remember(next);
      if (location.hash) {
        event.preventDefault();
        // A full locale navigation refreshes document language and root-layout copy too.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        location.assign(`${localizedPath(pathname, next)}${query ? `?${query}` : ""}${location.hash}`);
      }
    }} className={`flex min-h-11 min-w-8 items-center justify-center ${locale === next ? "underline underline-offset-4" : "opacity-65"}`}>{next.toUpperCase()}</a>)}
  </nav>;
}
