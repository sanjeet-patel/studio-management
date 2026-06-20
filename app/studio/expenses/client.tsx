"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExpense, deleteExpense } from "@/lib/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, TrendingDown } from "lucide-react";

export function ExpensesClient({ expenses, categories, currentMonth }: { expenses: any[]; categories: any[]; currentMonth: string }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [month, setMonth] = useState(currentMonth);

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Expenses</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 px-2 h-9">
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-7 text-sm w-30 border-0 p-0 focus-visible:ring-0" />
            <button onClick={() => router.push(`/studio/expenses?month=${month}`)} className="text-xs text-teal-600 font-medium">Go</button>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700 h-9 text-sm" onClick={() => setAdding(!adding)}>
            <Plus className="h-4 w-4 mr-1.5" />Add
          </Button>
        </div>
      </div>

      {/* Summary chip */}
      {expenses.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="bg-red-50 rounded-xl px-4 py-2 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-xs text-red-500">Total Expenses</p>
              <p className="text-base font-bold text-red-700">₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">{expenses.length} records · {month}</p>
        </div>
      )}

      {/* Add form */}
      {adding && (
        <div className="bg-teal-50 rounded-2xl border border-teal-100 p-4">
          <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-3">New Expense</p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            try { await createExpense(new FormData(e.currentTarget)); toast.success("Expense added"); setAdding(false); router.refresh(); }
            catch { toast.error("Failed"); }
          }} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Category</Label>
                <select name="category_id" className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-2 text-sm bg-white">
                  <option value="">Uncategorized</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><Label className="text-xs">Date *</Label><Input name="expense_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs">Amount (₹) *</Label><Input name="amount" type="number" step="0.01" required className="mt-1 h-9 text-sm" /></div>
              <div>
                <Label className="text-xs">Paid?</Label>
                <select name="is_paid" className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-2 text-sm bg-white h-9">
                  <option value="true">Yes</option><option value="false">No</option>
                </select>
              </div>
              <div className="col-span-2"><Label className="text-xs">Remarks</Label><Input name="remarks" className="mt-1 h-9 text-sm" /></div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1 bg-teal-600 h-9">Save</Button>
              <Button type="button" size="sm" variant="ghost" className="h-9" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* ── Mobile cards ── */}
      <div className="md:hidden space-y-2">
        {expenses.map((e, i) => (
          <div key={e.id} className={`bg-white rounded-2xl shadow-sm card-lift animate-fade-up`} style={{ animationDelay: `${0.04 * i}s` }}>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-slate-800 text-sm">₹{Number(e.amount).toLocaleString("en-IN")}</p>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${e.is_paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {e.is_paid ? "Paid" : "Unpaid"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {e.expense_categories?.name && (
                    <span className="text-xs text-teal-600 font-medium">{e.expense_categories.name}</span>
                  )}
                  <span className="text-xs text-slate-400">{new Date(e.expense_date).toLocaleDateString("en-IN")}</span>
                </div>
                {e.remarks && <p className="text-xs text-slate-500 mt-0.5 truncate">{e.remarks}</p>}
              </div>
              <button onClick={async () => { if (!confirm("Delete?")) return; await deleteExpense(e.id); toast.success("Deleted"); router.refresh(); }}
                className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center active:bg-red-100 transition-colors flex-shrink-0">
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </button>
            </div>
          </div>
        ))}
        {!expenses.length && <div className="text-center py-12 text-slate-400 text-sm">No expenses for {month}.</div>}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block bg-white rounded-xl border overflow-hidden shadow-sm">
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
