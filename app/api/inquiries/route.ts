import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { translator } from "@/lib/i18n/get-dictionary";

const inquirySchema = z.object({
  locale: z.enum(["id", "en"]).default("id"),
  propertyId: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180).or(z.literal("")),
  phone: z.string().trim().max(80),
  message: z.string().trim().min(10).max(3000),
  source: z.string().trim().max(80).default("property_detail"),
  website: z.string().max(0).optional(),
}).refine((value) => value.email || value.phone, { message: "Please provide an email address or phone number." });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = inquirySchema.safeParse(body);
  const t = translator(body?.locale === "en" ? "en" : "id");
  if (!parsed.success) return NextResponse.json({ error: t(parsed.error.issues[0]?.code === "custom" ? "Please provide an email address or phone number." : "Please check your name, contact details and message.") }, { status: 400 });
  const { propertyId, email, phone } = parsed.data;
  const supabase = await createClient();
  if (propertyId) {
    const { data: property } = await supabase.from("properties").select("id").eq("id", propertyId).eq("publication_status", "published").single();
    if (!property) return NextResponse.json({ error: t("Property not found") }, { status: 404 });
  }
  const { error } = await supabase.from("inquiries").insert({
    property_id: propertyId ?? null,
    name: parsed.data.name,
    email: email || null,
    phone: phone || null,
    message: parsed.data.message,
    source: parsed.data.source,
    status: "new",
    admin_notes: null,
  });
  if (error) return NextResponse.json({ error: t("Your inquiry could not be sent. Please try again.") }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
