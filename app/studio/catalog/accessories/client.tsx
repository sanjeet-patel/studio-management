"use client";
import { CatalogPage } from "@/components/studio/catalog-page";
import { createAccessory, updateAccessory, deleteAccessory } from "@/lib/actions/catalog";
import { Input } from "@/components/ui/input";

export function AccessoriesClient({ items }: { items: any[] }) {
  return (
    <CatalogPage
      title="Accessories"
      items={items}
      extraHeaders={["Default Price", "Price Override"]}
      extraCells={(item) => [`₹${Number(item.default_price).toFixed(2)}`, item.allow_price_override ? "Allowed" : "Fixed"]}
      extraFormFields={
        <>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Default Price (₹)</label>
            <Input name="default_price" type="number" step="0.01" defaultValue="0" className="h-8 text-sm w-28" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Price Override</label>
            <select name="allow_price_override" className="border rounded px-2 py-1.5 text-sm h-8">
              <option value="true">Allowed</option>
              <option value="false">Fixed</option>
            </select>
          </div>
        </>
      }
      onAdd={createAccessory}
      onDelete={deleteAccessory}
      onUpdate={updateAccessory}
    />
  );
}
