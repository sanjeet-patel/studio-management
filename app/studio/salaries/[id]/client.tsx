"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addSalaryPayment, addSalaryAdjustment, removeSalaryAdjustment } from "@/lib/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export function SalaryCycleClient({ cycle }: { cycle: any }) {
  const router = useRouter();
  const [payLoading, setPayLoading] = useState(false);
  const [adjLoading, setAdjLoading] = useState(false);

  const emp = cycle.employees;
  const adj: any[] = cycle.salary_adjustments ?? [];
  const payments: any[] = cycle.salary_payments ?? [];
  const additions = adj.filter((a) => a.type === "addition").reduce((s, a) => s + Number(a.amount), 0);
  const deductions = adj.filter((a) => a.type === "deduction").reduce((s, a) => s + Number(a.amount), 0);
  const net = Number(cycle.salary_amount) + additions - deductions;
  const paid = payments.reduce((s: number, p: any) => s + Number(p.amount), 0);
  const outstanding = Math.max(0, net - paid);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/studio/salaries?month=${cycle.month_year}`}><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-xl font-bold text-slate-800">{emp?.employee_name} — {cycle.month_year}</h1>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cycle.status === "PAID" ? "bg-emerald-100 text-emerald-700" : cycle.status === "PARTIAL" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{cycle.status}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Payslip */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">Payslip</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Base Salary</span><span className="font-semibold">₹{Number(cycle.salary_amount).toFixed(2)}</span></div>
            {adj.filter((a) => a.type === "addition").map((a) => (
              <div key={a.id} className="flex justify-between text-emerald-700">
                <span className="flex items-center gap-1">+ {a.reason}
                  <button onClick={async () => { await removeSalaryAdjustment(a.id, cycle.id); router.refresh(); }} className="text-slate-300 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                </span>
                <span>₹{Number(a.amount).toFixed(2)}</span>
              </div>
            ))}
            {adj.filter((a) => a.type === "deduction").map((a) => (
              <div key={a.id} className="flex justify-between text-red-600">
                <span className="flex items-center gap-1">− {a.reason}
                  <button onClick={async () => { await removeSalaryAdjustment(a.id, cycle.id); router.refresh(); }} className="text-slate-300 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                </span>
                <span>₹{Number(a.amount).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold"><span>Net Payable</span><span>₹{net.toFixed(2)}</span></div>
            <div className="flex justify-between text-emerald-600"><span>Paid</span><span>₹{paid.toFixed(2)}</span></div>
            {outstanding > 0 && <div className="flex justify-between text-red-600 font-semibold"><span>Balance Due</span><span>₹{outstanding.toFixed(2)}</span></div>}
          </CardContent>
        </Card>

        {/* Forms */}
        <div className="space-y-4">
          {/* Add Adjustment */}
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-sm">Add Adjustment</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={async (e) => {
                e.preventDefault(); setAdjLoading(true);
                try { const fd = new FormData(e.currentTarget); fd.set("cycle_id", cycle.id); await addSalaryAdjustment(fd); toast.success("Added"); (e.target as HTMLFormElement).reset(); router.refresh(); }
                catch { toast.error("Failed"); }
                finally { setAdjLoading(false); }
              }} className="space-y-3">
                <div>
                  <Label className="text-xs">Type</Label>
                  <select name="type" className="mt-1 w-full border rounded-lg px-2 py-1.5 text-sm"><option value="addition">Addition (Bonus / OT)</option><option value="deduction">Deduction (Leave / Advance)</option></select>
                </div>
                <div><Label className="text-xs">Reason</Label><Input name="reason" required className="mt-1 h-8 text-sm" placeholder="e.g. Overtime, Paid Leave" /></div>
                <div><Label className="text-xs">Amount (₹)</Label><Input name="amount" type="number" step="0.01" required className="mt-1 h-8 text-sm" /></div>
                <Button type="submit" size="sm" className="w-full bg-indigo-600" disabled={adjLoading}>{adjLoading ? "…" : "Add Adjustment"}</Button>
              </form>
            </CardContent>
          </Card>

          {/* Record Payment */}
          {outstanding > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-sm">Record Payment</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={async (e) => {
                  e.preventDefault(); setPayLoading(true);
                  try { const fd = new FormData(e.currentTarget); fd.set("cycle_id", cycle.id); await addSalaryPayment(fd); toast.success("Payment recorded"); (e.target as HTMLFormElement).reset(); router.refresh(); }
                  catch { toast.error("Failed"); }
                  finally { setPayLoading(false); }
                }} className="space-y-3">
                  <div><Label className="text-xs">Amount (₹)</Label><Input name="amount" type="number" step="0.01" defaultValue={outstanding} required className="mt-1 h-8 text-sm" /></div>
                  <div><Label className="text-xs">Date</Label><Input name="payment_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required className="mt-1 h-8 text-sm" /></div>
                  <div><Label className="text-xs">Remarks</Label><Input name="remarks" className="mt-1 h-8 text-sm" /></div>
                  <Button type="submit" size="sm" className="w-full bg-emerald-600" disabled={payLoading}>{payLoading ? "…" : "Pay Now"}</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Payment History */}
          {payments.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-sm">Payment History</CardTitle></CardHeader>
              <CardContent className="p-0">
                {payments.map((p: any) => (
                  <div key={p.id} className="flex justify-between px-4 py-2 border-b last:border-0 text-sm">
                    <span className="text-slate-500">{new Date(p.payment_date).toLocaleDateString("en-IN")}</span>
                    <span className="font-semibold text-emerald-600">₹{Number(p.amount).toFixed(2)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
