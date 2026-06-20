import { getOrders } from "@/lib/actions/orders";
import Link from "next/link";
import { Plus, ChevronRight, Search, FileText } from "lucide-react";

const orderStatusColor: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  READY: "bg-emerald-100 text-emerald-700",
  DELIVERED: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-red-100 text-red-700",
};
const payStatusColor: Record<string, string> = {
  UNPAID: "bg-red-100 text-red-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
};

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string }> }) {
  const { search, status } = await searchParams;
  const orders = await getOrders(search, status);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800 md:text-2xl">Orders</h1>
        <Link
          href="/studio/orders/new"
          className="flex items-center gap-1.5 bg-teal-600 text-white px-3 py-2 rounded-xl text-sm font-medium active:bg-teal-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> New
        </Link>
      </div>

      {/* Filters */}
      <form className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input name="search" defaultValue={search} placeholder="Search orders…" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm" />
        </div>
        <select name="status" defaultValue={status} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none shadow-sm">
          <option value="">All</option>
          {["PENDING","PROCESSING","READY","DELIVERED","CANCELLED"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="submit" className="px-3 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium active:bg-teal-700">Go</button>
      </form>

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {orders.map((o, idx) => {
          const c = o.customers as { customer_name: string } | null;
          return (
            <Link
              key={o.id}
              href={`/studio/orders/${o.id}`}
              className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm card-lift animate-fade-up"
              style={{ animationDelay: `${0.05 * idx}s` }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-teal-600">{o.order_no}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${orderStatusColor[o.order_status] ?? ""}`}>
                    {o.order_status}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-800 truncate">{c?.customer_name ?? "Walk-in"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">{new Date(o.order_date).toLocaleDateString("en-IN")}</span>
                  <span className="text-xs font-bold text-slate-700">₹{Number(o.grand_total).toLocaleString()}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${payStatusColor[o.payment_status] ?? ""}`}>
                    {o.payment_status}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
            </Link>
          );
        })}
        {!orders.length && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-base font-medium">No orders yet</p>
            <p className="text-sm mt-1">Tap + New to create your first order</p>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl border overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-slate-50 border-b">
            <tr>
              {["Order No","Customer","Date","Total","Order Status","Payment","Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o) => {
              const c = o.customers as { customer_name: string } | null;
              return (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">
                    <Link href={`/studio/orders/${o.id}`} className="text-teal-600 hover:underline">{o.order_no}</Link>
                  </td>
                  <td className="px-4 py-3">{c?.customer_name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(o.order_date).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3 font-semibold">₹{Number(o.grand_total).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${orderStatusColor[o.order_status] ?? ""}`}>{o.order_status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${payStatusColor[o.payment_status] ?? ""}`}>{o.payment_status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link href={`/studio/orders/${o.id}`} className="px-2 py-1 text-xs rounded border hover:bg-slate-50">View</Link>
                      <Link href={`/studio/orders/${o.id}/invoice`} target="_blank" className="px-2 py-1 text-xs rounded border text-teal-600 hover:bg-teal-50 flex items-center gap-1"><FileText className="h-3 w-3" />Invoice</Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!orders.length && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
