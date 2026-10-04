
import { getI18n } from "@/lib/i18n/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateProperty } from "@/app/admin/(protected)/actions";
import { MediaManager } from "@/components/admin/MediaManager";
import { VideoManager } from "@/components/admin/VideoManager";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { adminPropertyTitle } from "@/lib/i18n/property-content";

export default async function EditPropertyPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { t, locale } = await getI18n();
  if (!hasSupabaseEnv()) return null;
  const [{ id }, feedback] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const { data: property, error } = await supabase.from("properties").select("*, property_translations(*), property_images(*), property_offers(*), property_videos(*)").eq("id", id).single();
  if (error && error.code !== "PGRST116") throw new Error(error.message);
  if (!property) notFound();
  const images = (property.property_images ?? []).map((image: Record<string, unknown>) => ({
    id: String(image.id), storagePath: String(image.storage_path), altText: String(image.alt_text ?? ""), caption: image.caption ? String(image.caption) : "", sortOrder: Number(image.sort_order), isThumbnail: Boolean(image.is_thumbnail), src: supabase.storage.from("property-media").getPublicUrl(String(image.storage_path)).data.publicUrl,
  })).sort((a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder);
  const videos = (property.property_videos ?? []).map((video: Record<string,unknown>) => ({
    id:String(video.id),src:supabase.storage.from("property-media").getPublicUrl(String(video.storage_path)).data.publicUrl,
    title:String(video.title ?? ""),caption:String(video.caption ?? ""),sortOrder:Number(video.sort_order),
  })).sort((a:{sortOrder:number},b:{sortOrder:number})=>a.sortOrder-b.sortOrder);
  // Reset local media edits only when the persisted server snapshot changes.
  return <main className="admin-content"><div className="admin-page-header"><div><Link href="/admin/properties" className="admin-back">{t("Back to properties")}</Link><h1>{t("Edit property")}</h1><p>{t(adminPropertyTitle(property, locale))}</p></div></div><PropertyForm action={updateProperty.bind(null,id)} property={property} error={feedback.error} saved={feedback.saved} media={<div className="admin-field-full space-y-8"><div><h3 className="mb-4 text-sm font-semibold">{t("Photos")}</h3><MediaManager key={JSON.stringify([id, images])} propertyId={id} initialImages={images} /></div><div><h3 className="mb-4 text-sm font-semibold">{t("Videos")}</h3><VideoManager key={JSON.stringify([id, videos])} propertyId={id} initialVideos={videos} /></div></div>} /></main>;
}
