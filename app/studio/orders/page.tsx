import { getOrders } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

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

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const { search, status } = await searchParams;
  const orders = await getOrders(search, status);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
        <Link href="/studio/orders/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-2" />New Order</Button>
        </Link>
      </div>

      <form className="flex gap-2 mb-4">
        <input name="search" defaultValue={search} placeholder="Search order / customer…" className="border rounded-lg px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <select name="status" defaultValue={status} className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none">
          <option value="">All Status</option>
          {["PENDING","PROCESSING","READY","DELIVERED","CANCELLED"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="sm">Search</Button>
      </form>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Order No</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Customer</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Total</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Order Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Payment</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o) => {
              const c = o.customers as { customer_name: string } | null;
              return (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">
                    <Link href={`/studio/orders/${o.id}`} className="text-indigo-600 hover:underline">{o.order_no}</Link>
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
                      <Link href={`/studio/orders/${o.id}`}><Button variant="ghost" size="sm" className="h-7 text-xs px-2">View</Button></Link>
                      <Link href={`/studio/orders/${o.id}/invoice`} target="_blank"><Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-indigo-600">Invoice</Button></Link>
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
