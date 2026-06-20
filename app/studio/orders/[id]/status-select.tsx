"use client";
import { updateOrderStatus } from "@/lib/actions/orders";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const statuses = ["PENDING", "PROCESSING", "READY", "DELIVERED", "CANCELLED"];
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader><CardTitle className="text-sm">Order Status</CardTitle></CardHeader>
      <CardContent>
        <select
          value={currentStatus}
          onChange={async (e) => {
            try {
              await updateOrderStatus(orderId, e.target.value);
              toast.success("Status updated");
              router.refresh();
            } catch { toast.error("Failed"); }
          }}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </CardContent>
    </Card>
  );
}
