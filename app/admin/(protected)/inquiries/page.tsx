
import { getI18n } from "@/lib/i18n/server";
import Link from "next/link";
import { updateInquiry } from "@/app/admin/(protected)/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { adminPropertyTitle } from "@/lib/i18n/property-content";

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { t, locale } = await getI18n();
  if (!hasSupabaseEnv()) return null;
  const query = await searchParams;
  const supabase = await createClient();
  let request = supabase.from("inquiries").select("*, properties(id, slug, property_translations(*))").order("created_at", { ascending: false });
  if (query.status) request = request.eq("status", query.status);
  if (query.q) request = request.or(`name.ilike.%${query.q}%,email.ilike.%${query.q}%,phone.ilike.%${query.q}%`);
  const { data, error } = await request;
  return <main className="admin-content"><div className="admin-page-header"><div><p className="admin-kicker">{t("Lead inbox")}</p><h1>{t("Inquiries")}</h1></div></div>
    {query.error || error ? <p className="admin-alert">{query.error || error?.message}</p> : null}{query.saved ? <p className="admin-success">{t(query.saved)}</p> : null}
    <form className="admin-filters"><input name="q" placeholder={t("Search contact")} aria-label={t("Search contact")} defaultValue={query.q} /><select name="status" aria-label={t("Inquiry status")} defaultValue={query.status}><option value="">{t("All statuses")}</option>{["new", "contacted", "qualified", "closed", "spam"].map(x => <option value={x} key={x}>{t(x)}</option>)}</select><button className="admin-button-secondary">{t("Filter")}</button></form>
    <div className="space-y-3">{data?.map((inquiry) => <details className="admin-inquiry" key={inquiry.id} open={query.open === inquiry.id}><summary><span><strong>{inquiry.name}</strong><small>{inquiry.email || inquiry.phone}</small></span><span><span className={`admin-status admin-status-${inquiry.status}`}>{t(inquiry.status)}</span><small>{new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", { dateStyle: "medium" }).format(new Date(inquiry.created_at))}</small></span></summary><div className="admin-inquiry-body"><p>{inquiry.message}</p>{inquiry.properties ? <Link href={`/admin/properties/${inquiry.properties.id}/edit`}>{t(adminPropertyTitle(inquiry.properties, locale))}</Link> : null}<form action={updateInquiry} className="mt-5 grid gap-4"><input type="hidden" name="id" value={inquiry.id} /><label className="admin-field"><span>{t("Status")}</span><select name="status" defaultValue={inquiry.status}>{["new", "contacted", "qualified", "closed", "spam"].map(x => <option value={x} key={x}>{t(x)}</option>)}</select></label><label className="admin-field"><span>{t("Admin notes")}</span><textarea name="admin_notes" defaultValue={inquiry.admin_notes ?? ""} rows={3} /></label><button className="admin-button justify-self-start">{t("Save inquiry")}</button></form></div></details>)}</div>
    {!data?.length ? <p className="admin-empty">{t("No inquiries found.")}</p> : null}
  </main>;
}
