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

export async function getDashboardStats() {
  const { supabase, tenantId } = await getTenantId();
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + "-01";

  const db = supabase as any;
  const [
    todayOrders, todayPayments, pendingOrders, outstandingOrders,
    monthlyRevenue, pendingBills, pendingCycles,
  ] = await Promise.all([
    db.from("orders").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("order_date", today),
    db.from("payments").select("amount").eq("tenant_id", tenantId).eq("payment_date", today),
    db.from("orders").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).not("order_status", "in", '("DELIVERED","CANCELLED")'),
    db.from("orders").select("grand_total,id").eq("tenant_id", tenantId).not("payment_status", "eq", "PAID"),
    db.from("payments").select("amount").eq("tenant_id", tenantId).gte("payment_date", monthStart),
    db.from("bill_instances").select("id,recurring_bills!inner(tenant_id)", { count: "exact", head: true }).eq("recurring_bills.tenant_id", tenantId).in("status", ["PENDING", "PARTIAL"]),
    db.from("salary_cycles").select("id,employees!inner(tenant_id)", { count: "exact", head: true }).eq("employees.tenant_id", tenantId).in("status", ["PENDING", "PARTIAL"]),
  ]);

  const totalOutstanding = (outstandingOrders.data as any[])?.reduce((s: number, o: any) => s + Number(o.grand_total), 0) ?? 0;
  const totalPaid = await db.from("payments").select("amount").eq("tenant_id", tenantId).in("order_id", ((outstandingOrders.data as any[]) ?? []).map((o: any) => o.id));
  const paidAmount = (totalPaid.data as any[])?.reduce((s: number, p: any) => s + Number(p.amount), 0) ?? 0;

  return {
    todays_orders: todayOrders.count ?? 0,
    todays_collection: (todayPayments.data as any[])?.reduce((s: number, p: any) => s + Number(p.amount), 0) ?? 0,
    pending_orders: pendingOrders.count ?? 0,
    outstanding_amount: Math.max(0, totalOutstanding - paidAmount),
    monthly_revenue: (monthlyRevenue.data as any[])?.reduce((s: number, p: any) => s + Number(p.amount), 0) ?? 0,
    pending_bills: pendingBills.count ?? 0,
    pending_salaries: pendingCycles.count ?? 0,
  };
}

export async function getCustomers(search?: string): Promise<any[]> {
  const { supabase, tenantId } = await getTenantId();
  const db = supabase as any;
  let q = db.from("customers").select("*").eq("tenant_id", tenantId).order("customer_name");
  if (search) q = q.ilike("customer_name", `%${search}%`);
  const { data } = await q;
  return (data as any[]) ?? [];
}

export async function getCustomer(id: string): Promise<any | null> {
  const { supabase } = await getTenantId();
  const { data } = await (supabase.from("customers") as any).select("*").eq("id", id).single();
  return data ?? null;
}

export async function createCustomer(formData: FormData) {
  const { supabase, tenantId } = await getTenantId();
  await (supabase.from("customers") as any).insert({
    tenant_id: tenantId,
    customer_name: formData.get("customer_name") as string,
    studio_name: (formData.get("studio_name") as string) || null,
    mobile: (formData.get("mobile") as string) || null,
    whatsapp: (formData.get("whatsapp") as string) || null,
    address: (formData.get("address") as string) || null,
    city: (formData.get("city") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });
  revalidatePath("/studio/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  const { supabase } = await getTenantId();
  await (supabase.from("customers") as any).update({
    customer_name: formData.get("customer_name") as string,
    studio_name: (formData.get("studio_name") as string) || null,
    mobile: (formData.get("mobile") as string) || null,
    whatsapp: (formData.get("whatsapp") as string) || null,
    address: (formData.get("address") as string) || null,
    city: (formData.get("city") as string) || null,
    notes: (formData.get("notes") as string) || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  revalidatePath("/studio/customers");
  revalidatePath(`/studio/customers/${id}`);
}

export async function deleteCustomer(id: string) {
  const { supabase } = await getTenantId();
  await (supabase.from("customers") as any).delete().eq("id", id);
  revalidatePath("/studio/customers");
}
