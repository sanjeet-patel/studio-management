import { getEmployees } from "@/lib/actions/finance";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Pencil, Phone, IndianRupee, Calendar } from "lucide-react";
import { DeleteEmployeeButton } from "./delete-button";

export default async function EmployeesPage() {
  const employees = await getEmployees();
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Employees</h1>
        <Link href="/studio/employees/new">
          <Button className="bg-teal-600 hover:bg-teal-700 h-9 text-sm">
            <Plus className="h-4 w-4 mr-1.5" />Add
          </Button>
        </Link>
      </div>

      {/* ── Mobile cards ── */}
      <div className="md:hidden space-y-2">
        {employees.map((e, i) => (
          <div key={e.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden card-lift animate-fade-up`} style={{ animationDelay: `${0.04 * i}s` }}>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                <span className="text-teal-600 font-bold text-base">{e.employee_name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800 text-sm truncate">{e.employee_name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${e.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {e.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {e.mobile && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Phone className="h-3 w-3" />{e.mobile}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-teal-600 font-medium">
                    <IndianRupee className="h-3 w-3" />{Number(e.salary).toLocaleString()}/mo
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="h-3 w-3" />Due day {e.salary_due_day}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Link href={`/studio/employees/${e.id}/edit`}>
                  <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center active:bg-slate-200 transition-colors">
                    <Pencil className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                </Link>
                <DeleteEmployeeButton id={e.id} />
              </div>
            </div>
          </div>
        ))}
        {!employees.length && (
          <div className="text-center py-12 text-slate-400 text-sm">No employees yet.</div>
        )}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Mobile</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Salary (₹)</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Due Day</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {employees.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{e.employee_name}</td>
                <td className="px-4 py-3 text-slate-500">{e.mobile ?? "—"}</td>
                <td className="px-4 py-3">₹{Number(e.salary).toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-500">{e.salary_due_day}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{e.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Link href={`/studio/employees/${e.id}/edit`}><Button variant="ghost" size="sm" className="h-7 px-2"><Pencil className="h-3.5 w-3.5" /></Button></Link>
                    <DeleteEmployeeButton id={e.id} />
                  </div>
                </td>
              </tr>
            ))}
            {!employees.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No employees yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
