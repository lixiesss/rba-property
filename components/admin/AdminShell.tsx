
import { getI18n } from "@/lib/i18n/server";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import type { StaffUser } from "@/lib/auth";
import { logout } from "@/app/admin/(protected)/actions";

const navigation = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/settings", label: "Settings" },
];

export async function AdminShell({ user, children }: { user: StaffUser; children: React.ReactNode }) {
  const { t } = await getI18n();
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">RBA PROPERTY</Link>
        <nav aria-label={t("Admin navigation")} className="admin-nav">
          {navigation.map((item) => <Link key={item.href} href={item.href}>{t(item.label)}</Link>)}
        </nav>
        <div className="admin-user">
          <LanguageSwitcher admin />
          <p className="truncate text-sm font-medium">{user.fullName}</p>
          <p className="text-xs uppercase text-muted">{t(user.role)}</p>
          <form action={logout}><button type="submit" className="admin-text-button">{t("Sign out")}</button></form>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-mobile-header">
          <Link href="/admin" className="admin-brand">RBA</Link>
          <details className="relative">
            <summary className="admin-icon-button" aria-label={t("Open admin navigation")}>{t("Menu")}</summary>
            <nav className="admin-mobile-nav" aria-label={t("Mobile admin navigation")}>
              {navigation.map((item) => <Link key={item.href} href={item.href}>{t(item.label)}</Link>)}
              <LanguageSwitcher admin />
            </nav>
          </details>
        </header>
        {children}
      </div>
    </div>
  );
}
