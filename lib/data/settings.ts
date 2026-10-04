import "server-only";

import { unstable_cache } from "next/cache";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

export interface SiteSettings {
  companyEmail?: string;
  whatsapp?: string;
  phone?: string;
  officeAddress?: string;
  instagram?: string;
  linkedin?: string;
}

const fetchSettings = unstable_cache(async (): Promise<SiteSettings> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", true).single();
  if (error) throw new Error(`Unable to load site settings: ${error.message}`);
  return {
    companyEmail: data.company_email || undefined,
    whatsapp: data.whatsapp || undefined,
    phone: data.phone || undefined,
    officeAddress: data.office_address || undefined,
    instagram: data.instagram || undefined,
    linkedin: data.linkedin || undefined,
  };
}, ["site-settings"], { revalidate: 300, tags: ["site-settings"] });

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!hasSupabaseEnv()) {
    if (process.env.NODE_ENV === "development") return {};
    throw new Error("RBA site settings require Supabase environment variables in production.");
  }
  return fetchSettings();
}
