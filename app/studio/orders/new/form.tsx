"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createOrder, getOrderFormData } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

type FormData = Awaited<ReturnType<typeof getOrderFormData>>;

interface OrderItem {
  id: string;
  item_type: "PHOTO" | "COVER" | "ACCESSORY";
  size_id: string;
  paper_type_id: string;
  cover_type_id: string;
  accessory_id: string;
  service_mode: string;
  needs_velvet: boolean;
  velvet_rate: number;
  qty: number;
  unit_price: number;
  line_total: number;
  description: string;
}

export function NewOrderForm({ data }: { data: FormData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [taxPct, setTaxPct] = useState(0);

  const subtotal = items.reduce((s, i) => s + i.line_total, 0);
  const grandTotal = (subtotal - discount) * (1 + taxPct / 100);

  const addItem = (type: "PHOTO" | "COVER" | "ACCESSORY") => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        item_type: type,
        size_id: "",
        paper_type_id: "",
        cover_type_id: "",
        accessory_id: "",
        service_mode: "DESIGN_PRINT",
        needs_velvet: false,
        velvet_rate: data.velvetRate,
        qty: 1,
        unit_price: 0,
        line_total: 0,
        description: "",
      },
    ]);
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id: string, updates: Partial<OrderItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };

        // Recalculate unit price from pricing matrix
        if (updated.item_type === "PHOTO" && updated.size_id && updated.paper_type_id && updated.service_mode) {
          const px = data.photoPricing.find(
            (p) => p.size_id === updated.size_id && p.paper_type_id === updated.paper_type_id && p.service_mode === updated.service_mode
          );
          updated.unit_price = px ? Number(px.base_price) : 0;
        } else if (updated.item_type === "COVER" && updated.size_id && updated.cover_type_id && updated.service_mode) {
          const cx = data.coverPricing.find(
            (p) => p.size_id === updated.size_id && p.cover_type_id === updated.cover_type_id && p.service_mode === updated.service_mode
          );
          updated.unit_price = cx ? Number(cx.price) : 0;
        }

        // Velvet surcharge
        const velvetSurcharge = updated.needs_velvet ? data.velvetRate : 0;
        updated.line_total = updated.qty * (updated.unit_price + velvetSurcharge);
        return updated;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!items.length) { toast.error("Add at least one item"); return; }
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("items", JSON.stringify(items));
      fd.set("discount", String(discount));
      fd.set("tax_percent", String(taxPct));
      const { orderId } = await createOrder(fd);
      toast.success("Order created");
      router.push(`/studio/orders/${orderId}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  };

  const serviceModes = [
    { value: "DESIGN_ONLY", label: "Design Only" },
    { value: "PRINT_ONLY", label: "Print Only" },
    { value: "DESIGN_PRINT", label: "Design + Print" },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/studio/orders"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold text-slate-800">New Order</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-4 mb-4">
          {/* Order Info */}
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Order Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer</Label>
                  <select name="customer_id" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">— Walk-in —</option>
                    {data.customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.customer_name}{c.studio_name ? ` (${c.studio_name})` : ""}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Order Date</Label>
                  <Input name="order_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Delivery Date</Label>
                  <Input name="delivery_date" type="date" className="mt-1" />
                </div>
                <div>
                  <Label>Delivery Mode</Label>
                  <select name="delivery_mode" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="PICKUP">Pickup</option>
                    <option value="COURIER">Courier</option>
                    <option value="HOME_DELIVERY">Home Delivery</option>
                  </select>
                </div>
              </div>
              <div><Label>Notes</Label><Textarea name="notes" className="mt-1" rows={2} /></div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="font-medium">₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
              <div>
                <Label className="text-xs">Discount (₹)</Label>
                <Input type="number" step="0.01" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className="mt-1 h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Tax (%)</Label>
                <Input type="number" step="0.01" value={taxPct} onChange={(e) => setTaxPct(parseFloat(e.target.value) || 0)} className="mt-1 h-8 text-sm" />
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Grand Total</span>
                <span className="text-indigo-600">₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items */}
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Order Items</CardTitle>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => addItem("PHOTO")}>+ Photo</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => addItem("COVER")}>+ Cover</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => addItem("ACCESSORY")}>+ Accessory</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 && (
              <p className="text-center text-slate-400 py-4">No items yet. Add Photo, Cover, or Accessory above.</p>
            )}
            {items.map((item, idx) => (
              <div key={item.id} className="border rounded-lg p-4 relative">
                <button type="button" onClick={() => removeItem(item.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
                <p className="text-xs font-semibold text-indigo-600 uppercase mb-3">{item.item_type} #{idx + 1}</p>

                {item.item_type !== "ACCESSORY" && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <Label className="text-xs">Size</Label>
                      <select className="mt-1 w-full border rounded px-2 py-1.5 text-sm" value={item.size_id} onChange={(e) => updateItem(item.id, { size_id: e.target.value })}>
                        <option value="">Select</option>
                        {data.sizes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    {item.item_type === "PHOTO" && (
                      <div>
                        <Label className="text-xs">Paper Type</Label>
                        <select className="mt-1 w-full border rounded px-2 py-1.5 text-sm" value={item.paper_type_id} onChange={(e) => updateItem(item.id, { paper_type_id: e.target.value })}>
                          <option value="">Select</option>
                          {data.paperTypes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                    )}
                    {item.item_type === "COVER" && (
                      <div>
                        <Label className="text-xs">Cover Type</Label>
                        <select className="mt-1 w-full border rounded px-2 py-1.5 text-sm" value={item.cover_type_id} onChange={(e) => updateItem(item.id, { cover_type_id: e.target.value })}>
                          <option value="">Select</option>
                          {data.coverTypes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs">Service Mode</Label>
                      <select className="mt-1 w-full border rounded px-2 py-1.5 text-sm" value={item.service_mode} onChange={(e) => updateItem(item.id, { service_mode: e.target.value })}>
                        {serviceModes.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>
                    {item.item_type === "PHOTO" && (() => {
                      const pt = data.paperTypes.find((p) => p.id === item.paper_type_id);
                      if (!pt?.supports_velvet) return null;
                      return (
                        <div className="flex items-end gap-2">
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={item.needs_velvet} onChange={(e) => updateItem(item.id, { needs_velvet: e.target.checked })} className="rounded" />
                            Velvet (+₹{data.velvetRate}/pc)
                          </label>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {item.item_type === "ACCESSORY" && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label className="text-xs">Accessory</Label>
                      <select className="mt-1 w-full border rounded px-2 py-1.5 text-sm" value={item.accessory_id} onChange={(e) => {
                        const acc = data.accessories.find((a) => a.id === e.target.value);
                        updateItem(item.id, { accessory_id: e.target.value, unit_price: acc?.default_price ?? 0, line_total: (acc?.default_price ?? 0) * item.qty });
                      }}>
                        <option value="">Select</option>
                        {data.accessories.map((a) => <option key={a.id} value={a.id}>{a.name} (₹{a.default_price})</option>)}
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Qty</Label>
                    <Input type="number" min="1" value={item.qty} onChange={(e) => updateItem(item.id, { qty: parseInt(e.target.value) || 1 })} className="mt-1 h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Unit Price (₹)</Label>
                    <Input type="number" step="0.01" value={item.unit_price} onChange={(e) => updateItem(item.id, { unit_price: parseFloat(e.target.value) || 0 })} className="mt-1 h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Line Total</Label>
                    <div className="mt-1 h-8 border rounded px-2 flex items-center text-sm font-semibold text-indigo-600 bg-slate-50">
                      ₹{item.line_total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-8" disabled={loading}>
            {loading ? "Creating…" : "Create Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
