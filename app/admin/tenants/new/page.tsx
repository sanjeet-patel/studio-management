"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTenant } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewTenantPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTenant(new FormData(e.currentTarget));
      toast.success("Studio created successfully");
      router.push("/admin/tenants");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create studio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/tenants"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold text-slate-800">New Studio</h1>
      </div>
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Studio Name</Label>
                <Input name="name" placeholder="Raj Photo Studio" required className="mt-1" />
              </div>
              <div>
                <Label>Slug</Label>
                <Input name="slug" placeholder="raj-photo" required className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Owner Name</Label>
              <Input name="owner_name" placeholder="Rajesh Kumar" required className="mt-1" />
            </div>
            <div>
              <Label>Owner Email</Label>
              <Input name="owner_email" type="email" placeholder="raj@studio.com" required className="mt-1" />
            </div>
            <div>
              <Label>Password</Label>
              <Input name="owner_password" type="password" placeholder="Min 8 characters" required minLength={8} className="mt-1" />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? "Creating…" : "Create Studio"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
