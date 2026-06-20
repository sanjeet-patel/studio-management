"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSubscription } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function NewSubForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenant_id") ?? "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createSubscription(new FormData(e.currentTarget));
      toast.success("Subscription created");
      router.push(tenantId ? `/admin/tenants/${tenantId}` : "/admin/subscriptions");
    } catch {
      toast.error("Failed to create subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/subscriptions"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold text-slate-800">New Subscription</h1>
      </div>
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="tenant_id" value={tenantId} />
            <div>
              <Label>Plan</Label>
              <select name="plan" required className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
                <option value="basic">Basic</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input name="starts_at" type="date" required className="mt-1" />
              </div>
              <div>
                <Label>End Date</Label>
                <Input name="ends_at" type="date" required className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Amount (₹)</Label>
              <Input name="amount" type="number" step="0.01" required className="mt-1" />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? "Creating…" : "Create Subscription"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewSubscriptionPage() {
  return <Suspense><NewSubForm /></Suspense>;
}
