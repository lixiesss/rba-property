
import { getI18n } from "@/lib/i18n/server";
import Link from "next/link";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { adminPropertyTitle } from "@/lib/i18n/property-content";

export default async function AdminDashboardPage() {
  const { t, locale } = await getI18n();
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const [published, drafts, available, activeOffers, sold, newInquiries, recentProperties, recentInquiries] = await Promise.all([
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("publication_status", "published"),
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("publication_status", "draft"),
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("availability_status", "available"),
    supabase.from("properties").select("id", { count: "exact", head: true }).in("availability_status", ["reserved", "under_offer"]),
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("availability_status", "sold"),
    supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("properties").select("id, property_translations(*), publication_status, updated_at").order("updated_at", { ascending: false }).limit(5),
    supabase.from("inquiries").select("id, name, status, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const metrics = [
    ["Published", published.count ?? 0], ["Drafts", drafts.count ?? 0],
    ["Available", available.count ?? 0], ["Reserved / offer", activeOffers.count ?? 0],
    ["Sold", sold.count ?? 0], ["New inquiries", newInquiries.count ?? 0],
  ];

  return (
    <main className="admin-content">
      <div className="admin-page-header"><div><p className="admin-kicker">{t("Overview")}</p><h1>{t("Dashboard")}</h1></div><Link href="/admin/properties/new" className="admin-button">{t("Add property")}</Link></div>
      <div className="admin-metrics">{metrics.map(([label, value]) => <div className="admin-metric" key={label}><p>{t(String(label))}</p><strong>{value}</strong></div>)}</div>
      <div className="admin-dashboard-grid">
        <section className="admin-panel"><div className="admin-panel-heading"><h2>{t("Recently updated")}</h2><Link href="/admin/properties">{t("View all")}</Link></div>
          <div className="admin-list">{recentProperties.data?.length ? recentProperties.data.map((item) => <Link href={`/admin/properties/${item.id}/edit`} key={item.id}><span>{t(adminPropertyTitle(item, locale))}</span><small>{t(item.publication_status)} · {formatDate(item.updated_at)}</small></Link>) : <p className="admin-empty">{t("No properties yet.")}</p>}</div>
        </section>
        <section className="admin-panel"><div className="admin-panel-heading"><h2>{t("Recent inquiries")}</h2><Link href="/admin/inquiries">{t("View all")}</Link></div>
          <div className="admin-list">{recentInquiries.data?.length ? recentInquiries.data.map((item) => <Link href={`/admin/inquiries?open=${item.id}`} key={item.id}><span>{item.name}</span><small>{t(item.status)} · {formatDate(item.created_at)}</small></Link>) : <p className="admin-empty">{t("No inquiries yet.")}</p>}</div>
        </section>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value));
}
