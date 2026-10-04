
import { getI18n } from "@/lib/i18n/server";
import Link from "next/link";
import { createProperty } from "@/app/admin/(protected)/actions";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function NewPropertyPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { t } = await getI18n();
  if (!hasSupabaseEnv()) return null;
  const { error } = await searchParams;
  return <main className="admin-content"><div className="admin-page-header"><div><Link href="/admin/properties" className="admin-back">{t("Back to properties")}</Link><h1>{t("New property")}</h1></div></div><PropertyForm action={createProperty} isNew error={error} /></main>;
}
