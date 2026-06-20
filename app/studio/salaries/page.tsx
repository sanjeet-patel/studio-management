import { getSalaryCycles, generateSalaries } from "@/lib/actions/finance";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { GenerateSalariesForm } from "./generate-form";

const statusColor: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PARTIAL: "bg-blue-100 text-blue-700",
  PAID: "bg-emerald-100 text-emerald-700",
};

export default async function SalariesPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month } = await searchParams;
  const cycles = await getSalaryCycles(month);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Salaries</h1>
        <GenerateSalariesForm currentMonth={month} />
      </div>

      {month && (
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
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
      )}
    </div>
  );
}
