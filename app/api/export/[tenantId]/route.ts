import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import JSZip from "jszip";
import Papa from "papaparse";

export async function GET(_req: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const supabase = createAdminClient();

  const { data: rawTenant } = await supabase.from("tenants").select("*").eq("id", tenantId).single();
  if (!rawTenant) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const tenant = rawTenant as any;

  const zip = new JSZip();

  const toCsv = (data: any[]) => Papa.unparse(data);

  // README
  zip.file("00_README.txt", [
    "NSMS Studio Management System — Data Export",
    "=".repeat(42),
    `Studio  : ${tenant.name}`,
    `Slug    : ${tenant.slug}`,
    `Exported: ${new Date().toLocaleString("en-IN")}`,
    "",
    "FILES INCLUDED",
    "-".repeat(20),
    "01_studio_profile.csv",
    "02_customers.csv",
    "03_orders.csv",
    "04_order_items.csv",
    "05_payments.csv",
    "06_employees.csv",
    "07_salary_cycles.csv",
    "08_salary_adjustments.csv",
    "09_salary_payments.csv",
    "10_recurring_bills.csv",
    "11_bill_instances.csv",
    "12_bill_payments.csv",
    "13_expenses.csv",
    "14_sizes.csv",
    "15_paper_types.csv",
    "16_cover_types.csv",
    "17_accessories.csv",
    "18_photo_pricing.csv",
    "19_cover_pricing.csv",
  ].join("\n"));

  // Profile
  zip.file("01_studio_profile.csv", toCsv([{
    name: tenant.name, slug: tenant.slug, tagline: tenant.tagline ?? "", address: tenant.address ?? "",
    city: tenant.city ?? "", pin: tenant.pin ?? "", phone: tenant.phone ?? "", email: tenant.email ?? "",
    gst_number: tenant.gst_number ?? "", invoice_prefix: tenant.invoice_prefix, order_prefix: tenant.order_prefix,
    status: tenant.status, trial_ends_at: tenant.trial_ends_at ?? "", created_at: tenant.created_at,
  }]));

  const [customers, orders, orderItems, payments, employees, salaryCycles, salaryAdj, salaryPay,
    bills, billInst, billPay, expenses, sizes, paperTypes, coverTypes, accessories, photoPricing, coverPricing] =
    await Promise.all([
      supabase.from("customers").select("*").eq("tenant_id", tenantId),
      supabase.from("orders").select("*, customers(customer_name)").eq("tenant_id", tenantId),
      supabase.from("order_items").select("*, orders!inner(tenant_id,order_no), sizes(name), paper_types(name), cover_types(name), accessories(name)").eq("orders.tenant_id", tenantId),
      supabase.from("payments").select("*, orders(order_no)").eq("tenant_id", tenantId),
      supabase.from("employees").select("*").eq("tenant_id", tenantId),
      supabase.from("salary_cycles").select("*, employees!inner(employee_name,tenant_id)").eq("employees.tenant_id", tenantId),
      supabase.from("salary_adjustments").select("*, salary_cycles!inner(month_year,employees!inner(employee_name,tenant_id))").eq("salary_cycles.employees.tenant_id", tenantId),
      supabase.from("salary_payments").select("*, salary_cycles!inner(month_year,employees!inner(employee_name,tenant_id))").eq("salary_cycles.employees.tenant_id", tenantId),
      supabase.from("recurring_bills").select("*").eq("tenant_id", tenantId),
      supabase.from("bill_instances").select("*, recurring_bills!inner(name,tenant_id)").eq("recurring_bills.tenant_id", tenantId),
      supabase.from("bill_payments").select("*, bill_instances!inner(month_year,recurring_bills!inner(name,tenant_id))").eq("bill_instances.recurring_bills.tenant_id", tenantId),
      supabase.from("expenses").select("*, expense_categories(name)").eq("tenant_id", tenantId),
      supabase.from("sizes").select("*").eq("tenant_id", tenantId),
      supabase.from("paper_types").select("*").eq("tenant_id", tenantId),
      supabase.from("cover_types").select("*").eq("tenant_id", tenantId),
      supabase.from("accessories").select("*").eq("tenant_id", tenantId),
      supabase.from("photo_pricing").select("*, sizes(name), paper_types(name)").eq("tenant_id", tenantId),
      supabase.from("cover_pricing").select("*, sizes(name), cover_types(name)").eq("tenant_id", tenantId),
    ]);

  const flat = (data: any[] | null, mapper: (r: any) => any) => toCsv((data ?? []).map(mapper));

  zip.file("02_customers.csv", flat(customers.data, (c) => ({ id: c.id, customer_name: c.customer_name, studio_name: c.studio_name ?? "", mobile: c.mobile ?? "", whatsapp: c.whatsapp ?? "", address: c.address ?? "", city: c.city ?? "", notes: c.notes ?? "", status: c.status, created_at: c.created_at })));
  zip.file("03_orders.csv", flat(orders.data, (o) => ({ id: o.id, order_no: o.order_no, customer: (o.customers as any)?.customer_name ?? "", order_date: o.order_date, delivery_date: o.delivery_date ?? "", delivery_mode: o.delivery_mode, subtotal: o.subtotal, discount: o.discount, tax_percent: o.tax_percent, grand_total: o.grand_total, order_status: o.order_status, payment_status: o.payment_status, notes: o.notes ?? "" })));
  zip.file("04_order_items.csv", flat(orderItems.data, (i) => ({ id: i.id, order_no: (i.orders as any)?.order_no ?? "", item_type: i.item_type, size: (i.sizes as any)?.name ?? "", paper_type: (i.paper_types as any)?.name ?? "", cover_type: (i.cover_types as any)?.name ?? "", accessory: (i.accessories as any)?.name ?? "", service_mode: i.service_mode ?? "", needs_velvet: i.needs_velvet, velvet_rate: i.velvet_rate, qty: i.qty, unit_price: i.unit_price, line_total: i.line_total })));
  zip.file("05_payments.csv", flat(payments.data, (p) => ({ id: p.id, order_no: (p.orders as any)?.order_no ?? "", payment_date: p.payment_date, amount: p.amount, payment_method: p.payment_method, remarks: p.remarks ?? "" })));
  zip.file("06_employees.csv", flat(employees.data, (e) => ({ id: e.id, employee_name: e.employee_name, mobile: e.mobile ?? "", joining_date: e.joining_date ?? "", salary: e.salary, salary_due_day: e.salary_due_day, status: e.status })));
  zip.file("07_salary_cycles.csv", flat(salaryCycles.data, (c) => ({ id: c.id, employee: (c.employees as any)?.employee_name ?? "", month_year: c.month_year, salary_amount: c.salary_amount, due_date: c.due_date ?? "", status: c.status })));
  zip.file("08_salary_adjustments.csv", flat(salaryAdj.data, (a) => ({ id: a.id, employee: (a.salary_cycles as any)?.employees?.employee_name ?? "", month_year: (a.salary_cycles as any)?.month_year ?? "", type: a.type, reason: a.reason, amount: a.amount })));
  zip.file("09_salary_payments.csv", flat(salaryPay.data, (p) => ({ id: p.id, employee: (p.salary_cycles as any)?.employees?.employee_name ?? "", month_year: (p.salary_cycles as any)?.month_year ?? "", payment_date: p.payment_date, amount: p.amount, remarks: p.remarks ?? "" })));
  zip.file("10_recurring_bills.csv", flat(bills.data, (b) => ({ id: b.id, name: b.name, amount: b.amount, due_day: b.due_day, frequency: b.frequency, start_date: b.start_date, status: b.status })));
  zip.file("11_bill_instances.csv", flat(billInst.data, (i) => ({ id: i.id, bill_name: (i.recurring_bills as any)?.name ?? "", month_year: i.month_year, amount: i.amount, due_date: i.due_date, status: i.status })));
  zip.file("12_bill_payments.csv", flat(billPay.data, (p) => ({ id: p.id, bill_name: (p.bill_instances as any)?.recurring_bills?.name ?? "", month_year: (p.bill_instances as any)?.month_year ?? "", payment_date: p.payment_date, amount: p.amount, remarks: p.remarks ?? "" })));
  zip.file("13_expenses.csv", flat(expenses.data, (e) => ({ id: e.id, category: (e.expense_categories as any)?.name ?? "Uncategorized", expense_date: e.expense_date, amount: e.amount, is_paid: e.is_paid, remarks: e.remarks ?? "" })));
  zip.file("14_sizes.csv", flat(sizes.data, (s) => ({ id: s.id, name: s.name, sort_order: s.sort_order, status: s.status })));
  zip.file("15_paper_types.csv", flat(paperTypes.data, (p) => ({ id: p.id, name: p.name, supports_velvet: p.supports_velvet, sort_order: p.sort_order, status: p.status })));
  zip.file("16_cover_types.csv", flat(coverTypes.data, (c) => ({ id: c.id, name: c.name, sort_order: c.sort_order, status: c.status })));
  zip.file("17_accessories.csv", flat(accessories.data, (a) => ({ id: a.id, name: a.name, default_price: a.default_price, allow_price_override: a.allow_price_override, sort_order: a.sort_order, status: a.status })));
  zip.file("18_photo_pricing.csv", flat(photoPricing.data, (p) => ({ id: p.id, size: (p.sizes as any)?.name ?? "", paper_type: (p.paper_types as any)?.name ?? "", service_mode: p.service_mode, base_price: p.base_price, status: p.status })));
  zip.file("19_cover_pricing.csv", flat(coverPricing.data, (p) => ({ id: p.id, size: (p.sizes as any)?.name ?? "", cover_type: (p.cover_types as any)?.name ?? "", service_mode: p.service_mode, price: p.price, status: p.status })));

  const zipBuffer = await zip.generateAsync({ type: "arraybuffer" });
  const filename = `studio-${tenant.slug}-export-${new Date().toISOString().slice(0, 10)}.zip`;

  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
