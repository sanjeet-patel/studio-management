"use client";
import { deleteEmployee } from "@/lib/actions/finance";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteEmployeeButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <Button variant="ghost" size="sm" className="h-7 px-2 text-red-500 hover:text-red-700"
      onClick={async () => {
        if (!confirm("Delete this employee?")) return;
        try { await deleteEmployee(id); toast.success("Deleted"); router.refresh(); }
        catch { toast.error("Failed"); }
      }}>
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
