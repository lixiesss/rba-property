
import { getI18n } from "@/lib/i18n/server";
import { updateSettings } from "@/app/admin/(protected)/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { t } = await getI18n();
  if (!hasSupabaseEnv()) return null;
  const feedback = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", true).single();
  const fields = [["company_email", "Company email"], ["whatsapp", "WhatsApp"], ["phone", "Phone"], ["office_address", "Office address"], ["instagram", "Instagram URL"], ["linkedin", "LinkedIn URL"]] as const;
  return <main className="admin-content"><div className="admin-page-header"><div><p className="admin-kicker">{t("Business details")}</p><h1>{t("Site settings")}</h1></div></div>{feedback.error ? <p className="admin-alert">{feedback.error}</p> : null}{feedback.saved ? <p className="admin-success">{t(feedback.saved)}</p> : null}<form action={updateSettings} className="admin-panel max-w-3xl"><div className="admin-form-grid">{fields.map(([name, label]) => <label className={`admin-field ${name === "office_address" ? "admin-field-full" : ""}`} key={name}><span>{t(label)}</span><input name={name} defaultValue={data?.[name] ?? ""} /></label>)}</div><button className="admin-button mt-6">{t("Save settings")}</button></form></main>;
}
