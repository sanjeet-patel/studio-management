"use client";
import { deleteCustomer } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteCustomerButton({ id }: { id: string }) {
  const router = useRouter();
  const handle = async () => {
    if (!confirm("Delete this customer?")) return;
    try { await deleteCustomer(id); toast.success("Deleted"); router.refresh(); }
    catch { toast.error("Failed to delete"); }
  };
  return (
    <Button variant="ghost" size="sm" className="h-7 px-2 text-red-500 hover:text-red-700" onClick={handle}>
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
