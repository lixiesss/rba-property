import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getOptionalStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  altText: z.string().trim().max(240).optional(),
  caption: z.string().trim().max(500).nullable().optional(),
  isThumbnail: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; imageId: string }> }) {
  const user = await getOptionalStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: propertyId, imageId } = await params;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid image details" }, { status: 400 });
  const update: Record<string, unknown> = {};
  if (parsed.data.altText !== undefined) update.alt_text = parsed.data.altText;
  if (parsed.data.caption !== undefined) update.caption = parsed.data.caption || null;
  if (parsed.data.isThumbnail !== undefined) update.is_thumbnail = parsed.data.isThumbnail;
  const supabase = await createClient();
  const { data, error } = await supabase.from("property_images").update(update).eq("id", imageId).eq("property_id", propertyId).select("id").single();
  if (error || !data) return NextResponse.json({ error: error?.message ?? "Image not found" }, { status: error ? 500 : 404 });
  refresh(propertyId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; imageId: string }> }) {
  const user = await getOptionalStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: propertyId, imageId } = await params;
  const supabase = await createClient();
  const { data: image } = await supabase.from("property_images").select("storage_path").eq("id", imageId).eq("property_id", propertyId).single();
  if (!image) return NextResponse.json({ error: "Image not found" }, { status: 404 });

  const { error: databaseError } = await supabase.from("property_images").delete().eq("id", imageId).eq("property_id", propertyId);
  if (databaseError) return NextResponse.json({ error: databaseError.message }, { status: 500 });
  const { error: storageError } = await supabase.storage.from("property-media").remove([image.storage_path]);
  refresh(propertyId);
  if (storageError) return NextResponse.json({ error: `Image record removed; storage cleanup failed: ${storageError.message}` }, { status: 500 });
  return NextResponse.json({ ok: true });
}

function refresh(propertyId: string) {
  revalidateTag("properties", "max");
  revalidatePath(`/admin/properties/${propertyId}/edit`);
  revalidatePath("/properties");
  revalidatePath("/");
}
