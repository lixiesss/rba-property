
import { getI18n } from "@/lib/i18n/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireStaff } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getI18n();
  if (!hasSupabaseEnv()) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-panel">
          <p className="admin-kicker">{t("Setup required")}</p>
          <h1 className="mt-2 text-3xl font-semibold">{t("Connect Supabase")}</h1>
          <p className="mt-4 text-muted">{t("Configure the variables in")} <code>.env.local</code>{t(", then restart the development server.")}</p>
        </div>
      </main>
    );
  }
  const user = await requireStaff();
  return <AdminShell user={user}>{children}</AdminShell>;
}
