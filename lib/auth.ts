import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type StaffRole = "admin" | "editor";

export interface StaffUser {
  id: string;
  email: string;
  fullName: string;
  role: StaffRole;
}

export async function requireStaff(): Promise<StaffUser> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "editor"].includes(profile.role)) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=Your+account+does+not+have+CMS+access");
  }

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile.full_name || user.email || "RBA team",
    role: profile.role as StaffRole,
  };
}

export async function getOptionalStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "editor"].includes(profile.role)) return null;
  return { id: user.id, role: profile.role as StaffRole };
}
