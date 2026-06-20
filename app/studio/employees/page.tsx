import { getEmployees } from "@/lib/actions/finance";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { DeleteEmployeeButton } from "./delete-button";

export default async function EmployeesPage() {
  const employees = await getEmployees();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
        <Link href="/studio/employees/new"><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-2" />Add Employee</Button></Link>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
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
