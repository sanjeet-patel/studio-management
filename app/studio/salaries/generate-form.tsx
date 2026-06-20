"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateSalaries } from "@/lib/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function GenerateSalariesForm({ currentMonth }: { currentMonth?: string }) {
  const [month, setMonth] = useState(currentMonth ?? new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <div className="flex gap-2 items-center">
      <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-9 text-sm w-40" />
      <Button
        variant="outline"
        size="sm"
        onClick={async () => {
          router.push(`/studio/salaries?month=${month}`);
        }}
      >View</Button>
      <Button
        className="bg-indigo-600 hover:bg-indigo-700"
        size="sm"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          try { await generateSalaries(month); toast.success("Salaries generated"); router.push(`/studio/salaries?month=${month}`); router.refresh(); }
          catch { toast.error("Failed"); }
          finally { setLoading(false); }
        }}
      >{loading ? "…" : "Generate"}</Button>
    </div>
  );
}
