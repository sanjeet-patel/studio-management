"use client";
import { useState } from "react";
import { addPayment } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AddPaymentForm({ orderId, outstanding }: { orderId: string; outstanding: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("order_id", orderId);
      await addPayment(fd);
      toast.success("Payment recorded");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch { toast.error("Failed"); }
    finally { setLoading(false); }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader><CardTitle className="text-sm">Record Payment</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs">Amount (₹)</Label>
            <Input name="amount" type="number" step="0.01" defaultValue={outstanding} required className="mt-1 h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Date</Label>
            <Input name="payment_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required className="mt-1 h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Method</Label>
            <select name="payment_method" className="mt-1 w-full border rounded-lg px-2 py-1.5 text-sm">
              {["CASH","UPI","BANK_TRANSFER","CARD","CHEQUE","OTHER"].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <Button type="submit" size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
            {loading ? "Recording…" : "Record Payment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
