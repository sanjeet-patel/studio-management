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

// ── Employees ─────────────────────────────────────────────────────────────────
export async function getEmployees(): Promise<any[]> {
  const { supabase, tenantId } = await getTenantId();
  const { data } = await (supabase.from("employees") as any).select("*").eq("tenant_id", tenantId).order("employee_name");
  return (data as any[]) ?? [];
}
export async function getEmployee(id: string): Promise<any | null> {
  const { supabase } = await getTenantId();
  const { data } = await (supabase.from("employees") as any).select("*").eq("id", id).single();
  return data ?? null;
}
export async function createEmployee(formData: FormData) {
  const { supabase, tenantId } = await getTenantId();
  await (supabase.from("employees") as any).insert({
    tenant_id: tenantId,
    employee_name: formData.get("employee_name") as string,
    mobile: (formData.get("mobile") as string) || null,
    joining_date: (formData.get("joining_date") as string) || null,
    salary: parseFloat(formData.get("salary") as string) || 0,
    salary_due_day: parseInt(formData.get("salary_due_day") as string) || 1,
  });
  revalidatePath("/studio/employees");
}
export async function updateEmployee(id: string, formData: FormData) {
  const { supabase } = await getTenantId();
  await (supabase.from("employees") as any).update({
    employee_name: formData.get("employee_name") as string,
    mobile: (formData.get("mobile") as string) || null,
    joining_date: (formData.get("joining_date") as string) || null,
    salary: parseFloat(formData.get("salary") as string) || 0,
    salary_due_day: parseInt(formData.get("salary_due_day") as string) || 1,
    status: (formData.get("status") as string) || "active",
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  revalidatePath("/studio/employees");
}
export async function deleteEmployee(id: string) {
  const { supabase } = await getTenantId();
  await (supabase.from("employees") as any).delete().eq("id", id);
  revalidatePath("/studio/employees");
}

// ── Salary Cycles ─────────────────────────────────────────────────────────────
export async function getSalaryCycles(monthYear?: string): Promise<any[]> {
  const { supabase, tenantId } = await getTenantId();
  const db = supabase as any;
  let q = db
    .from("salary_cycles")
    .select("*, employees!inner(id,employee_name,salary,tenant_id), salary_adjustments(*), salary_payments(*)")
    .eq("employees.tenant_id", tenantId)
    .order("month_year", { ascending: false });
  if (monthYear) q = q.eq("month_year", monthYear);
  const { data } = await q;
  return (data as any[]) ?? [];
}
export async function getSalaryCycle(id: string): Promise<any | null> {
  const { supabase } = await getTenantId();
  const { data } = await (supabase.from("salary_cycles") as any)
    .select("*, employees(*), salary_adjustments(*), salary_payments(*)")
    .eq("id", id)
    .single();
  return data ?? null;
}
export async function generateSalaries(monthYear: string) {
  const { supabase, tenantId } = await getTenantId();
  const { data: employees } = await (supabase.from("employees") as any).select("*").eq("tenant_id", tenantId).eq("status", "active");
  if (!employees?.length) return;
  const [year, month] = monthYear.split("-").map(Number);
  const inserts = (employees as any[]).map((emp: any) => ({
    employee_id: emp.id,
    month_year: monthYear,
    salary_amount: emp.salary,
    due_date: new Date(year, month - 1, emp.salary_due_day).toISOString().slice(0, 10),
    status: "PENDING",
  }));
  await (supabase.from("salary_cycles") as any).upsert(inserts, { onConflict: "employee_id,month_year", ignoreDuplicates: true });
  revalidatePath("/studio/salaries");
}
export async function addSalaryPayment(formData: FormData) {
  const { supabase } = await getTenantId();
  const cycleId = formData.get("cycle_id") as string;
  await (supabase.from("salary_payments") as any).insert({
    salary_cycle_id: cycleId,
    payment_date: formData.get("payment_date") as string,
    amount: parseFloat(formData.get("amount") as string),
    remarks: (formData.get("remarks") as string) || null,
  });
  await recalcSalaryCycleStatus(cycleId, supabase);
  revalidatePath(`/studio/salaries/${cycleId}`);
  revalidatePath("/studio/salaries");
}
export async function addSalaryAdjustment(formData: FormData) {
  const { supabase } = await getTenantId();
  const cycleId = formData.get("cycle_id") as string;
  await (supabase.from("salary_adjustments") as any).insert({
    salary_cycle_id: cycleId,
    type: formData.get("type") as string,
    reason: formData.get("reason") as string,
    amount: parseFloat(formData.get("amount") as string),
  });
  await recalcSalaryCycleStatus(cycleId, supabase);
  revalidatePath(`/studio/salaries/${cycleId}`);
}
export async function removeSalaryAdjustment(id: string, cycleId: string) {
  const { supabase } = await getTenantId();
  await (supabase.from("salary_adjustments") as any).delete().eq("id", id);
  await recalcSalaryCycleStatus(cycleId, supabase);
  revalidatePath(`/studio/salaries/${cycleId}`);
}
async function recalcSalaryCycleStatus(cycleId: string, supabase: any) {
  const { data: cycle } = await supabase.from("salary_cycles").select("salary_amount, salary_adjustments(*), salary_payments(*)").eq("id", cycleId).single();
  if (!cycle) return;
  const additions = cycle.salary_adjustments?.filter((a: any) => a.type === "addition").reduce((s: number, a: any) => s + Number(a.amount), 0) ?? 0;
  const deductions = cycle.salary_adjustments?.filter((a: any) => a.type === "deduction").reduce((s: number, a: any) => s + Number(a.amount), 0) ?? 0;
  const net = Number(cycle.salary_amount) + additions - deductions;
  const paid = cycle.salary_payments?.reduce((s: number, p: any) => s + Number(p.amount), 0) ?? 0;
  const status = paid >= net ? "PAID" : paid > 0 ? "PARTIAL" : "PENDING";
  await supabase.from("salary_cycles").update({ status }).eq("id", cycleId);
}

// ── Recurring Bills ───────────────────────────────────────────────────────────
export async function getRecurringBills(): Promise<any[]> {
  const { supabase, tenantId } = await getTenantId();
  const { data } = await (supabase.from("recurring_bills") as any).select("*").eq("tenant_id", tenantId).order("name");
  return (data as any[]) ?? [];
}
export async function createRecurringBill(formData: FormData) {
  const { supabase, tenantId } = await getTenantId();
  await (supabase.from("recurring_bills") as any).insert({
    tenant_id: tenantId,
    name: formData.get("name") as string,
    amount: parseFloat(formData.get("amount") as string),
    due_day: parseInt(formData.get("due_day") as string) || 1,
    frequency: (formData.get("frequency") as string) || "monthly",
    start_date: (formData.get("start_date") as string) || new Date().toISOString().slice(0, 10),
  });
  revalidatePath("/studio/bills");
}
export async function deleteRecurringBill(id: string) {
  const { supabase } = await getTenantId();
  await (supabase.from("recurring_bills") as any).delete().eq("id", id);
  revalidatePath("/studio/bills");
}
export async function generateBillInstances(monthYear: string) {
  const { supabase, tenantId } = await getTenantId();
  const { data: bills } = await (supabase.from("recurring_bills") as any).select("*").eq("tenant_id", tenantId).eq("status", "active");
  if (!bills?.length) return;
  const [year, month] = monthYear.split("-").map(Number);
  const inserts = (bills as any[]).map((b: any) => ({
    recurring_bill_id: b.id,
    month_year: monthYear,
    amount: b.amount,
    due_date: new Date(year, month - 1, b.due_day).toISOString().slice(0, 10),
    status: "PENDING",
  }));
  await (supabase.from("bill_instances") as any).upsert(inserts, { onConflict: "recurring_bill_id,month_year", ignoreDuplicates: true });
  revalidatePath("/studio/bills");
}
export async function getBillInstances(monthYear: string): Promise<any[]> {
  const { supabase, tenantId } = await getTenantId();
  const { data } = await (supabase.from("bill_instances") as any)
    .select("*, recurring_bills!inner(id,name,tenant_id), bill_payments(*)")
    .eq("recurring_bills.tenant_id", tenantId)
    .eq("month_year", monthYear)
    .order("due_date");
  return (data as any[]) ?? [];
}
export async function addBillPayment(formData: FormData) {
  const { supabase } = await getTenantId();
  const instanceId = formData.get("instance_id") as string;
  await (supabase.from("bill_payments") as any).insert({
    bill_instance_id: instanceId,
    payment_date: formData.get("payment_date") as string,
    amount: parseFloat(formData.get("amount") as string),
    remarks: (formData.get("remarks") as string) || null,
  });
  const { data: inst } = await (supabase.from("bill_instances") as any).select("amount, bill_payments(amount)").eq("id", instanceId).single();
  const paid = (inst as any)?.bill_payments?.reduce((s: number, p: any) => s + Number(p.amount), 0) ?? 0;
  const status = paid >= Number((inst as any)?.amount ?? 0) ? "PAID" : paid > 0 ? "PARTIAL" : "PENDING";
  await (supabase.from("bill_instances") as any).update({ status }).eq("id", instanceId);
  revalidatePath("/studio/bills");
}

// ── Expenses ─────────────────────────────────────────────────────────────────
export async function getExpenseCategories(): Promise<any[]> {
  const { supabase, tenantId } = await getTenantId();
  const { data } = await (supabase.from("expense_categories") as any).select("*").eq("tenant_id", tenantId).order("name");
  return (data as any[]) ?? [];
}
export async function createExpenseCategory(formData: FormData) {
  const { supabase, tenantId } = await getTenantId();
  await (supabase.from("expense_categories") as any).insert({ tenant_id: tenantId, name: formData.get("name") as string });
  revalidatePath("/studio/expenses");
}
export async function getExpenses(monthYear?: string): Promise<any[]> {
  const { supabase, tenantId } = await getTenantId();
  const db = supabase as any;
  let q = db.from("expenses").select("*, expense_categories(name)").eq("tenant_id", tenantId).order("expense_date", { ascending: false });
  if (monthYear) {
    q = q.gte("expense_date", monthYear + "-01").lte("expense_date", monthYear + "-31");
  }
  const { data } = await q;
  return (data as any[]) ?? [];
}
export async function createExpense(formData: FormData) {
  const { supabase, tenantId } = await getTenantId();
  await (supabase.from("expenses") as any).insert({
    tenant_id: tenantId,
    category_id: (formData.get("category_id") as string) || null,
    expense_date: formData.get("expense_date") as string,
    amount: parseFloat(formData.get("amount") as string),
    is_paid: formData.get("is_paid") === "true",
    remarks: (formData.get("remarks") as string) || null,
  });
  revalidatePath("/studio/expenses");
}
export async function deleteExpense(id: string) {
  const { supabase } = await getTenantId();
  await (supabase.from("expenses") as any).delete().eq("id", id);
  revalidatePath("/studio/expenses");
}
