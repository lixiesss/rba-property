import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getOptionalStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const uuid = z.string().uuid();
const videoTypes = new Map([["video/mp4", "mp4"], ["video/webm", "webm"]]);
const editSchema = z.object({ videoId: uuid, title: z.string().trim().max(160), caption: z.string().trim().max(500) });

async function context(id: string) {
  if (!await getOptionalStaff()) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!uuid.safeParse(id).success) return { error: NextResponse.json({ error: "Invalid property ID" }, { status: 400 }) };
  const supabase = await createClient();
  const { data } = await supabase.from("properties").select("id").eq("id", id).single();
  if (!data) return { error: NextResponse.json({ error: "Property not found" }, { status: 404 }) };
  return { supabase };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await context(id);
  if (ctx.error) return ctx.error;
  const supabase = ctx.supabase!;
  const body = await request.formData();
  const file = body.get("file");
  if (!(file instanceof File) || !videoTypes.has(file.type) || file.size <= 0 || file.size > 50 * 1024 * 1024)
    return NextResponse.json({ error: "Choose an MP4 or WebM video up to 50 MB" }, { status: 400 });
  const storagePath = `${id}/videos/${crypto.randomUUID()}.${videoTypes.get(file.type)}`;
  const { error: uploadError } = await supabase.storage.from("property-media").upload(storagePath, file, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });
  const { data: last } = await supabase.from("property_videos").select("sort_order").eq("property_id", id).order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const { error } = await supabase.from("property_videos").insert({ property_id: id, storage_path: storagePath, title: file.name.slice(0,160), sort_order: (last?.sort_order ?? -1) + 1 });
  if (error) {
    const { error: cleanup } = await supabase.storage.from("property-media").remove([storagePath]);
    return NextResponse.json({ error: error.message + (cleanup ? ` Storage cleanup failed for ${storagePath}: ${cleanup.message}` : "") }, { status: 500 });
  }
  refresh(id);
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await context(id);
  if (ctx.error) return ctx.error;
  const body = await request.json().catch(() => null);
  const order = z.object({ order: z.array(uuid).max(100) }).safeParse(body);
  if (order.success) {
    const { error } = await ctx.supabase!.rpc("reorder_property_videos", { property_id: id, video_ids: order.data.order });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else {
    const edit = editSchema.safeParse(body);
    if (!edit.success) return NextResponse.json({ error: "Invalid video details" }, { status: 400 });
    const { data, error } = await ctx.supabase!.from("property_videos").update({ title: edit.data.title || null, caption: edit.data.caption || null }).eq("id", edit.data.videoId).eq("property_id", id).select("id").single();
    if (error || !data) return NextResponse.json({ error: error?.message || "Video not found" }, { status: 400 });
  }
  refresh(id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await context(id);
  if (ctx.error) return ctx.error;
  const parsed = z.object({ videoId: uuid }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
  const supabase = ctx.supabase!;
  const { data: video } = await supabase.from("property_videos").select("*").eq("id", parsed.data.videoId).eq("property_id", id).single();
  if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });
  const { error: deletionError } = await supabase.from("property_videos").delete().eq("id", video.id).eq("property_id", id);
  if (deletionError) return NextResponse.json({ error: deletionError.message }, { status: 500 });
  const { error: storageError } = await supabase.storage.from("property-media").remove([video.storage_path]);
  if (storageError) {
    const { error: restoreError } = await supabase.from("property_videos").insert(video);
    refresh(id);
    return NextResponse.json({ error: `Storage deletion failed: ${storageError.message}. ${restoreError ? "Record restoration failed; clean up " + video.storage_path : "Video record restored; try again."}` }, { status: 500 });
  }
  refresh(id);
  return NextResponse.json({ ok: true });
}

function refresh(id: string) {
  revalidateTag("properties", "max");
  revalidatePath(`/admin/properties/${id}/edit`);
  revalidatePath("/properties");
  revalidatePath("/");
}
