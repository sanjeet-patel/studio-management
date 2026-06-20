import { getRecurringBills, getBillInstances, generateBillInstances } from "@/lib/actions/finance";
import { BillsClient } from "./client";
export default async function BillsPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month } = await searchParams;
  const currentMonth = month ?? new Date().toISOString().slice(0, 7);
  const [bills, instances] = await Promise.all([
    getRecurringBills(),
    getBillInstances(currentMonth),
  ]);
  return <BillsClient bills={bills} instances={instances} currentMonth={currentMonth} />;
}
