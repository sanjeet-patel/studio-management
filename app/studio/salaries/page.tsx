import { getSalaryCycles } from "@/lib/actions/finance";
import Link from "next/link";
import { GenerateSalariesForm } from "./generate-form";
import { Button } from "@/components/ui/button";

const statusColor: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PARTIAL: "bg-blue-100 text-blue-700",
  PAID: "bg-emerald-100 text-emerald-700",
};

export default async function SalariesPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month } = await searchParams;
  const cycles = await getSalaryCycles(month);

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Salaries</h1>
        <GenerateSalariesForm currentMonth={month} />
      </div>

      {month && (
        <>
          {/* ── Mobile cards ── */}
          <div className="md:hidden space-y-2">
            {cycles.map((c, i) => {
              const emp = c.employees as any;
              const adj = c.salary_adjustments as any[];
              const pay = c.salary_payments as any[];
              const additions = adj.filter((a) => a.type === "addition").reduce((s, a) => s + Number(a.amount), 0);
              const deductions = adj.filter((a) => a.type === "deduction").reduce((s, a) => s + Number(a.amount), 0);
              const net = Number(c.salary_amount) + additions - deductions;
              const paid = pay.reduce((s: number, p: any) => s + Number(p.amount), 0);
              const balance = Math.max(0, net - paid);
              return (
                <div key={c.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden card-lift animate-fade-up`} style={{ animationDelay: `${0.04 * i}s` }}>
                  <div className="px-4 py-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">{emp?.employee_name?.charAt(0)}</span>
                        </div>
                        <p className="font-semibold text-slate-800 text-sm">{emp?.employee_name}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[c.status]}`}>{c.status}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="bg-slate-50 rounded-xl px-2.5 py-2 text-center">
                        <p className="text-[10px] text-slate-400 uppercase">Net</p>
                        <p className="text-sm font-bold text-slate-800">₹{net.toLocaleString()}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl px-2.5 py-2 text-center">
                        <p className="text-[10px] text-emerald-500 uppercase">Paid</p>
                        <p className="text-sm font-bold text-emerald-700">₹{paid.toFixed(0)}</p>
                      </div>
                      <div className={`rounded-xl px-2.5 py-2 text-center ${balance > 0 ? "bg-red-50" : "bg-emerald-50"}`}>
                        <p className={`text-[10px] uppercase ${balance > 0 ? "text-red-400" : "text-emerald-500"}`}>Balance</p>
                        <p className={`text-sm font-bold ${balance > 0 ? "text-red-600" : "text-emerald-700"}`}>{balance > 0 ? `₹${balance.toFixed(0)}` : "Clear"}</p>
                      </div>
                    </div>
                    {(additions > 0 || deductions > 0) && (
                      <div className="flex gap-3 mt-2">
                        {additions > 0 && <span className="text-xs text-emerald-600">+₹{additions} added</span>}
                        {deductions > 0 && <span className="text-xs text-red-500">-₹{deductions} deducted</span>}
                      </div>
                    )}
                    <Link href={`/studio/salaries/${c.id}`} className="mt-3 block">
                      <button className="w-full h-9 rounded-xl border border-teal-200 text-teal-700 text-sm font-medium active:bg-teal-50 transition-colors">
                        Manage Payments →
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
            {!cycles.length && <div className="text-center py-12 text-slate-400 text-sm">Select a month and generate salaries.</div>}
          </div>

          {/* ── Desktop table ── */}
          <div className="hidden md:block bg-white rounded-xl border overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Employee</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Base</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Adj</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Net Payable</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Paid</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Balance</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cycles.map((c) => {
                  const emp = c.employees as any;
                  const adj = c.salary_adjustments as any[];
                  const pay = c.salary_payments as any[];
                  const additions = adj.filter((a) => a.type === "addition").reduce((s, a) => s + Number(a.amount), 0);
                  const deductions = adj.filter((a) => a.type === "deduction").reduce((s, a) => s + Number(a.amount), 0);
                  const net = Number(c.salary_amount) + additions - deductions;
                  const paid = pay.reduce((s: number, p: any) => s + Number(p.amount), 0);
                  const balance = Math.max(0, net - paid);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{emp?.employee_name}</td>
                      <td className="px-4 py-3">₹{Number(c.salary_amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">
                        {additions > 0 && <span className="text-emerald-600">+₹{additions}</span>}
                        {deductions > 0 && <span className="text-red-600 ml-1">-₹{deductions}</span>}
                        {!additions && !deductions && "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold">₹{net.toLocaleString()}</td>
                      <td className="px-4 py-3 text-emerald-600">₹{paid.toFixed(2)}</td>
                      <td className="px-4 py-3 text-red-600 font-semibold">{balance > 0 ? `₹${balance.toFixed(2)}` : "—"}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[c.status]}`}>{c.status}</span></td>
                      <td className="px-4 py-3"><Link href={`/studio/salaries/${c.id}`}><Button variant="ghost" size="sm" className="h-7 text-xs px-2">Manage</Button></Link></td>
                    </tr>
                  );
                })}
                {!cycles.length && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Select a month and generate salaries to get started.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
      {!month && <div className="text-center py-16 text-slate-400 text-sm">Select a month above to view salary cycles.</div>}
    </div>
  );
}
