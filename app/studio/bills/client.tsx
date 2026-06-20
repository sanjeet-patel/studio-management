"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRecurringBill, deleteRecurringBill, generateBillInstances, addBillPayment } from "@/lib/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Receipt, ChevronRight, AlertCircle } from "lucide-react";

export function BillsClient({ bills, instances, currentMonth }: { bills: any[]; instances: any[]; currentMonth: string }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [month, setMonth] = useState(currentMonth);
  const [payingId, setPayingId] = useState<string | null>(null);

  const handleGenerate = async () => {
    try { await generateBillInstances(month); toast.success("Instances generated"); router.push(`/studio/bills?month=${month}`); router.refresh(); }
    catch { toast.error("Failed"); }
  };

  const totalPending = instances.reduce((s, i) => {
    const paid = (i.bill_payments ?? []).reduce((ps: number, p: any) => ps + Number(p.amount), 0);
    return s + Math.max(0, Number(i.amount) - paid);
  }, 0);

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Recurring Bills</h1>
        <Button className="bg-teal-600 hover:bg-teal-700 h-9 text-sm" onClick={() => setAdding(!adding)}>
          <Plus className="h-4 w-4 mr-1.5" />Add
        </Button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-teal-50 rounded-2xl border border-teal-100 p-4">
          <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-3">New Recurring Bill</p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            try { await createRecurringBill(new FormData(e.currentTarget)); toast.success("Bill added"); setAdding(false); router.refresh(); }
            catch { toast.error("Failed"); }
          }} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2"><Label className="text-xs">Name *</Label><Input name="name" required className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs">Amount (₹) *</Label><Input name="amount" type="number" step="0.01" required className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs">Due Day</Label><Input name="due_day" type="number" min="1" max="31" defaultValue="1" className="mt-1 h-9 text-sm" /></div>
              <div className="col-span-2"><Label className="text-xs">Start Date</Label><Input name="start_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="mt-1 h-9 text-sm" /></div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1 bg-teal-600 h-9">Save</Button>
              <Button type="button" size="sm" variant="ghost" className="h-9" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Bills list */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Bill Definitions</h2>
        <div className="space-y-2">
          {bills.map((b, i) => (
            <div key={b.id} className={`bg-white rounded-2xl shadow-sm flex items-center gap-3 px-4 py-3.5 card-lift animate-fade-up`} style={{ animationDelay: `${0.04 * i}s` }}>
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Receipt className="h-4 w-4 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{b.name}</p>
                <p className="text-xs text-slate-500">₹{Number(b.amount).toLocaleString()} · Due day {b.due_day}</p>
              </div>
              <button onClick={async () => { if (!confirm("Delete?")) return; await deleteRecurringBill(b.id); toast.success("Deleted"); router.refresh(); }}
                className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center active:bg-red-100 transition-colors">
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </button>
            </div>
          ))}
          {!bills.length && <p className="text-sm text-slate-400 text-center py-4">No bills configured.</p>}
        </div>
      </div>

      {/* Monthly instances */}
      <div>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Instances</h2>
          {totalPending > 0 && (
            <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
              <AlertCircle className="h-3 w-3" />₹{totalPending.toFixed(2)} pending
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-8 text-sm w-34" />
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => router.push(`/studio/bills?month=${month}`)}>View</Button>
            <Button size="sm" className="h-8 text-xs bg-teal-600" onClick={handleGenerate}>Generate</Button>
          </div>
        </div>

        {/* ── Mobile cards ── */}
        <div className="md:hidden space-y-2">
          {instances.map((inst, i) => {
            const bill = inst.recurring_bills;
            const paid = (inst.bill_payments ?? []).reduce((s: number, p: any) => s + Number(p.amount), 0);
            const balance = Math.max(0, Number(inst.amount) - paid);
            const isPaid = inst.status === "PAID";
            return (
              <div key={inst.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden animate-fade-up`} style={{ animationDelay: `${0.04 * i}s` }}>
                <div className="px-4 py-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-slate-800 text-sm">{bill?.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isPaid ? "bg-emerald-100 text-emerald-700" : inst.status === "PARTIAL" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{inst.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="bg-slate-50 rounded-xl p-2 text-center">
                      <p className="text-[10px] text-slate-400">Amount</p>
                      <p className="text-sm font-bold text-slate-700">₹{Number(inst.amount).toFixed(0)}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-2 text-center">
                      <p className="text-[10px] text-emerald-400">Paid</p>
                      <p className="text-sm font-bold text-emerald-700">₹{paid.toFixed(0)}</p>
                    </div>
                    <div className={`rounded-xl p-2 text-center ${balance > 0 ? "bg-red-50" : "bg-emerald-50"}`}>
                      <p className={`text-[10px] ${balance > 0 ? "text-red-400" : "text-emerald-400"}`}>Balance</p>
                      <p className={`text-sm font-bold ${balance > 0 ? "text-red-600" : "text-emerald-700"}`}>{balance > 0 ? `₹${balance.toFixed(0)}` : "✓"}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">Due: {new Date(inst.due_date).toLocaleDateString("en-IN")}</p>
                  {balance > 0 && (
                    payingId === inst.id ? (
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        fd.set("instance_id", inst.id);
                        try { await addBillPayment(fd); toast.success("Paid"); setPayingId(null); router.refresh(); }
                        catch { toast.error("Failed"); }
                      }} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="text-xs text-slate-500">Amount</label>
                          <Input name="amount" type="number" step="0.01" defaultValue={balance} className="h-9 text-sm mt-1" />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-slate-500">Date</label>
                          <Input name="payment_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="h-9 text-sm mt-1" />
                        </div>
                        <Button type="submit" size="sm" className="h-9 bg-emerald-600 text-xs">Pay</Button>
                        <Button type="button" size="sm" variant="ghost" className="h-9" onClick={() => setPayingId(null)}>✕</Button>
                      </form>
                    ) : (
                      <button onClick={() => setPayingId(inst.id)}
                        className="w-full h-9 rounded-xl bg-teal-600 text-white text-sm font-medium active:bg-teal-700 transition-colors">
                        Pay ₹{balance.toFixed(2)}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
          {!instances.length && <p className="text-sm text-slate-400 text-center py-6">No instances for {month}. Click Generate.</p>}
        </div>

        {/* ── Desktop table ── */}
        <div className="hidden md:block bg-white rounded-xl border overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b"><tr>
              <th className="px-4 py-2 text-left text-slate-600">Bill</th>
              <th className="px-4 py-2 text-left text-slate-600">Amount</th>
              <th className="px-4 py-2 text-left text-slate-600">Due</th>
              <th className="px-4 py-2 text-left text-slate-600">Paid</th>
              <th className="px-4 py-2 text-left text-slate-600">Status</th>
              <th className="px-4 py-2 text-left text-slate-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y">
              {instances.map((inst) => {
                const bill = inst.recurring_bills;
                const paid = (inst.bill_payments ?? []).reduce((s: number, p: any) => s + Number(p.amount), 0);
                const balance = Math.max(0, Number(inst.amount) - paid);
                return (
                  <tr key={inst.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium">{bill?.name}</td>
                    <td className="px-4 py-2">₹{Number(inst.amount).toFixed(2)}</td>
                    <td className="px-4 py-2 text-slate-500">{new Date(inst.due_date).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-2 text-emerald-600">₹{paid.toFixed(2)}</td>
                    <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${inst.status === "PAID" ? "bg-emerald-100 text-emerald-700" : inst.status === "PARTIAL" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{inst.status}</span></td>
                    <td className="px-4 py-2">
                      {balance > 0 && (payingId === inst.id ? (
                        <form onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set("instance_id", inst.id); try { await addBillPayment(fd); toast.success("Paid"); setPayingId(null); router.refresh(); } catch { toast.error("Failed"); } }} className="flex gap-2 items-center">
                          <Input name="amount" type="number" step="0.01" defaultValue={balance} className="h-7 text-sm w-24" />
                          <Input name="payment_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="h-7 text-sm w-32" />
                          <Button type="submit" size="sm" className="h-7 bg-emerald-600">Pay</Button>
                          <Button type="button" size="sm" variant="ghost" className="h-7" onClick={() => setPayingId(null)}>Cancel</Button>
                        </form>
                      ) : (<Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setPayingId(inst.id)}>Pay ₹{balance.toFixed(2)}</Button>))}
                    </td>
                  </tr>
                );
              })}
              {!instances.length && <tr><td colSpan={6} className="px-4 py-4 text-center text-slate-400">No instances for {month}. Click Generate.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
