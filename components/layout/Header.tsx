
import { getI18n } from "@/lib/i18n/server";
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getWhatsAppUrl } from "@/lib/whatsapp";

const navItems = [
  { label: "Properties", href: "/properties" },
  { label: "Land", href: "/properties?type=land" },
  { label: "Villas", href: "/properties?type=villa" },
  { label: "About", href: "/#about" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
];

export async function Header({ theme = "overlay" }: { theme?: "overlay" | "light" }) {
  const { t, href, locale } = await getI18n();
  const light = theme === "light";
  return (
    <header className={`${light ? "relative border-b border-line bg-ivory text-ink" : "absolute inset-x-0 top-0 text-white"} z-30`}>
      <div className="page-shell flex h-18 items-center justify-between">
        <Link href={href("/")} className="flex min-h-11 items-center font-semibold tracking-[0.12em]" aria-label={t("RBA Property home")}>
          RBA PROPERTY
        </Link>
        <nav aria-label={t("Primary navigation")} className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <Link key={item.label} href={href(item.href)} className="text-sm font-medium transition-colors hover:text-white/70">
              {t(item.label)}
            </Link>
          ))}
          <a href={getWhatsAppUrl(locale)} target="_blank" rel="noopener noreferrer" className="button-light">{t("Get in Touch")} <span aria-hidden="true">→</span></a>
          <LanguageSwitcher />
        </nav>
        <div className="flex items-center gap-2 lg:hidden"><LanguageSwitcher /><details className="group relative">
          <summary className={`flex min-h-11 cursor-pointer items-center rounded-[9px] border px-4 text-sm font-medium ${light ? "border-line" : "border-white/50"}`}>{t("Menu")}</summary>
          <div className="fixed inset-x-0 top-16 z-40 border-t border-line bg-ivory px-5 py-7 text-ink shadow-[0_18px_45px_rgba(51,44,38,0.12)]">
            <nav aria-label={t("Mobile navigation")} className="grid gap-1">
              {navItems.map((item) => (
                <Link key={item.label} href={href(item.href)} className="flex min-h-12 items-center border-b border-line text-lg">{t(item.label)}</Link>
              ))}
              <a href={getWhatsAppUrl(locale)} target="_blank" rel="noopener noreferrer" className="button-primary mt-5">{t("Get in Touch")} <span aria-hidden="true">→</span></a>
            </nav>
          </div>
        </details></div>
      </div>
    </header>
  );
}
