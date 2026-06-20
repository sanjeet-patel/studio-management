import { getOrder } from "@/lib/actions/orders";
import { createClient } from "@/lib/supabase/server";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) return <div>Not found</div>;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: rawProfile } = await supabase.from("users").select("tenant_id, tenants(*)").eq("id", user!.id).single();
  const profile = rawProfile as any;
  const tenant = profile?.tenants as any;

  const customer = order.customers as any;
  const items = order.order_items as any[];
  const payments = order.payments as any[];
  const totalPaid = payments.reduce((s: number, p: any) => s + Number(p.amount), 0);
  const outstanding = Math.max(0, Number(order.grand_total) - totalPaid);

  return (
    <html>
      <head>
        <title>Invoice {order.order_no}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; background: white; }
          .page { max-width: 800px; margin: 0 auto; padding: 32px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #4f46e5; padding-bottom: 16px; }
          .brand { font-size: 20px; font-weight: 700; color: #4f46e5; }
          .brand-sub { font-size: 11px; color: #64748b; }
          .invoice-meta { text-align: right; }
          .invoice-meta h2 { font-size: 24px; font-weight: 700; color: #4f46e5; }
          .section { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
          .box { background: #f8fafc; border-radius: 8px; padding: 12px; }
          .box-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 6px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          thead { background: #4f46e5; color: white; }
          th { padding: 8px 10px; text-align: left; font-size: 12px; }
          td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
          .text-right { text-align: right; }
          .totals { max-width: 280px; margin-left: auto; }
          .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
          .grand-total { font-size: 16px; font-weight: 700; color: #4f46e5; border-top: 2px solid #4f46e5; padding-top: 8px; margin-top: 4px; }
          .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          @media print { .no-print { display: none; } }
        `}</style>
      </head>
      <body>
        <div className="page">
          {/* Print button */}
          <div className="no-print" style={{ textAlign: "right", marginBottom: 16 }}>
            <button onClick={() => window.print()} style={{ background: "#4f46e5", color: "white", border: "none", borderRadius: 6, padding: "8px 20px", cursor: "pointer", fontSize: 13 }}>
              Print / Save PDF
            </button>
          </div>

          <div className="header">
            <div>
              <div className="brand">{tenant?.name ?? "Studio"}</div>
              <div className="brand-sub">{tenant?.address ?? ""} {tenant?.city ?? ""}</div>
              <div className="brand-sub">{tenant?.phone ?? ""} · {tenant?.email ?? ""}</div>
              {tenant?.gst_number && <div className="brand-sub">GST: {tenant.gst_number}</div>}
            </div>
            <div className="invoice-meta">
              <h2>INVOICE</h2>
              <div style={{ fontSize: 12, color: "#64748b" }}>{order.order_no}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Date: {new Date(order.order_date).toLocaleDateString("en-IN")}</div>
              {order.delivery_date && <div style={{ fontSize: 12, color: "#64748b" }}>Delivery: {new Date(order.delivery_date).toLocaleDateString("en-IN")}</div>}
            </div>
          </div>

          <div className="section">
            <div className="box">
              <div className="box-title">Bill To</div>
              <div style={{ fontWeight: 600 }}>{customer?.customer_name ?? "Walk-in"}</div>
              {customer?.studio_name && <div style={{ color: "#64748b", fontSize: 12 }}>{customer.studio_name}</div>}
              {customer?.mobile && <div style={{ color: "#64748b", fontSize: 12 }}>📞 {customer.mobile}</div>}
            </div>
            <div className="box">
              <div className="box-title">Order Status</div>
              <div><strong>{order.order_status}</strong></div>
              <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>Payment: {order.payment_status}</div>
              <div style={{ color: "#64748b", fontSize: 12 }}>Mode: {order.delivery_mode}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Rate (₹)</th>
                <th className="text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, i: number) => {
                const desc = item.item_type === "PHOTO"
                  ? `Photo — ${item.sizes?.name ?? ""} / ${item.paper_types?.name ?? ""} / ${item.service_mode?.replace(/_/g, " ") ?? ""}${item.needs_velvet ? " + Velvet" : ""}`
                  : item.item_type === "COVER"
                  ? `Cover — ${item.sizes?.name ?? ""} / ${item.cover_types?.name ?? ""} / ${item.service_mode?.replace(/_/g, " ") ?? ""}`
                  : `Accessory — ${item.accessories?.name ?? ""}`;
                return (
                  <tr key={item.id}>
                    <td>{i + 1}</td>
                    <td>{desc}</td>
                    <td className="text-right">{item.qty}</td>
                    <td className="text-right">{Number(item.unit_price).toFixed(2)}</td>
                    <td className="text-right">{Number(item.line_total).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="totals">
            <div className="totals-row"><span>Subtotal</span><span>₹{Number(order.subtotal).toFixed(2)}</span></div>
            {Number(order.discount) > 0 && <div className="totals-row" style={{ color: "#dc2626" }}><span>Discount</span><span>−₹{Number(order.discount).toFixed(2)}</span></div>}
            {Number(order.tax_percent) > 0 && <div className="totals-row"><span>Tax ({order.tax_percent}%)</span><span>₹{(Number(order.grand_total) - (Number(order.subtotal) - Number(order.discount))).toFixed(2)}</span></div>}
            <div className="totals-row grand-total"><span>Grand Total</span><span>₹{Number(order.grand_total).toFixed(2)}</span></div>
            {totalPaid > 0 && <div className="totals-row" style={{ color: "#16a34a", marginTop: 8 }}><span>Amount Paid</span><span>₹{totalPaid.toFixed(2)}</span></div>}
            {outstanding > 0 && <div className="totals-row" style={{ color: "#dc2626", fontWeight: 600 }}><span>Balance Due</span><span>₹{outstanding.toFixed(2)}</span></div>}
          </div>

          {payments.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", marginBottom: 6 }}>Payment History</div>
              <table>
                <thead><tr><th>Date</th><th>Method</th><th className="text-right">Amount</th></tr></thead>
                <tbody>
                  {payments.map((p: any) => (
                    <tr key={p.id}>
                      <td>{new Date(p.payment_date).toLocaleDateString("en-IN")}</td>
                      <td>{p.payment_method}</td>
                      <td className="text-right">₹{Number(p.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="footer">
            <div>Thank you for your business! · {tenant?.name ?? "Studio"}</div>
            {tenant?.whatsapp && <div>WhatsApp: {tenant.whatsapp}</div>}
          </div>
        </div>
      </body>
    </html>
  );
}
