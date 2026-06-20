"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEmployee } from "@/lib/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewEmployeePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try { await createEmployee(new FormData(e.currentTarget)); toast.success("Employee added"); router.push("/studio/employees"); }
    catch { toast.error("Failed"); }
    finally { setLoading(false); }
  };
  return (
    <div className="max-w-md">
      <div className="flex items-center gap-3 mb-6"><Link href="/studio/employees"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link><h1 className="text-2xl font-bold text-slate-800">New Employee</h1></div>
      <Card className="border-0 shadow-sm"><CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Name *</Label><Input name="employee_name" required className="mt-1" /></div>
          <div><Label>Mobile</Label><Input name="mobile" className="mt-1" /></div>
          <div><Label>Joining Date</Label><Input name="joining_date" type="date" className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Monthly Salary (₹) *</Label><Input name="salary" type="number" step="0.01" required className="mt-1" /></div>
            <div><Label>Salary Due Day</Label><Input name="salary_due_day" type="number" min="1" max="31" defaultValue="1" className="mt-1" /></div>
          </div>
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>{loading ? "Saving…" : "Add Employee"}</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}
