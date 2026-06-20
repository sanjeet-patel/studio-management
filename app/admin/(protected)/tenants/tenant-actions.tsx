"use client";

import { Button } from "@/components/ui/button";
import { updateTenantStatus } from "@/lib/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function TenantActions({ tenantId, status }: { tenantId: string; status: string }) {
  const router = useRouter();

  const toggle = async () => {
    const newStatus = status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    try {
      await updateTenantStatus(tenantId, newStatus);
      toast.success(`Studio ${newStatus === "ACTIVE" ? "activated" : "suspended"}`);
      router.refresh();
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-7 px-2 text-xs ${status === "SUSPENDED" ? "text-emerald-600" : "text-amber-600"}`}
      onClick={toggle}
    >
      {status === "SUSPENDED" ? "Activate" : "Suspend"}
    </Button>
  );
}
