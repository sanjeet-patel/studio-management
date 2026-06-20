import { getTenants } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Download, Eye, Plus } from "lucide-react";
import { TenantActions } from "./tenant-actions";

const statusColor: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  TRIAL: "bg-amber-100 text-amber-700",
  SUSPENDED: "bg-red-100 text-red-700",
  EXPIRED: "bg-slate-100 text-slate-600",
};

export default async function TenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const { search, status } = await searchParams;
  const tenants = await getTenants(search, status);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Studios</h1>
        <Link href="/admin/tenants/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />New Studio
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <form className="flex gap-2 mb-4">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search studio name..."
          className="border rounded-lg px-3 py-1.5 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          name="status"
          defaultValue={status}
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="TRIAL">Trial</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="EXPIRED">Expired</option>
        </select>
        <Button type="submit" variant="outline" size="sm">Search</Button>
        <Link href="/admin/tenants">
          <Button variant="ghost" size="sm">Clear</Button>
        </Link>
      </form>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Studio</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Slug</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Trial Ends</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Joined</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tenants?.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/tenants/${t.id}`} className="text-indigo-600 hover:underline">
                    {t.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{t.slug}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[t.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {t.trial_ends_at ? new Date(t.trial_ends_at).toLocaleDateString("en-IN") : "—"}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(t.created_at).toLocaleDateString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Link href={`/admin/tenants/${t.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Link href={`/api/export/${t.id}`} target="_blank">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-emerald-600">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <TenantActions tenantId={t.id} status={t.status} />
                  </div>
                </td>
              </tr>
            ))}
            {!tenants?.length && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No studios found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
