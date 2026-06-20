"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExpense, deleteExpense, createExpenseCategory } from "@/lib/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export function ExpensesClient({ expenses, categories, currentMonth }: { expenses: any[]; categories: any[]; currentMonth: string }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [month, setMonth] = useState(currentMonth);

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Expenses</h1>
        <div className="flex gap-2 items-center">
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-9 text-sm w-36" />
          <Button variant="outline" size="sm" onClick={() => router.push(`/studio/expenses?month=${month}`)}>View</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setAdding(!adding)}><Plus className="h-4 w-4 mr-2" />Add</Button>
        </div>
      </div>

      {adding && (
        <Card className="border-0 shadow-sm mb-4 bg-indigo-50">
          <CardContent className="pt-4">
            <form onSubmit={async (e) => {
              e.preventDefault();
              try { await createExpense(new FormData(e.currentTarget)); toast.success("Expense added"); setAdding(false); router.refresh(); }
              catch { toast.error("Failed"); }
            }} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div>
                <Label className="text-xs">Category</Label>
                <select name="category_id" className="mt-1 w-full border rounded px-2 py-1.5 text-sm">
                  <option value="">Uncategorized</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><Label className="text-xs">Date *</Label><Input name="expense_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required className="mt-1 h-8 text-sm" /></div>
              <div><Label className="text-xs">Amount (₹) *</Label><Input name="amount" type="number" step="0.01" required className="mt-1 h-8 text-sm" /></div>
              <div>
                <Label className="text-xs">Paid?</Label>
                <select name="is_paid" className="mt-1 w-full border rounded px-2 py-1.5 text-sm h-8">
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="col-span-full"><Label className="text-xs">Remarks</Label><Input name="remarks" className="mt-1 h-8 text-sm" /></div>
              <div className="col-span-full flex gap-2">
                <Button type="submit" size="sm" className="bg-indigo-600">Save</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-slate-500">{expenses.length} expenses in {month}</p>
        <p className="font-semibold text-slate-800">Total: ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b"><tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Date</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Category</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Amount</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Paid</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Remarks</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Actions</th>
          </tr></thead>
          <tbody className="divide-y">
            {expenses.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-2">{new Date(e.expense_date).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-2 text-slate-500">{e.expense_categories?.name ?? "Uncategorized"}</td>
                <td className="px-4 py-2 font-semibold">₹{Number(e.amount).toFixed(2)}</td>
                <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${e.is_paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{e.is_paid ? "Yes" : "No"}</span></td>
                <td className="px-4 py-2 text-slate-500">{e.remarks ?? "—"}</td>
                <td className="px-4 py-2">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-red-500" onClick={async () => { if (!confirm("Delete?")) return; await deleteExpense(e.id); toast.success("Deleted"); router.refresh(); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </td>
              </tr>
            ))}
            {!expenses.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No expenses for {month}.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
