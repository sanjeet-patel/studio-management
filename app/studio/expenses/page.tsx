import { getExpenses, getExpenseCategories } from "@/lib/actions/finance";
import { ExpensesClient } from "./client";
export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month } = await searchParams;
  const currentMonth = month ?? new Date().toISOString().slice(0, 7);
  const [expenses, categories] = await Promise.all([getExpenses(currentMonth), getExpenseCategories()]);
  return <ExpensesClient expenses={expenses} categories={categories} currentMonth={currentMonth} />;
}
