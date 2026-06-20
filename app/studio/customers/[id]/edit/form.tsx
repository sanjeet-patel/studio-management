"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCustomer } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Customer } from "@/types/database";

export function EditCustomerForm({ customer }: { customer: Customer }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCustomer(customer.id, new FormData(e.currentTarget));
      toast.success("Updated");
      router.push(`/studio/customers/${customer.id}`);
    } catch { toast.error("Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/studio/customers/${customer.id}`}><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold text-slate-800">Edit Customer</h1>
      </div>
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Customer Name *</Label><Input name="customer_name" defaultValue={customer.customer_name} required className="mt-1" /></div>
              <div><Label>Studio Name</Label><Input name="studio_name" defaultValue={customer.studio_name ?? ""} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Mobile</Label><Input name="mobile" defaultValue={customer.mobile ?? ""} className="mt-1" /></div>
              <div><Label>WhatsApp</Label><Input name="whatsapp" defaultValue={customer.whatsapp ?? ""} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>City</Label><Input name="city" defaultValue={customer.city ?? ""} className="mt-1" /></div>
              <div><Label>Address</Label><Input name="address" defaultValue={customer.address ?? ""} className="mt-1" /></div>
            </div>
            <div><Label>Notes</Label><Textarea name="notes" defaultValue={customer.notes ?? ""} className="mt-1" rows={2} /></div>
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>{loading ? "Saving…" : "Update Customer"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
