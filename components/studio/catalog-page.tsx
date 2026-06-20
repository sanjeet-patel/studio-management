"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Check, X, Hash } from "lucide-react";

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

  const AddForm = ({ onCancel }: { onCancel: () => void }) => (
    <form onSubmit={handleAdd} className="space-y-3 p-4 bg-teal-50 rounded-2xl border border-teal-100">
      <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide">Add New {title.replace(/s$/, '')}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <label className="text-xs text-slate-500 block mb-1">Name *</label>
          <Input name="name" placeholder="Name" required className="h-9 text-sm" />
        </div>
        {extraFormFields}
        <div>
          <label className="text-xs text-slate-500 block mb-1">Sort Order</label>
          <Input name="sort_order" type="number" defaultValue="0" className="h-9 text-sm" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1 bg-teal-600 hover:bg-teal-700 h-9" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-9 px-4" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        {!adding && (
          <Button className="bg-teal-600 hover:bg-teal-700 h-9 text-sm" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4 mr-1.5" />Add
          </Button>
        )}
      </div>

      {/* Add form */}
      {adding && <AddForm onCancel={() => setAdding(false)} />}

      {/* ── Mobile cards ── */}
      <div className="md:hidden space-y-2">
        {items.map((item, i) => (
          <div key={item.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden card-lift animate-fade-up`} style={{ animationDelay: `${0.04 * i}s` }}>
            {editId === item.id ? (
              <form onSubmit={(e) => handleUpdate(e, item.id)} className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500 block mb-1">Name</label>
                    <Input name="name" defaultValue={item.name} required className="h-9 text-sm" />
                  </div>
                  {extraFormFields}
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Sort Order</label>
                    <Input name="sort_order" type="number" defaultValue={item.sort_order ?? 0} className="h-9 text-sm" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="flex-1 bg-teal-600 h-9" disabled={loading}>Save</Button>
                  <Button type="button" size="sm" variant="ghost" className="h-9" onClick={() => setEditId(null)}>Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-600 font-bold text-sm">{item.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {extraCells && extraCells(item).map((cell, ci) => (
                      <span key={ci} className="text-xs text-slate-500">{extraHeaders[ci]}: {cell}</span>
                    ))}
                    <span className="flex items-center gap-0.5 text-xs text-slate-400"><Hash className="h-3 w-3" />{item.sort_order ?? 0}</span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {onUpdate && (
                    <button onClick={() => setEditId(item.id)} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center active:bg-slate-200 transition-colors">
                      <Pencil className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(item.id)} className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center active:bg-red-100 transition-colors">
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {!items.length && !adding && (
          <div className="text-center py-12 text-slate-400 text-sm">No {title.toLowerCase()} yet. Tap Add to create one.</div>
        )}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block bg-white rounded-xl border overflow-hidden shadow-sm">
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
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                {editId === item.id ? (
                  <td colSpan={extraHeaders.length + 3} className="px-4 py-3">
                    <form onSubmit={(e) => handleUpdate(e, item.id)} className="flex flex-wrap gap-3 items-end">
                      <div><label className="text-xs text-slate-500 block mb-1">Name</label><Input name="name" defaultValue={item.name} required className="h-8 text-sm w-48" /></div>
                      {extraFormFields}
                      <div><label className="text-xs text-slate-500 block mb-1">Sort Order</label><Input name="sort_order" type="number" defaultValue={item.sort_order ?? 0} className="h-8 text-sm w-20" /></div>
                      <Button type="submit" size="sm" className="bg-teal-600" disabled={loading}>{loading ? "…" : <Check className="h-4 w-4" />}</Button>
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
