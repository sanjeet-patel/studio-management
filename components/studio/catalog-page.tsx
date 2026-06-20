"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

interface CatalogItem { id: string; name: string; sort_order?: number; [key: string]: any }
interface CatalogPageProps {
  title: string;
  items: CatalogItem[];
  extraHeaders?: string[];
  extraCells?: (item: CatalogItem) => React.ReactNode[];
  extraFormFields?: React.ReactNode;
  onAdd: (fd: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate?: (id: string, fd: FormData) => Promise<void>;
}

export function CatalogPage({ title, items, extraHeaders = [], extraCells, extraFormFields, onAdd, onDelete, onUpdate }: CatalogPageProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try { await onAdd(new FormData(e.currentTarget)); toast.success("Added"); setAdding(false); router.refresh(); }
    catch { toast.error("Failed to add"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try { await onDelete(id); toast.success("Deleted"); router.refresh(); }
    catch { toast.error("Failed to delete"); }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();
    setLoading(true);
    try { await onUpdate!(id, new FormData(e.currentTarget)); toast.success("Updated"); setEditId(null); router.refresh(); }
    catch { toast.error("Failed to update"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {!adding && (
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />Add New
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
              {extraHeaders.map((h) => <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>)}
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Order</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {/* Add row */}
            {adding && (
              <tr className="bg-indigo-50">
                <td colSpan={extraHeaders.length + 3} className="px-4 py-3">
                  <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Name *</label>
                      <Input name="name" placeholder="Name" required className="h-8 text-sm w-48" />
                    </div>
                    {extraFormFields}
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Sort Order</label>
                      <Input name="sort_order" type="number" defaultValue="0" className="h-8 text-sm w-20" />
                    </div>
                    <Button type="submit" size="sm" className="bg-indigo-600" disabled={loading}>{loading ? "…" : <Check className="h-4 w-4" />}</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}><X className="h-4 w-4" /></Button>
                  </form>
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                {editId === item.id ? (
                  <td colSpan={extraHeaders.length + 3} className="px-4 py-3">
                    <form onSubmit={(e) => handleUpdate(e, item.id)} className="flex flex-wrap gap-3 items-end">
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Name</label>
                        <Input name="name" defaultValue={item.name} required className="h-8 text-sm w-48" />
                      </div>
                      {extraFormFields}
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Sort Order</label>
                        <Input name="sort_order" type="number" defaultValue={item.sort_order ?? 0} className="h-8 text-sm w-20" />
                      </div>
                      <Button type="submit" size="sm" className="bg-indigo-600" disabled={loading}>{loading ? "…" : <Check className="h-4 w-4" />}</Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setEditId(null)}><X className="h-4 w-4" /></Button>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    {extraCells ? extraCells(item).map((cell, i) => <td key={i} className="px-4 py-3 text-slate-500">{cell}</td>) : null}
                    <td className="px-4 py-3 text-slate-400">{item.sort_order ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {onUpdate && <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setEditId(item.id)}><Pencil className="h-3.5 w-3.5" /></Button>}
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {!items.length && !adding && (
              <tr><td colSpan={extraHeaders.length + 3} className="px-4 py-8 text-center text-slate-400">No items yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
