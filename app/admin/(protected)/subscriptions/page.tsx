import { getAllSubscriptions } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function SubscriptionsPage() {
  const subs = await getAllSubscriptions();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Subscriptions</h1>
        <Link href="/admin/subscriptions/new">
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4 mr-2" />New Subscription
          </Button>
        </Link>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Studio</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Plan</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Amount</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Start</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">End</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {subs.map((s) => {
              const t = s.tenants as { name: string; slug: string } | null;
              return (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{t?.name ?? "—"}</td>
                  <td className="px-4 py-3 capitalize">{s.plan}</td>
                  <td className="px-4 py-3">₹{s.amount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-500">{s.starts_at ? new Date(s.starts_at).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{s.ends_at ? new Date(s.ends_at).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!subs.length && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No subscriptions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
