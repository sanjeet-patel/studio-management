"use client";
import { CatalogPage } from "@/components/studio/catalog-page";
import { createPaperType, updatePaperType, deletePaperType } from "@/lib/actions/catalog";
import type { PaperType } from "@/types/database";
import { Input } from "@/components/ui/input";

export function CatalogPaperTypesClient({ items }: { items: PaperType[] }) {
  return (
    <CatalogPage
      title="Paper Types"
      items={items}
      extraHeaders={["Supports Velvet"]}
      extraCells={(item) => [item.supports_velvet ? "✓ Yes" : "No"]}
      extraFormFields={
        <div>
          <label className="text-xs text-slate-500 block mb-1">Supports Velvet</label>
          <select name="supports_velvet" className="border rounded px-2 py-1.5 text-sm h-8">
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
      }
      onAdd={createPaperType}
      onDelete={deletePaperType}
      onUpdate={updatePaperType}
    />
  );
}
