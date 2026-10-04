import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getOptionalStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const maxBytes = 12 * 1024 * 1024;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getOptionalStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: propertyId } = await params;
  const supabase = await createClient();
  const { data: property } = await supabase.from("properties").select("id, title").eq("id", propertyId).single();
  if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  const formData = await request.formData();
  const files = formData.getAll("files").filter((value): value is File => value instanceof File);
  if (!files.length) return NextResponse.json({ error: "Choose at least one image" }, { status: 400 });
  for (const file of files) {
    if (!allowedTypes.has(file.type)) return NextResponse.json({ error: `${file.name} is not a supported image` }, { status: 400 });
    if (file.size > maxBytes) return NextResponse.json({ error: `${file.name} exceeds 12 MB` }, { status: 400 });
  }

  const { data: last } = await supabase.from("property_images").select("sort_order").eq("property_id", propertyId).order("sort_order", { ascending: false }).limit(1).maybeSingle();
  let sortOrder = (last?.sort_order ?? -1) + 1;
  const created = [];

  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || file.type.split("/")[1] || "jpg";
    const storagePath = `${propertyId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("property-media").upload(storagePath, file, { contentType: file.type, upsert: false });
    if (uploadError) return NextResponse.json({ error: uploadError.message, created }, { status: 500 });

    const { data: image, error: insertError } = await supabase.from("property_images").insert({
      property_id: propertyId,
      storage_path: storagePath,
      alt_text: `${property.title} in Bali`,
      sort_order: sortOrder++,
      is_thumbnail: false,
    }).select("*").single();
    if (insertError) {
      await supabase.storage.from("property-media").remove([storagePath]);
      return NextResponse.json({ error: insertError.message, created }, { status: 500 });
    }
    created.push(image);
  }

  refresh(propertyId);
  return NextResponse.json({ images: created }, { status: 201 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getOptionalStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: propertyId } = await params;
  const body = await request.json().catch(() => null) as { order?: string[] } | null;
  if (!body?.order || !Array.isArray(body.order)) return NextResponse.json({ error: "Invalid image order" }, { status: 400 });
  const supabase = await createClient();
  const { data: images } = await supabase.from("property_images").select("id").eq("property_id", propertyId);
  const ownedIds = new Set((images ?? []).map((image) => image.id));
  if (body.order.length !== ownedIds.size || body.order.some((id) => !ownedIds.has(id))) return NextResponse.json({ error: "Image order does not match this property" }, { status: 400 });
  const results = await Promise.all(body.order.map((id, index) => supabase.from("property_images").update({ sort_order: index }).eq("id", id).eq("property_id", propertyId)));
  const failed = results.find((result) => result.error);
  if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 500 });
  refresh(propertyId);
  return NextResponse.json({ ok: true });
}

function refresh(propertyId: string) {
  revalidateTag("properties", "max");
  revalidatePath(`/admin/properties/${propertyId}/edit`);
  revalidatePath("/properties");
  revalidatePath("/");
}
