"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertPhotoPrice, updateVelvetRate } from "@/lib/actions/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

const SERVICE_MODES = [
  { value: "DESIGN_ONLY", label: "Design Only", short: "Design" },
  { value: "PRINT_ONLY", label: "Print Only", short: "Print" },
  { value: "DESIGN_PRINT", label: "Design + Print", short: "D+P" },
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
  const [openPaper, setOpenPaper] = useState<string | null>(papers[0]?.id ?? null);

  const saveCell = async (sizeId: string, paperId: string, mode: string) => {
    const key = `${sizeId}:${paperId}:${mode}`;
    setSaving(key);
    try {
      const fd = new FormData();
      fd.set("size_id", sizeId); fd.set("paper_type_id", paperId);
      fd.set("service_mode", mode); fd.set("base_price", String(prices[key] ?? 0));
      await upsertPhotoPrice(fd); toast.success("Saved"); router.refresh();
    } catch { toast.error("Failed"); }
    finally { setSaving(null); }
  };

  const saveVelvet = async () => {
    try {
      const fd = new FormData();
      fd.set("rate", String(velvetRate));
      if (data.velvetRateId) fd.set("id", data.velvetRateId);
      await updateVelvetRate(fd); toast.success("Velvet rate updated"); router.refresh();
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Header + velvet rate */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <h1 className="text-xl font-bold text-slate-800">Photo Pricing Matrix</h1>
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm border border-slate-100 self-start">
          <span className="text-xs text-slate-500">Velvet surcharge</span>
          <span className="text-xs text-slate-400">₹</span>
          <Input type="number" step="0.01" value={velvetRate} onChange={(e) => setVelvetRate(parseFloat(e.target.value) || 0)} className="h-7 text-sm w-16 text-center" />
          <span className="text-xs text-slate-400">/pc</span>
          <Button size="sm" onClick={saveVelvet} className="h-7 text-xs bg-teal-600">Save</Button>
        </div>
      </div>

      {/* ── Mobile accordion ── */}
      <div className="md:hidden space-y-3">
        {papers.map((paper: any) => (
          <div key={paper.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Accordion header */}
            <button
              className="w-full flex items-center justify-between px-4 py-3.5 active:bg-slate-50 transition-colors"
              onClick={() => setOpenPaper(openPaper === paper.id ? null : paper.id)}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                  <span className="text-teal-600 font-bold text-xs">{paper.name.charAt(0)}</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800 text-sm">{paper.name}</p>
                  {paper.supports_velvet && <span className="text-[10px] text-teal-600 font-medium">Velvet supported</span>}
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${openPaper === paper.id ? "rotate-180" : ""}`} />
            </button>

            {openPaper === paper.id && (
              <div className="border-t border-slate-100">
                {/* Mode tabs */}
                <div className="grid grid-cols-3 text-center border-b border-slate-100">
                  {SERVICE_MODES.map((m) => (
                    <div key={m.value} className="py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{m.short}</div>
                  ))}
                </div>
                {/* Size rows */}
                <div className="divide-y divide-slate-100">
                  {sizes.map((size: any) => (
                    <div key={size.id} className="px-3 py-2">
                      <p className="text-xs font-medium text-slate-600 mb-1.5">{size.name}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {SERVICE_MODES.map((mode) => {
                          const key = `${size.id}:${paper.id}:${mode.value}`;
                          return (
                            <div key={mode.value} className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">₹</span>
                              <Input
                                type="number" step="0.01"
                                value={prices[key] ?? 0}
                                onChange={(e) => setPrices((p) => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                                onBlur={() => saveCell(size.id, paper.id, mode.value)}
                                className="h-9 text-sm pl-5 text-center"
                              />
                              {saving === key && <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] text-teal-500">●</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        <p className="text-xs text-slate-400 text-center">Values auto-save on blur</p>
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block space-y-4">
        {papers.map((paper: any) => (
          <Card key={paper.id} className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                {paper.name}
                {paper.supports_velvet && <span className="px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-700">Velvet Supported</span>}
              </CardTitle>
            </CardHeader>
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
                        const key = `${size.id}:${paper.id}:${mode.value}`;
                        return (
                          <td key={mode.value} className="px-2 py-1">
                            <div className="flex gap-1 justify-center">
                              <Input type="number" step="0.01" value={prices[key] ?? 0}
                                onChange={(e) => setPrices((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                                onBlur={() => saveCell(size.id, paper.id, mode.value)}
                                className="h-7 text-sm w-20 text-center" />
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
        <p className="text-xs text-slate-400">Prices auto-save on blur. Velvet surcharge is per piece, added on top of base price.</p>
      </div>
    </div>
  );
}
