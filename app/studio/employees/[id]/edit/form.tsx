"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateEmployee } from "@/lib/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Employee } from "@/types/database";

export function EditEmployeeForm({ employee: e }: { employee: Employee }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setLoading(true);
    try { await updateEmployee(e.id, new FormData(ev.currentTarget)); toast.success("Updated"); router.push("/studio/employees"); }
    catch { toast.error("Failed"); }
    finally { setLoading(false); }
  };
  return (
    <div className="max-w-md">
      <div className="flex items-center gap-3 mb-6"><Link href="/studio/employees"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link><h1 className="text-2xl font-bold text-slate-800">Edit Employee</h1></div>
      <Card className="border-0 shadow-sm"><CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Name *</Label><Input name="employee_name" defaultValue={e.employee_name} required className="mt-1" /></div>
          <div><Label>Mobile</Label><Input name="mobile" defaultValue={e.mobile ?? ""} className="mt-1" /></div>
          <div><Label>Joining Date</Label><Input name="joining_date" type="date" defaultValue={e.joining_date ?? ""} className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Monthly Salary (₹)</Label><Input name="salary" type="number" step="0.01" defaultValue={e.salary} className="mt-1" /></div>
            <div><Label>Due Day</Label><Input name="salary_due_day" type="number" min="1" max="31" defaultValue={e.salary_due_day} className="mt-1" /></div>
          </div>
          <div><Label>Status</Label><select name="status" defaultValue={e.status} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>{loading ? "Saving…" : "Update Employee"}</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}
