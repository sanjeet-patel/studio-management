"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertPhotoPrice, updateVelvetRate } from "@/lib/actions/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const SERVICE_MODES = [
  { value: "DESIGN_ONLY", label: "Design Only" },
  { value: "PRINT_ONLY", label: "Print Only" },
  { value: "DESIGN_PRINT", label: "Design + Print" },
];

type MatrixData = Awaited<ReturnType<typeof import("@/lib/actions/catalog").getPhotoPricingMatrix>>;

export function PhotoPricingClient({ data }: { data: MatrixData }) {
  const router = useRouter();
  const sizes = data.sizes as any[];
  const papers = data.papers as any[];
  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    (data.pricing as any[]).forEach((p: any) => {
      map[`${p.size_id}:${p.paper_type_id}:${p.service_mode}`] = Number(p.base_price);
    });
    return map;
  });
  const [velvetRate, setVelvetRate] = useState(Number(data.velvetRate));
  const [saving, setSaving] = useState<string | null>(null);

  const saveCell = async (sizeId: string, paperId: string, mode: string) => {
    const key = `${sizeId}:${paperId}:${mode}`;
    setSaving(key);
    try {
      const fd = new FormData();
      fd.set("size_id", sizeId);
      fd.set("paper_type_id", paperId);
      fd.set("service_mode", mode);
      fd.set("base_price", String(prices[key] ?? 0));
      await upsertPhotoPrice(fd);
      toast.success("Saved");
      router.refresh();
    } catch { toast.error("Failed"); }
    finally { setSaving(null); }
  };

  const saveVelvet = async () => {
    try {
      const fd = new FormData();
      fd.set("rate", String(velvetRate));
      if (data.velvetRateId) fd.set("id", data.velvetRateId);
      await updateVelvetRate(fd);
      toast.success("Velvet rate updated");
      router.refresh();
    } catch { toast.error("Failed"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Photo Pricing Matrix</h1>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-3 pb-3 flex items-center gap-2">
            <span className="text-sm text-slate-600">Velvet Surcharge:</span>
            <span className="text-xs text-slate-400">₹</span>
            <Input type="number" step="0.01" value={velvetRate} onChange={(e) => setVelvetRate(parseFloat(e.target.value) || 0)} className="h-7 text-sm w-20" />
            <span className="text-xs text-slate-400">/piece</span>
            <Button size="sm" onClick={saveVelvet} className="h-7 bg-teal-600">Save</Button>
          </CardContent>
        </Card>
      </div>

      {papers.map((paper: any) => (
        <Card key={paper.id} className="border-0 shadow-sm mb-4">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              {paper.name}
              {paper.supports_velvet && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">Velvet Supported</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-600">Size</th>
                  {SERVICE_MODES.map((m) => (
                    <th key={m.value} className="px-4 py-2 text-center text-slate-600">{m.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {sizes.map((size: any) => (
                  <tr key={size.id}>
                    <td className="px-4 py-2 font-medium">{size.name}</td>
                    {SERVICE_MODES.map((mode) => {
                      const key = `${size.id}:${paper.id}:${mode.value}`;
                      return (
                        <td key={mode.value} className="px-2 py-1">
                          <div className="flex gap-1 justify-center">
                            <Input
                              type="number"
                              step="0.01"
                              value={prices[key] ?? 0}
                              onChange={(e) => setPrices((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                              onBlur={() => saveCell(size.id, paper.id, mode.value)}
                              className="h-7 text-sm w-20 text-center"
                            />
                          </div>
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
      <p className="text-xs text-slate-400 mt-2">Prices auto-save on blur. Velvet surcharge is per piece, added on top of base price.</p>
    </div>
  );
}
