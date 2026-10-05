"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { parseLocalizedPropertyForm } from "@/lib/validation/property";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

function formError(parsed: ReturnType<typeof parseLocalizedPropertyForm>) {
  if (parsed.success) return "";
  return parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
}

function refreshPropertyViews() {
  revalidateTag("properties", "max");
  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath("/[locale]", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/properties");
}

export async function createProperty(formData: FormData) {
  const user = await requireStaff();
  const parsed = parseLocalizedPropertyForm(formData);
  if (!parsed.success) redirect(`/admin/properties/new?error=${encodeURIComponent(formError(parsed))}`);

  const supabase = await createClient();
  const { offers, translations, ...property } = parsed.data;
  const { data, error } = await supabase.rpc("save_localized_property_inventory", {
    property_id: null,
    property_payload: { ...property, publication_status: "draft", published_at: null, created_by: user.id, updated_by: user.id },
    offers_payload: offers,
    translations_payload: translations,
  });

  if (error) redirect(`/admin/properties/new?error=${encodeURIComponent(error.message)}`);
  refreshPropertyViews();
  redirect(`/admin/properties/${data}/edit?saved=Property+created+as+draft`);
}

export async function updateProperty(id: string, formData: FormData) {
  const user = await requireStaff();
  const parsed = parseLocalizedPropertyForm(formData);
  if (!parsed.success) redirect(`/admin/properties/${id}/edit?error=${encodeURIComponent(formError(parsed))}`);

  const intent = String(formData.get("intent") ?? "save");
  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase
    .from("properties")
    .select("publication_status, published_at")
    .eq("id", id)
    .single();
  if (currentError) redirect(`/admin/properties/${id}/edit?error=${encodeURIComponent(currentError.message)}`);

  let publicationStatus = current.publication_status;
  if (intent === "publish") publicationStatus = "published";
  if (intent === "draft") publicationStatus = "draft";
  if (intent === "archive") publicationStatus = "archived";

  if (publicationStatus === "published") {
    if (!parsed.data.location) redirect(`/admin/properties/${id}/edit?error=${encodeURIComponent("Location is required before publishing this property.")}`);
    if (!parsed.data.offers.length) redirect(`/admin/properties/${id}/edit?error=At+least+one+offer+is+required+before+publishing`);
    const { count } = await supabase
      .from("property_images")
      .select("id", { count: "exact", head: true })
      .eq("property_id", id)
      .eq("is_thumbnail", true);
    if (!count) redirect(`/admin/properties/${id}/edit?error=${encodeURIComponent("A thumbnail image is required before publishing")}`);
  }

  const { offers, translations, ...property } = parsed.data;
  const { error } = await supabase.rpc("save_localized_property_inventory", {
    property_id: id,
    property_payload: {
      ...property,
      publication_status: publicationStatus,
      published_at: publicationStatus === "published" ? (current.published_at ?? new Date().toISOString()) : null,
      updated_by: user.id,
    },
    offers_payload: offers,
    translations_payload: translations,
  });

  if (error) redirect(`/admin/properties/${id}/edit?error=${encodeURIComponent(error.message)}`);
  refreshPropertyViews();
  revalidatePath(`/admin/properties/${id}/edit`);
  redirect(`/admin/properties/${id}/edit?saved=${encodeURIComponent(intent === "publish" ? "Property published" : intent === "archive" ? "Property archived" : "Changes saved")}`);
}

export async function setPropertyPublication(id: string, status: "draft" | "published" | "archived") {
  const user = await requireStaff();
  const supabase = await createClient();
  if (status === "published") {
    const [{ data: property }, { count }, { count: offerCount }] = await Promise.all([
      supabase.from("properties").select("slug, location").eq("id", id).single(),
      supabase.from("property_images").select("id", { count: "exact", head: true }).eq("property_id", id).eq("is_thumbnail", true),
      supabase.from("property_offers").select("id", { count: "exact", head: true }).eq("property_id", id),
    ]);
    if (property && !property.location?.trim()) redirect(`/admin/properties/${id}/edit?error=${encodeURIComponent("Location is required before publishing this property.")}`);
    if (!property || !property.slug || !offerCount || !count) {
      redirect(`/admin/properties/${id}/edit?error=${encodeURIComponent("Complete required fields and add an offer and thumbnail before publishing")}`);
    }
  }
  const { error } = await supabase.from("properties").update({
    publication_status: status,
    published_at: status === "published" ? new Date().toISOString() : null,
    updated_by: user.id,
  }).eq("id", id);
  if (error) redirect(`/admin/properties?error=${encodeURIComponent(errorMessage(error))}`);
  refreshPropertyViews();
  redirect("/admin/properties");
}

export async function updateInquiry(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "new");
  const notes = String(formData.get("admin_notes") ?? "").trim();
  if (!id || !["new", "contacted", "qualified", "closed", "spam"].includes(status)) {
    redirect("/admin/inquiries?error=Invalid+inquiry+update");
  }
  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").update({ status, admin_notes: notes || null }).eq("id", id);
  if (error) redirect(`/admin/inquiries?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  redirect("/admin/inquiries?saved=Inquiry+updated");
}

export async function updateSettings(formData: FormData) {
  const user = await requireStaff();
  const supabase = await createClient();
  const fields = ["company_email", "whatsapp", "phone", "office_address", "instagram", "linkedin"] as const;
  const values = Object.fromEntries(fields.map((field) => [field, String(formData.get(field) ?? "").trim() || null]));
  const { error } = await supabase.from("site_settings").update({ ...values, updated_by: user.id }).eq("id", true);
  if (error) redirect(`/admin/settings?error=${encodeURIComponent(error.message)}`);
  revalidateTag("site-settings", "max");
  revalidatePath("/");
  revalidatePath("/[locale]", "layout");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=Settings+updated");
}
