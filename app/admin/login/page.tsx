
import { getI18n } from "@/lib/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";
import { login } from "@/app/admin/login/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export const metadata: Metadata = { title: "Admin sign in | RBA Property" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { t, href } = await getI18n();
  const { error, next } = await searchParams;
  const configured = hasSupabaseEnv();

  return (
    <main className="admin-login-page">
      <div className="admin-login-panel">
        <Link href={href("/")} className="admin-brand">RBA PROPERTY</Link>
        <LanguageSwitcher admin />
        <div className="mt-10">
          <p className="admin-kicker">{t("Property management")}</p>
          <h1 className="mt-2 text-3xl font-semibold text-espresso">{t("Sign in to the CMS")}</h1>
          <p className="mt-3 text-sm text-muted">{t("Use an authorized RBA admin or editor account.")}</p>
        </div>
        {!configured ? (
          <div className="admin-alert mt-8" role="alert">
            {t("Supabase is not configured. Add the two variables from")} <code>.env.example</code> {t("to")} <code>.env.local</code>.
          </div>
        ) : (
          <form action={login} className="mt-8 space-y-5">
            {error ? <p className="admin-alert" role="alert">{t(error)}</p> : null}
            <input type="hidden" name="next" value={next ?? ""} />
            <label className="admin-field">
              <span>{t("Email")}</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label className="admin-field">
              <span>{t("Password")}</span>
              <input name="password" type="password" autoComplete="current-password" minLength={8} required />
            </label>
            <button className="admin-button w-full" type="submit">{t("Sign in")}</button>
          </form>
        )}
      </div>
    </main>
  );
}
