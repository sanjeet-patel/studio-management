"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getTenantId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");
  const { data } = await (supabase.from("users") as any).select("tenant_id").eq("id", user.id).single();
  if (!data?.tenant_id) throw new Error("No tenant");
  return { supabase, tenantId: data.tenant_id as string };
}

// ── Sizes ─────────────────────────────────────────────────────────────────────
export async function getSizes(): Promise<any[]> {
  const { supabase, tenantId } = await getTenantId();
  const { data } = await (supabase.from("sizes") as any).select("*").eq("tenant_id", tenantId).order("sort_order");
  return (data as any[]) ?? [];
}
export async function createSize(formData: FormData) {
  const { supabase, tenantId } = await getTenantId();
  await (supabase.from("sizes") as any).insert({ tenant_id: tenantId, name: formData.get("name") as string, sort_order: parseInt(formData.get("sort_order") as string) || 0 });
  revalidatePath("/studio/catalog/sizes");
}
export async function updateSize(id: string, formData: FormData) {
  const { supabase } = await getTenantId();
  await (supabase.from("sizes") as any).update({ name: formData.get("name") as string, sort_order: parseInt(formData.get("sort_order") as string) || 0 }).eq("id", id);
  revalidatePath("/studio/catalog/sizes");
}
export async function deleteSize(id: string) {
  const { supabase } = await getTenantId();
  await (supabase.from("sizes") as any).delete().eq("id", id);
  revalidatePath("/studio/catalog/sizes");
}

// ── Paper Types ───────────────────────────────────────────────────────────────
export async function getPaperTypes(): Promise<any[]> {
  const { supabase, tenantId } = await getTenantId();
  const { data } = await (supabase.from("paper_types") as any).select("*").eq("tenant_id", tenantId).order("sort_order");
  return (data as any[]) ?? [];
}
export async function createPaperType(formData: FormData) {
  const { supabase, tenantId } = await getTenantId();
  await (supabase.from("paper_types") as any).insert({ tenant_id: tenantId, name: formData.get("name") as string, supports_velvet: formData.get("supports_velvet") === "true", sort_order: parseInt(formData.get("sort_order") as string) || 0 });
  revalidatePath("/studio/catalog/paper-types");
}
export async function updatePaperType(id: string, formData: FormData) {
  const { supabase } = await getTenantId();
  await (supabase.from("paper_types") as any).update({ name: formData.get("name") as string, supports_velvet: formData.get("supports_velvet") === "true", sort_order: parseInt(formData.get("sort_order") as string) || 0 }).eq("id", id);
  revalidatePath("/studio/catalog/paper-types");
}
export async function deletePaperType(id: string) {
  const { supabase } = await getTenantId();
  await (supabase.from("paper_types") as any).delete().eq("id", id);
  revalidatePath("/studio/catalog/paper-types");
}

// ── Cover Types ───────────────────────────────────────────────────────────────
export async function getCoverTypes(): Promise<any[]> {
  const { supabase, tenantId } = await getTenantId();
  const { data } = await (supabase.from("cover_types") as any).select("*").eq("tenant_id", tenantId).order("sort_order");
  return (data as any[]) ?? [];
}
export async function createCoverType(formData: FormData) {
  const { supabase, tenantId } = await getTenantId();
  await (supabase.from("cover_types") as any).insert({ tenant_id: tenantId, name: formData.get("name") as string, sort_order: parseInt(formData.get("sort_order") as string) || 0 });
  revalidatePath("/studio/catalog/cover-types");
}
export async function deleteCoverType(id: string) {
  const { supabase } = await getTenantId();
  await (supabase.from("cover_types") as any).delete().eq("id", id);
  revalidatePath("/studio/catalog/cover-types");
}

// ── Accessories ───────────────────────────────────────────────────────────────
export async function getAccessories(): Promise<any[]> {
  const { supabase, tenantId } = await getTenantId();
  const { data } = await (supabase.from("accessories") as any).select("*").eq("tenant_id", tenantId).order("sort_order");
  return (data as any[]) ?? [];
}
export async function createAccessory(formData: FormData) {
  const { supabase, tenantId } = await getTenantId();
  await (supabase.from("accessories") as any).insert({ tenant_id: tenantId, name: formData.get("name") as string, default_price: parseFloat(formData.get("default_price") as string) || 0, allow_price_override: formData.get("allow_price_override") === "true", sort_order: parseInt(formData.get("sort_order") as string) || 0 });
  revalidatePath("/studio/catalog/accessories");
}
export async function updateAccessory(id: string, formData: FormData) {
  const { supabase } = await getTenantId();
  await (supabase.from("accessories") as any).update({ name: formData.get("name") as string, default_price: parseFloat(formData.get("default_price") as string) || 0, allow_price_override: formData.get("allow_price_override") === "true" }).eq("id", id);
  revalidatePath("/studio/catalog/accessories");
}
export async function deleteAccessory(id: string) {
  const { supabase } = await getTenantId();
  await (supabase.from("accessories") as any).delete().eq("id", id);
  revalidatePath("/studio/catalog/accessories");
}

// ── Photo Pricing ─────────────────────────────────────────────────────────────
export async function getPhotoPricingMatrix(): Promise<{ pricing: any[]; sizes: any[]; papers: any[]; velvetRate: number; velvetRateId?: string }> {
  const { supabase, tenantId } = await getTenantId();
  const [pp, sizes, papers, vr] = await Promise.all([
    (supabase.from("photo_pricing") as any).select("*").eq("tenant_id", tenantId),
    (supabase.from("sizes") as any).select("*").eq("tenant_id", tenantId).order("sort_order"),
    (supabase.from("paper_types") as any).select("*").eq("tenant_id", tenantId).order("sort_order"),
    (supabase.from("velvet_rates") as any).select("*").eq("tenant_id", tenantId).single(),
  ]);
  return { pricing: (pp.data as any[]) ?? [], sizes: (sizes.data as any[]) ?? [], papers: (papers.data as any[]) ?? [], velvetRate: (vr.data as any)?.rate ?? 10, velvetRateId: (vr.data as any)?.id };
}
export async function upsertPhotoPrice(formData: FormData) {
  const { supabase, tenantId } = await getTenantId();
  await (supabase.from("photo_pricing") as any).upsert({
    tenant_id: tenantId,
    size_id: formData.get("size_id") as string,
    paper_type_id: formData.get("paper_type_id") as string,
    service_mode: formData.get("service_mode") as string,
    base_price: parseFloat(formData.get("base_price") as string) || 0,
  }, { onConflict: "tenant_id,size_id,paper_type_id,service_mode" });
  revalidatePath("/studio/catalog/photo-pricing");
}
export async function updateVelvetRate(formData: FormData) {
  const { supabase, tenantId } = await getTenantId();
  const id = formData.get("id") as string;
  if (id) {
    await (supabase.from("velvet_rates") as any).update({ rate: parseFloat(formData.get("rate") as string) || 10 }).eq("id", id);
  } else {
    await (supabase.from("velvet_rates") as any).insert({ tenant_id: tenantId, rate: parseFloat(formData.get("rate") as string) || 10 });
  }
  revalidatePath("/studio/catalog/photo-pricing");
}

// ── Cover Pricing ─────────────────────────────────────────────────────────────
export async function getCoverPricingMatrix(): Promise<{ pricing: any[]; sizes: any[]; coverTypes: any[] }> {
  const { supabase, tenantId } = await getTenantId();
  const [cp, sizes, covers] = await Promise.all([
    (supabase.from("cover_pricing") as any).select("*").eq("tenant_id", tenantId),
    (supabase.from("sizes") as any).select("*").eq("tenant_id", tenantId).order("sort_order"),
    (supabase.from("cover_types") as any).select("*").eq("tenant_id", tenantId).order("sort_order"),
  ]);
  return { pricing: (cp.data as any[]) ?? [], sizes: (sizes.data as any[]) ?? [], coverTypes: (covers.data as any[]) ?? [] };
}
export async function upsertCoverPrice(formData: FormData) {
  const { supabase, tenantId } = await getTenantId();
  await (supabase.from("cover_pricing") as any).upsert({
    tenant_id: tenantId,
    size_id: formData.get("size_id") as string,
    cover_type_id: formData.get("cover_type_id") as string,
    service_mode: formData.get("service_mode") as string,
    price: parseFloat(formData.get("price") as string) || 0,
  }, { onConflict: "tenant_id,size_id,cover_type_id,service_mode" });
  revalidatePath("/studio/catalog/cover-pricing");
}
