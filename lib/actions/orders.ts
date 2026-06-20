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

export async function generateOrderNo(tenantId: string, supabase: any) {
  const { data: tenant } = await (supabase.from("tenants") as any).select("order_prefix").eq("id", tenantId).single();
  const prefix = (tenant as any)?.order_prefix ?? "ORD";
  const { count } = await (supabase.from("orders") as any).select("id", { count: "exact", head: true }).eq("tenant_id", tenantId);
  return `${prefix}-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

export async function getOrders(search?: string, status?: string): Promise<any[]> {
  const { supabase, tenantId } = await getTenantId();
  const db = supabase as any;
  let q = db
    .from("orders")
    .select("*, customers(customer_name, studio_name, mobile)")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });
  if (status) q = q.eq("order_status", status);
  const { data } = await q;
  let result: any[] = (data as any[]) ?? [];
  if (search) {
    result = result.filter((o: any) => {
      const c = o.customers as { customer_name: string } | null;
      return o.order_no.toLowerCase().includes(search.toLowerCase()) ||
        c?.customer_name.toLowerCase().includes(search.toLowerCase());
    });
  }
  return result;
}

export async function getOrder(id: string): Promise<any | null> {
  const { supabase } = await getTenantId();
  const { data } = await (supabase.from("orders") as any)
    .select(`*, customers(*), order_items(*, sizes(name), paper_types(name,supports_velvet), cover_types(name), accessories(name,default_price)), payments(*)`)
    .eq("id", id)
    .single();
  return data ?? null;
}

export async function createOrder(formData: FormData) {
  const { supabase, tenantId } = await getTenantId();
  const db = supabase as any;

  const orderNo = await generateOrderNo(tenantId, db);
  const rawItems = JSON.parse(formData.get("items") as string ?? "[]");

  const subtotal = rawItems.reduce((s: number, i: any) => s + Number(i.line_total), 0);
  const discount = parseFloat(formData.get("discount") as string ?? "0");
  const taxPct = parseFloat(formData.get("tax_percent") as string ?? "0");
  const grandTotal = (subtotal - discount) * (1 + taxPct / 100);

  const { data: order, error } = await db
    .from("orders")
    .insert({
      tenant_id: tenantId,
      order_no: orderNo,
      order_type: (formData.get("order_type") as string) || null,
      customer_id: (formData.get("customer_id") as string) || null,
      order_date: formData.get("order_date") as string,
      delivery_date: (formData.get("delivery_date") as string) || null,
      delivery_mode: (formData.get("delivery_mode") as string) || "PICKUP",
      subtotal: Math.round(subtotal * 100) / 100,
      discount,
      tax_percent: taxPct,
      grand_total: Math.round(grandTotal * 100) / 100,
      notes: (formData.get("notes") as string) || null,
      remarks: (formData.get("remarks") as string) || null,
    })
    .select()
    .single();
  if (error) throw error;

  if (rawItems.length) {
    await db.from("order_items").insert(
      rawItems.map((i: any) => ({
        order_id: (order as any).id,
        item_type: i.item_type,
        size_id: i.size_id || null,
        paper_type_id: i.paper_type_id || null,
        cover_type_id: i.cover_type_id || null,
        accessory_id: i.accessory_id || null,
        service_mode: i.service_mode || null,
        needs_velvet: Boolean(i.needs_velvet),
        velvet_rate: Number(i.velvet_rate ?? 0),
        qty: Number(i.qty),
        unit_price: Number(i.unit_price),
        line_total: Number(i.line_total),
      }))
    );
  }

  revalidatePath("/studio/orders");
  return { orderId: (order as any).id };
}

export async function updateOrderStatus(id: string, status: string) {
  const { supabase } = await getTenantId();
  await (supabase.from("orders") as any).update({ order_status: status, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/studio/orders");
  revalidatePath(`/studio/orders/${id}`);
}

export async function deleteOrder(id: string) {
  const { supabase } = await getTenantId();
  await (supabase.from("orders") as any).delete().eq("id", id);
  revalidatePath("/studio/orders");
}

export async function addPayment(formData: FormData) {
  const { supabase, tenantId } = await getTenantId();
  const db = supabase as any;
  const orderId = formData.get("order_id") as string;
  await db.from("payments").insert({
    tenant_id: tenantId,
    order_id: orderId,
    payment_date: formData.get("payment_date") as string,
    amount: parseFloat(formData.get("amount") as string),
    payment_method: (formData.get("payment_method") as string) || "CASH",
    remarks: (formData.get("remarks") as string) || null,
  });

  const { data: order } = await db.from("orders").select("grand_total").eq("id", orderId).single();
  const { data: allPay } = await db.from("payments").select("amount").eq("order_id", orderId);
  const totalPaid = (allPay as any[])?.reduce((s: number, p: any) => s + Number(p.amount), 0) ?? 0;
  const gt = Number((order as any)?.grand_total ?? 0);
  const payStatus = totalPaid >= gt ? "PAID" : totalPaid > 0 ? "PARTIAL" : "UNPAID";
  await db.from("orders").update({ payment_status: payStatus, updated_at: new Date().toISOString() }).eq("id", orderId);

  revalidatePath(`/studio/orders/${orderId}`);
}

export async function deletePayment(paymentId: string, orderId: string) {
  const { supabase } = await getTenantId();
  await (supabase.from("payments") as any).delete().eq("id", paymentId);
  revalidatePath(`/studio/orders/${orderId}`);
}

export async function getOrderFormData(): Promise<{
  customers: any[];
  sizes: any[];
  paperTypes: any[];
  coverTypes: any[];
  accessories: any[];
  photoPricing: any[];
  coverPricing: any[];
  velvetRate: number;
}> {
  const { supabase, tenantId } = await getTenantId();
  const db = supabase as any;
  const [customers, sizes, paperTypes, coverTypes, accessories, photoPricing, coverPricing, velvetRate] =
    await Promise.all([
      db.from("customers").select("id,customer_name,studio_name").eq("tenant_id", tenantId).eq("status", "active").order("customer_name"),
      db.from("sizes").select("*").eq("tenant_id", tenantId).eq("status", "active").order("sort_order"),
      db.from("paper_types").select("*").eq("tenant_id", tenantId).eq("status", "active").order("sort_order"),
      db.from("cover_types").select("*").eq("tenant_id", tenantId).eq("status", "active").order("sort_order"),
      db.from("accessories").select("*").eq("tenant_id", tenantId).eq("status", "active").order("sort_order"),
      db.from("photo_pricing").select("*").eq("tenant_id", tenantId),
      db.from("cover_pricing").select("*").eq("tenant_id", tenantId),
      db.from("velvet_rates").select("rate").eq("tenant_id", tenantId).single(),
    ]);

  return {
    customers: (customers.data as any[]) ?? [],
    sizes: (sizes.data as any[]) ?? [],
    paperTypes: (paperTypes.data as any[]) ?? [],
    coverTypes: (coverTypes.data as any[]) ?? [],
    accessories: (accessories.data as any[]) ?? [],
    photoPricing: (photoPricing.data as any[]) ?? [],
    coverPricing: (coverPricing.data as any[]) ?? [],
    velvetRate: (velvetRate.data as any)?.rate ?? 10,
  };
}
