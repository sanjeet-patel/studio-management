import { getOrder } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { OrderStatusSelect } from "./status-select";
import { AddPaymentForm } from "./add-payment";

const payStatusColor: Record<string, string> = {
  UNPAID: "bg-red-100 text-red-700", PARTIAL: "bg-amber-100 text-amber-700", PAID: "bg-emerald-100 text-emerald-700",
};
const orderStatusColor: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700", PROCESSING: "bg-blue-100 text-blue-700",
  READY: "bg-emerald-100 text-emerald-700", DELIVERED: "bg-slate-100 text-slate-600", CANCELLED: "bg-red-100 text-red-700",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) return <div className="text-slate-500">Order not found.</div>;

  const customer = order.customers as { customer_name: string; mobile: string | null } | null;
  const items = order.order_items as any[];
  const payments = order.payments as any[];
  const totalPaid = payments.reduce((s: number, p: any) => s + Number(p.amount), 0);
  const outstanding = Math.max(0, Number(order.grand_total) - totalPaid);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link href="/studio/orders"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-xl font-bold text-slate-800">{order.order_no}</h1>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${orderStatusColor[order.order_status]}`}>{order.order_status}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${payStatusColor[order.payment_status]}`}>{order.payment_status}</span>
        <div className="ml-auto flex gap-2">
          <Link href={`/studio/orders/${id}/invoice`} target="_blank">
            <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1" />Invoice</Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-sm">Order Information</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {[
                  ["Customer", customer?.customer_name ?? "Walk-in"],
                  ["Mobile", customer?.mobile ?? "—"],
                  ["Order Date", new Date(order.order_date).toLocaleDateString("en-IN")],
                  ["Delivery Date", order.delivery_date ? new Date(order.delivery_date).toLocaleDateString("en-IN") : "—"],
                  ["Delivery Mode", order.delivery_mode],
                  ["Notes", order.notes ?? "—"],
                ].map(([l, v]) => (
                  <div key={l}><dt className="text-slate-500">{l}</dt><dd className="font-medium">{v}</dd></div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-sm">Items ({items.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-slate-600">Description</th>
                    <th className="px-4 py-2 text-right text-slate-600">Qty</th>
                    <th className="px-4 py-2 text-right text-slate-600">Unit</th>
                    <th className="px-4 py-2 text-right text-slate-600">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item: any) => {
                    const desc = item.item_type === "PHOTO"
                      ? `Photo — ${item.sizes?.name ?? ""} / ${item.paper_types?.name ?? ""} / ${item.service_mode?.replace("_", " ") ?? ""}${item.needs_velvet ? " + Velvet" : ""}`
                      : item.item_type === "COVER"
                      ? `Cover — ${item.sizes?.name ?? ""} / ${item.cover_types?.name ?? ""} / ${item.service_mode?.replace("_", " ") ?? ""}`
                      : `Accessory — ${item.accessories?.name ?? ""}`;
                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-2">{desc}</td>
                        <td className="px-4 py-2 text-right">{item.qty}</td>
                        <td className="px-4 py-2 text-right">₹{Number(item.unit_price).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-semibold">₹{Number(item.line_total).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t bg-slate-50">
                  <tr><td colSpan={3} className="px-4 py-2 text-right text-slate-600">Subtotal</td><td className="px-4 py-2 text-right font-semibold">₹{Number(order.subtotal).toFixed(2)}</td></tr>
                  {Number(order.discount) > 0 && <tr><td colSpan={3} className="px-4 py-2 text-right text-slate-600">Discount</td><td className="px-4 py-2 text-right text-red-600">−₹{Number(order.discount).toFixed(2)}</td></tr>}
                  {Number(order.tax_percent) > 0 && <tr><td colSpan={3} className="px-4 py-2 text-right text-slate-600">Tax ({order.tax_percent}%)</td><td className="px-4 py-2 text-right">₹{(Number(order.grand_total) - (Number(order.subtotal) - Number(order.discount))).toFixed(2)}</td></tr>}
                  <tr><td colSpan={3} className="px-4 py-2 text-right font-bold">Grand Total</td><td className="px-4 py-2 text-right font-bold text-teal-600 text-base">₹{Number(order.grand_total).toFixed(2)}</td></tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <OrderStatusSelect orderId={id} currentStatus={order.order_status} />

          {/* Payment summary */}
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-sm">Payment</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Grand Total</span><span className="font-semibold">₹{Number(order.grand_total).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Paid</span><span className="font-semibold text-emerald-600">₹{totalPaid.toFixed(2)}</span></div>
              <div className="flex justify-between border-t pt-2"><span className="font-semibold">Outstanding</span><span className={`font-bold ${outstanding > 0 ? "text-red-600" : "text-emerald-600"}`}>₹{outstanding.toFixed(2)}</span></div>
            </CardContent>
          </Card>

          {/* Payments list */}
          {payments.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-sm">Payments ({payments.length})</CardTitle></CardHeader>
              <CardContent className="p-0">
                {payments.map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center px-4 py-2 border-b last:border-0 text-sm">
                    <div>
                      <p className="font-medium">₹{Number(p.amount).toFixed(2)}</p>
                      <p className="text-xs text-slate-400">{new Date(p.payment_date).toLocaleDateString("en-IN")} · {p.payment_method}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {outstanding > 0 && <AddPaymentForm orderId={id} outstanding={outstanding} />}
        </div>
      </div>
    </div>
  );
}
