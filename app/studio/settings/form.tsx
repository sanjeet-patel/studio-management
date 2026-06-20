"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStudioSettings } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { Tenant } from "@/types/database";

export function SettingsForm({ tenant }: { tenant: Tenant | null }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!tenant) return <div>No studio found.</div>;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try { await updateStudioSettings(new FormData(e.currentTarget)); toast.success("Settings saved"); router.refresh(); }
    catch { toast.error("Failed to save"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Studio Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">Studio Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Studio Name *</Label><Input name="name" defaultValue={tenant.name} required className="mt-1" /></div>
              <div><Label>Tagline</Label><Input name="tagline" defaultValue={tenant.tagline ?? ""} className="mt-1" /></div>
            </div>
            <div><Label>Address</Label><Input name="address" defaultValue={tenant.address ?? ""} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>City</Label><Input name="city" defaultValue={tenant.city ?? ""} className="mt-1" /></div>
              <div><Label>PIN</Label><Input name="pin" defaultValue={tenant.pin ?? ""} className="mt-1" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input name="phone" defaultValue={tenant.phone ?? ""} className="mt-1" /></div>
              <div><Label>WhatsApp</Label><Input name="whatsapp" defaultValue={tenant.whatsapp ?? ""} className="mt-1" /></div>
            </div>
            <div><Label>Email</Label><Input name="email" type="email" defaultValue={tenant.email ?? ""} className="mt-1" /></div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">Billing Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>GST Number</Label><Input name="gst_number" defaultValue={tenant.gst_number ?? ""} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Invoice Prefix</Label><Input name="invoice_prefix" defaultValue={tenant.invoice_prefix} className="mt-1" placeholder="INV" /></div>
              <div><Label>Order Prefix</Label><Input name="order_prefix" defaultValue={tenant.order_prefix} className="mt-1" placeholder="ORD" /></div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={loading}>{loading ? "Saving…" : "Save Settings"}</Button>
      </form>
    </div>
  );
}
