"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getStudioSettings(): Promise<any | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");
  const { data: profile } = await (supabase.from("users") as any).select("tenant_id").eq("id", user.id).single();
  const { data } = await (supabase.from("tenants") as any).select("*").eq("id", (profile as any)?.tenant_id).single();
  return data ?? null;
}

export async function updateStudioSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");
  const { data: profile } = await (supabase.from("users") as any).select("tenant_id").eq("id", user.id).single();
  await (supabase.from("tenants") as any).update({
    name: formData.get("name") as string,
    tagline: (formData.get("tagline") as string) || null,
    address: (formData.get("address") as string) || null,
    city: (formData.get("city") as string) || null,
    pin: (formData.get("pin") as string) || null,
    phone: (formData.get("phone") as string) || null,
    email: (formData.get("email") as string) || null,
    whatsapp: (formData.get("whatsapp") as string) || null,
    gst_number: (formData.get("gst_number") as string) || null,
    invoice_prefix: (formData.get("invoice_prefix") as string) || "INV",
    order_prefix: (formData.get("order_prefix") as string) || "ORD",
    updated_at: new Date().toISOString(),
  }).eq("id", (profile as any)?.tenant_id);
  revalidatePath("/studio/settings");
}
