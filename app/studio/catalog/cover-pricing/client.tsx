"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertCoverPrice } from "@/lib/actions/catalog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const SERVICE_MODES = [
  { value: "DESIGN_ONLY", label: "Design Only" },
  { value: "PRINT_ONLY", label: "Print Only" },
  { value: "DESIGN_PRINT", label: "Design + Print" },
];

type MatrixData = Awaited<ReturnType<typeof import("@/lib/actions/catalog").getCoverPricingMatrix>>;

export function CoverPricingClient({ data }: { data: MatrixData }) {
  const router = useRouter();
  const sizes = data.sizes as any[];
  const coverTypes = data.coverTypes as any[];
  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    (data.pricing as any[]).forEach((p: any) => {
      map[`${p.size_id}:${p.cover_type_id}:${p.service_mode}`] = Number(p.price);
    });
    return map;
  });

  const saveCell = async (sizeId: string, coverId: string, mode: string) => {
    try {
      const fd = new FormData();
      fd.set("size_id", sizeId);
      fd.set("cover_type_id", coverId);
      fd.set("service_mode", mode);
      fd.set("price", String(prices[`${sizeId}:${coverId}:${mode}`] ?? 0));
      await upsertCoverPrice(fd);
      toast.success("Saved");
      router.refresh();
    } catch { toast.error("Failed"); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Cover Pricing Matrix</h1>
      {coverTypes.map((cover: any) => (
        <Card key={cover.id} className="border-0 shadow-sm mb-4">
          <CardHeader><CardTitle className="text-sm">{cover.name}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-600">Size</th>
                  {SERVICE_MODES.map((m) => <th key={m.value} className="px-4 py-2 text-center text-slate-600">{m.label}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y">
                {sizes.map((size: any) => (
                  <tr key={size.id}>
                    <td className="px-4 py-2 font-medium">{size.name}</td>
                    {SERVICE_MODES.map((mode) => {
                      const key = `${size.id}:${cover.id}:${mode.value}`;
                      return (
                        <td key={mode.value} className="px-2 py-1">
                          <Input
                            type="number" step="0.01"
                            value={prices[key] ?? 0}
                            onChange={(e) => setPrices((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                            onBlur={() => saveCell(size.id, cover.id, mode.value)}
                            className="h-7 text-sm w-20 text-center mx-auto block"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
