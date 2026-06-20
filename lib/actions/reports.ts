"use server";

import { createClient } from "@/lib/supabase/server";

async function getTenantId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");
  const { data } = await (supabase.from("users") as any).select("tenant_id").eq("id", user.id).single();
  if (!data?.tenant_id) throw new Error("No tenant");
  return { supabase, tenantId: data.tenant_id as string };
}

export async function getProfitLoss(monthYear: string) {
  const { supabase, tenantId } = await getTenantId();
  const db = supabase as any;
  const [yr, mo] = monthYear.split("-");
  const startDate = `${monthYear}-01`;
  const endDate = new Date(parseInt(yr), parseInt(mo), 0).toISOString().slice(0, 10);

  const [payments, billInstances, salaries, expenses] = await Promise.all([
    db.from("payments").select("amount").eq("tenant_id", tenantId).gte("payment_date", startDate).lte("payment_date", endDate),
    db.from("bill_instances").select("amount, recurring_bills!inner(tenant_id)").eq("recurring_bills.tenant_id", tenantId).eq("month_year", monthYear),
    db.from("salary_cycles").select("salary_amount, salary_adjustments(*), employees!inner(tenant_id)").eq("employees.tenant_id", tenantId).eq("month_year", monthYear),
    db.from("expenses").select("amount, expense_categories(name)").eq("tenant_id", tenantId).gte("expense_date", startDate).lte("expense_date", endDate),
  ]);

  const revenue = (payments.data as any[])?.reduce((s: number, p: any) => s + Number(p.amount), 0) ?? 0;
  const billExpenses = (billInstances.data as any[])?.reduce((s: number, b: any) => s + Number(b.amount), 0) ?? 0;
  const salaryExpenses = (salaries.data as any[])?.reduce((s: number, c: any) => {
    const adj = c.salary_adjustments as any[] ?? [];
    const add = adj.filter((a: any) => a.type === "addition").reduce((x: number, a: any) => x + Number(a.amount), 0);
    const ded = adj.filter((a: any) => a.type === "deduction").reduce((x: number, a: any) => x + Number(a.amount), 0);
    return s + Number(c.salary_amount) + add - ded;
  }, 0) ?? 0;
  const miscExpenses = (expenses.data as any[])?.reduce((s: number, e: any) => s + Number(e.amount), 0) ?? 0;
  const totalExpenses = billExpenses + salaryExpenses + miscExpenses;
  const netProfit = revenue - totalExpenses;

  return { revenue, billExpenses, salaryExpenses, miscExpenses, totalExpenses, netProfit, month: monthYear };
}

export async function getLedger(monthYear: string) {
  const { supabase, tenantId } = await getTenantId();
  const db = supabase as any;
  const [yr, mo] = monthYear.split("-");

  const startDate = `${monthYear}-01`;
  const endDate = new Date(parseInt(yr), parseInt(mo), 0).toISOString().slice(0, 10);

  const [payments, expenses, billPayments, salaryPayments] = await Promise.all([
    db.from("payments").select("id,payment_date,amount,payment_method,orders(order_no,customers(customer_name))").eq("tenant_id", tenantId).gte("payment_date", startDate).lte("payment_date", endDate).order("payment_date"),
    db.from("expenses").select("id,expense_date,amount,remarks,expense_categories(name)").eq("tenant_id", tenantId).gte("expense_date", startDate).lte("expense_date", endDate).order("expense_date"),
    db.from("bill_payments").select("id,payment_date,amount,bill_instance_id,bill_instances!inner(recurring_bills!inner(name,tenant_id))").eq("bill_instances.recurring_bills.tenant_id", tenantId).gte("payment_date", startDate).lte("payment_date", endDate).order("payment_date"),
    db.from("salary_payments").select("id,payment_date,amount,salary_cycle_id,salary_cycles!inner(month_year,employees!inner(employee_name,tenant_id))").eq("salary_cycles.employees.tenant_id", tenantId).gte("payment_date", startDate).lte("payment_date", endDate).order("payment_date"),
  ]);

  type LedgerEntry = { date: string; narration: string; debit: number; credit: number; type: string };
  const entries: LedgerEntry[] = [];

  (payments.data as any[])?.forEach((p: any) => {
    const ord = p.orders as any;
    const cust = ord?.customers?.customer_name ?? "Walk-in";
    entries.push({ date: p.payment_date, narration: `Payment — ${ord?.order_no ?? ""} (${cust})`, credit: Number(p.amount), debit: 0, type: "income" });
  });
  (expenses.data as any[])?.forEach((e: any) => {
    const cat = (e.expense_categories as any)?.name ?? "Misc";
    entries.push({ date: e.expense_date, narration: `Expense — ${cat}${e.remarks ? ": " + e.remarks : ""}`, debit: Number(e.amount), credit: 0, type: "expense" });
  });
  (billPayments.data as any[])?.forEach((p: any) => {
    const bill = (p.bill_instances as any)?.recurring_bills?.name ?? "Bill";
    entries.push({ date: p.payment_date, narration: `Bill Payment — ${bill}`, debit: Number(p.amount), credit: 0, type: "bill" });
  });
  (salaryPayments.data as any[])?.forEach((p: any) => {
    const emp = (p.salary_cycles as any)?.employees?.employee_name ?? "Employee";
    entries.push({ date: p.payment_date, narration: `Salary — ${emp} (${(p.salary_cycles as any)?.month_year ?? ""})`, debit: Number(p.amount), credit: 0, type: "salary" });
  });

  entries.sort((a, b) => a.date.localeCompare(b.date));

  let balance = 0;
  const ledger = entries.map((e) => {
    balance += e.credit - e.debit;
    return { ...e, balance };
  });

  return { ledger, month: monthYear };
}

export async function getCustomerDues() {
  const { supabase, tenantId } = await getTenantId();
  const { data: orders } = await (supabase.from("orders") as any)
    .select("id,order_no,grand_total,customer_id,customers(customer_name,mobile),payments(amount)")
    .eq("tenant_id", tenantId)
    .not("payment_status", "eq", "PAID");

  return (orders as any[])?.map((o: any) => {
    const payments = o.payments as any[] ?? [];
    const paid = payments.reduce((s: number, p: any) => s + Number(p.amount), 0);
    const outstanding = Math.max(0, Number(o.grand_total) - paid);
    return { id: o.id, order_no: o.order_no, customer: (o.customers as any)?.customer_name ?? "Walk-in", mobile: (o.customers as any)?.mobile ?? "", outstanding, grand_total: Number(o.grand_total) };
  }).filter((o: any) => o.outstanding > 0) ?? [];
}

export async function getExpenseReport(monthYear: string) {
  const { supabase, tenantId } = await getTenantId();
  const db = supabase as any;
  const [yr, mo] = monthYear.split("-");
  const startDate = `${monthYear}-01`;
  const endDate = new Date(parseInt(yr), parseInt(mo), 0).toISOString().slice(0, 10);

  const { data } = await db.from("expenses").select("amount,expense_categories(name)").eq("tenant_id", tenantId).gte("expense_date", startDate).lte("expense_date", endDate);

  const byCategory: Record<string, number> = {};
  (data as any[])?.forEach((e: any) => {
    const cat = (e.expense_categories as any)?.name ?? "Uncategorized";
    byCategory[cat] = (byCategory[cat] ?? 0) + Number(e.amount);
  });
  const total = Object.values(byCategory).reduce((s, v) => s + v, 0);
  return { byCategory, total, month: monthYear };
}
