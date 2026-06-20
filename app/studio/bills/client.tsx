"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRecurringBill, deleteRecurringBill, generateBillInstances, addBillPayment } from "@/lib/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Recurring Bills</h1>
        <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setAdding(!adding)}><Plus className="h-4 w-4 mr-2" />Add Bill</Button>
      </div>

      {adding && (
        <Card className="border-0 shadow-sm mb-4 bg-teal-50">
          <CardContent className="pt-4">
            <form onSubmit={async (e) => {
              e.preventDefault();
              try { await createRecurringBill(new FormData(e.currentTarget)); toast.success("Bill added"); setAdding(false); router.refresh(); }
              catch { toast.error("Failed"); }
            }} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div><Label className="text-xs">Name *</Label><Input name="name" required className="mt-1 h-8 text-sm" /></div>
              <div><Label className="text-xs">Amount (₹) *</Label><Input name="amount" type="number" step="0.01" required className="mt-1 h-8 text-sm" /></div>
              <div><Label className="text-xs">Due Day</Label><Input name="due_day" type="number" min="1" max="31" defaultValue="1" className="mt-1 h-8 text-sm" /></div>
              <div><Label className="text-xs">Start Date</Label><Input name="start_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="mt-1 h-8 text-sm" /></div>
              <div className="col-span-full flex gap-2">
                <Button type="submit" size="sm" className="bg-teal-600">Save</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Bill definitions */}
      <Card className="border-0 shadow-sm mb-6">
        <CardHeader><CardTitle className="text-sm">Bill Definitions ({bills.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b"><tr>
              <th className="px-4 py-2 text-left text-slate-600">Name</th>
              <th className="px-4 py-2 text-left text-slate-600">Amount</th>
              <th className="px-4 py-2 text-left text-slate-600">Due Day</th>
              <th className="px-4 py-2 text-left text-slate-600">Freq</th>
              <th className="px-4 py-2 text-left text-slate-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y">
              {bills.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium">{b.name}</td>
                  <td className="px-4 py-2">₹{Number(b.amount).toLocaleString()}</td>
                  <td className="px-4 py-2 text-slate-500">{b.due_day}</td>
                  <td className="px-4 py-2 text-slate-500 capitalize">{b.frequency}</td>
                  <td className="px-4 py-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-red-500" onClick={async () => { if (!confirm("Delete?")) return; await deleteRecurringBill(b.id); toast.success("Deleted"); router.refresh(); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
              {!bills.length && <tr><td colSpan={5} className="px-4 py-4 text-center text-slate-400">No bills defined.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Month Instances */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm">Monthly Instances</CardTitle>
            {totalPending > 0 && <p className="text-xs text-red-500 mt-0.5">Pending: ₹{totalPending.toFixed(2)}</p>}
          </div>
          <div className="flex gap-2 items-center">
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-8 text-sm w-36" />
            <Button size="sm" variant="outline" onClick={() => router.push(`/studio/bills?month=${month}`)}>View</Button>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={handleGenerate}>Generate</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
                      {balance > 0 && (
                        payingId === inst.id ? (
                          <form onSubmit={async (e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            fd.set("instance_id", inst.id);
                            try { await addBillPayment(fd); toast.success("Paid"); setPayingId(null); router.refresh(); }
                            catch { toast.error("Failed"); }
                          }} className="flex gap-2 items-center">
                            <Input name="amount" type="number" step="0.01" defaultValue={balance} className="h-7 text-sm w-24" />
                            <Input name="payment_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="h-7 text-sm w-32" />
                            <Button type="submit" size="sm" className="h-7 bg-emerald-600">Pay</Button>
                            <Button type="button" size="sm" variant="ghost" className="h-7" onClick={() => setPayingId(null)}>Cancel</Button>
                          </form>
                        ) : (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setPayingId(inst.id)}>Pay ₹{balance.toFixed(2)}</Button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
              {!instances.length && <tr><td colSpan={6} className="px-4 py-4 text-center text-slate-400">No instances for {month}. Click Generate.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
