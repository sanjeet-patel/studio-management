"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getTenants(search?: string, status?: string): Promise<Array<Record<string, any>>> {
  const supabase = createAdminClient();
  let q = supabase
    .from("tenants")
    .select("*, subscriptions(id,plan,status,ends_at)")
    .order("created_at", { ascending: false }) as any;
  if (search) q = q.ilike("name", `%${search}%`);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data as any[]) ?? [];
}

export async function getTenant(id: string): Promise<{ tenant: Record<string, any>; stats: { orders: number; customers: number } }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("*, subscriptions(*), users(id,name,email,role)")
    .eq("id", id)
    .single();
  if (error) throw error;

  const [ordersRes, custRes] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("tenant_id", id),
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("tenant_id", id),
  ]);

  return {
    tenant: data as any,
    stats: { orders: ordersRes.count ?? 0, customers: custRes.count ?? 0 },
  };
}

export async function createTenant(formData: FormData) {
  const supabase = createAdminClient();
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const ownerName = formData.get("owner_name") as string;
  const ownerEmail = formData.get("owner_email") as string;
  const ownerPassword = formData.get("owner_password") as string;

  // Create tenant
  const { data: rawTenant, error: tenantErr } = await supabase
    .from("tenants")
    .insert({
      name,
      slug,
      status: "TRIAL",
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      invoice_prefix: slug.slice(0, 3).toUpperCase() + "-INV",
      order_prefix: slug.slice(0, 3).toUpperCase() + "-ORD",
    } as any)
    .select()
    .single();
  if (tenantErr) throw tenantErr;
  const tenant = rawTenant as any;

  // Create auth user
  const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
    email: ownerEmail,
    password: ownerPassword,
    email_confirm: true,
  });
  if (authErr) throw authErr;

  // Create user profile
  const { error: profileErr } = await supabase.from("users").insert({
    id: authUser.user.id,
    tenant_id: tenant.id,
    name: ownerName,
    email: ownerEmail,
    role: "studio",
  } as any);
  if (profileErr) throw profileErr;

  revalidatePath("/admin/tenants");
  return { tenantId: tenant.id };
}

export async function updateTenantStatus(id: string, status: string) {
  const supabase = createAdminClient();
  await (supabase.from("tenants") as any).update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath(`/admin/tenants/${id}`);
  revalidatePath("/admin/tenants");
}

export async function updateTenant(id: string, formData: FormData) {
  const supabase = createAdminClient();
  await (supabase.from("tenants") as any)
    .update({
      name: formData.get("name") as string,
      status: formData.get("status") as string,
      trial_ends_at: (formData.get("trial_ends_at") as string) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath(`/admin/tenants/${id}`);
  revalidatePath("/admin/tenants");
}

export async function deleteTenant(id: string) {
  const supabase = createAdminClient();
  await (supabase.from("tenants") as any).delete().eq("id", id);
  revalidatePath("/admin/tenants");
}

export async function getAdminStats() {
  const supabase = createAdminClient();
  const [tenants, subs, orders] = await Promise.all([
    (supabase.from("tenants") as any).select("id,status"),
    (supabase.from("subscriptions") as any).select("id,status,amount"),
    (supabase.from("orders") as any).select("id,grand_total"),
  ]);
  return {
    totalTenants: (tenants.data as any[])?.length ?? 0,
    activeTenants: (tenants.data as any[])?.filter((t: any) => t.status === "ACTIVE").length ?? 0,
    trialTenants: (tenants.data as any[])?.filter((t: any) => t.status === "TRIAL").length ?? 0,
    totalRevenue: (subs.data as any[])?.reduce((s: number, x: any) => s + (x.amount ?? 0), 0) ?? 0,
    totalOrders: (orders.data as any[])?.length ?? 0,
  };
}

export async function createSubscription(formData: FormData) {
  const supabase = createAdminClient();
  await (supabase.from("subscriptions") as any).insert({
    tenant_id: formData.get("tenant_id") as string,
    plan: formData.get("plan") as string,
    starts_at: formData.get("starts_at") as string,
    ends_at: formData.get("ends_at") as string,
    amount: parseFloat(formData.get("amount") as string),
    status: "active",
  });
  revalidatePath("/admin/subscriptions");
}

export async function getAllSubscriptions(): Promise<Array<Record<string, any>>> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*, tenants(name,slug)")
    .order("created_at", { ascending: false });
  return (data as any[]) ?? [];
}
