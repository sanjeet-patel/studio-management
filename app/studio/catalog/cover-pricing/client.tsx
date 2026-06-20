"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertCoverPrice } from "@/lib/actions/catalog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

const SERVICE_MODES = [
  { value: "DESIGN_ONLY", label: "Design Only", short: "Design" },
  { value: "PRINT_ONLY", label: "Print Only", short: "Print" },
  { value: "DESIGN_PRINT", label: "Design + Print", short: "D+P" },
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
  const [openCover, setOpenCover] = useState<string | null>(coverTypes[0]?.id ?? null);
  const [saving, setSaving] = useState<string | null>(null);

  const saveCell = async (sizeId: string, coverId: string, mode: string) => {
    const key = `${sizeId}:${coverId}:${mode}`;
    setSaving(key);
    try {
      const fd = new FormData();
      fd.set("size_id", sizeId); fd.set("cover_type_id", coverId);
      fd.set("service_mode", mode); fd.set("price", String(prices[key] ?? 0));
      await upsertCoverPrice(fd); toast.success("Saved"); router.refresh();
    } catch { toast.error("Failed"); }
    finally { setSaving(null); }
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-xl font-bold text-slate-800">Cover Pricing Matrix</h1>

      {/* ── Mobile accordion ── */}
      <div className="md:hidden space-y-3">
        {coverTypes.map((cover: any) => (
          <div key={cover.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3.5 active:bg-slate-50 transition-colors"
              onClick={() => setOpenCover(openCover === cover.id ? null : cover.id)}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-xs">{cover.name.charAt(0)}</span>
                </div>
                <p className="font-semibold text-slate-800 text-sm">{cover.name}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${openCover === cover.id ? "rotate-180" : ""}`} />
            </button>

            {openCover === cover.id && (
              <div className="border-t border-slate-100">
                <div className="grid grid-cols-3 text-center border-b border-slate-100">
                  {SERVICE_MODES.map((m) => (
                    <div key={m.value} className="py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{m.short}</div>
                  ))}
                </div>
                <div className="divide-y divide-slate-100">
                  {sizes.map((size: any) => (
                    <div key={size.id} className="px-3 py-2">
                      <p className="text-xs font-medium text-slate-600 mb-1.5">{size.name}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {SERVICE_MODES.map((mode) => {
                          const key = `${size.id}:${cover.id}:${mode.value}`;
                          return (
                            <div key={mode.value} className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">₹</span>
                              <Input type="number" step="0.01" value={prices[key] ?? 0}
                                onChange={(e) => setPrices((p) => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                                onBlur={() => saveCell(size.id, cover.id, mode.value)}
                                className="h-9 text-sm pl-5 text-center" />
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
        {coverTypes.map((cover: any) => (
          <Card key={cover.id} className="border-0 shadow-sm">
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
                            <Input type="number" step="0.01" value={prices[key] ?? 0}
                              onChange={(e) => setPrices((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                              onBlur={() => saveCell(size.id, cover.id, mode.value)}
                              className="h-7 text-sm w-20 text-center mx-auto block" />
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
    </div>
  );
}
