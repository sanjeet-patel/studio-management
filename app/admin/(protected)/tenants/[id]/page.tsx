import { getTenant } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Download, ShoppingBag, Users } from "lucide-react";
import { TenantActions } from "../tenant-actions";

const statusColor: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  TRIAL: "bg-amber-100 text-amber-700",
  SUSPENDED: "bg-red-100 text-red-700",
  EXPIRED: "bg-slate-100 text-slate-600",
};

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { tenant, stats } = await getTenant(id);

  const users = tenant.users as Array<{ id: string; name: string; email: string; role: string }>;
  const subs = tenant.subscriptions as Array<{ id: string; plan: string; status: string; starts_at: string | null; ends_at: string | null; amount: number }>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link href="/admin/tenants"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold text-slate-800">{tenant.name}</h1>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[tenant.status] ?? ""}`}>
          {tenant.status}
        </span>
        <div className="ml-auto flex gap-2">
          <Link href={`/api/export/${tenant.id}`} target="_blank">
            <Button variant="outline" size="sm" className="text-emerald-700 border-emerald-200">
              <Download className="h-4 w-4 mr-1" />Export Data
            </Button>
          </Link>
          <TenantActions tenantId={tenant.id} status={tenant.status} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Orders", value: stats.orders, icon: ShoppingBag },
          { label: "Customers", value: stats.customers, icon: Users },
          { label: "Trial Ends", value: tenant.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleDateString("en-IN") : "N/A", icon: null },
          { label: "Joined", value: new Date(tenant.created_at).toLocaleDateString("en-IN"), icon: null },
        ].map((card) => (
          <Card key={card.label} className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <p className="text-lg font-bold text-slate-800">{card.value}</p>
              <p className="text-xs text-slate-500">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Users */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">Users</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-600">Name</th>
                  <th className="px-4 py-2 text-left text-slate-600">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users?.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-2 font-medium">{u.name}</td>
                    <td className="px-4 py-2 text-slate-500 text-xs">{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Subscriptions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Subscriptions</CardTitle>
            <Link href={`/admin/subscriptions/new?tenant_id=${tenant.id}`}>
              <Button size="sm" variant="outline">+ Add</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-600">Plan</th>
                  <th className="px-4 py-2 text-left text-slate-600">Amount</th>
                  <th className="px-4 py-2 text-left text-slate-600">Ends</th>
                  <th className="px-4 py-2 text-left text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subs?.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2 font-medium capitalize">{s.plan}</td>
                    <td className="px-4 py-2">₹{s.amount?.toLocaleString()}</td>
                    <td className="px-4 py-2 text-slate-500">{s.ends_at ? new Date(s.ends_at).toLocaleDateString("en-IN") : "—"}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!subs?.length && (
                  <tr><td colSpan={4} className="px-4 py-4 text-center text-slate-400">No subscriptions.</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
