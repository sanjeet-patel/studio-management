import { getCustomers } from "@/lib/actions/customers";
import Link from "next/link";
import { Plus, ChevronRight, Phone, Store, MapPin, Search } from "lucide-react";
import { DeleteCustomerButton } from "./delete-button";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search } = await searchParams;
  const customers = await getCustomers(search);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800 md:text-2xl">Customers</h1>
        <Link
          href="/studio/customers/new"
          className="flex items-center gap-1.5 bg-teal-600 text-white px-3 py-2 rounded-xl text-sm font-medium active:bg-teal-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> New
        </Link>
      </div>

      {/* Search */}
      <form className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Search customers…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
        </div>
      </form>

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {customers.map((c, i) => (
          <div key={c.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden card-lift animate-fade-up`} style={{ animationDelay: `${0.05 * i}s` }}>
            <Link href={`/studio/customers/${c.id}`} className="flex items-center gap-3 px-4 py-3.5 active:bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                <span className="text-teal-600 font-semibold text-sm">
                  {c.customer_name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{c.customer_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {c.studio_name && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Store className="h-3 w-3" />{c.studio_name}
                    </span>
                  )}
                  {c.mobile && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Phone className="h-3 w-3" />{c.mobile}
                    </span>
                  )}
                </div>
                {c.city && (
                  <span className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                    <MapPin className="h-3 w-3" />{c.city}
                  </span>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
            </Link>
          </div>
        ))}
        {!customers.length && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-base font-medium">No customers yet</p>
            <p className="text-sm mt-1">Add your first customer to get started</p>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Studio Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Mobile</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">City</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/studio/customers/${c.id}`} className="text-teal-600 hover:underline">{c.customer_name}</Link>
                </td>
                <td className="px-4 py-3 text-slate-500">{c.studio_name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">{c.mobile ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">{c.city ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Link href={`/studio/customers/${c.id}/edit`} className="px-2 py-1 text-xs rounded border hover:bg-slate-50">Edit</Link>
                    <DeleteCustomerButton id={c.id} />
                  </div>
                </td>
              </tr>
            ))}
            {!customers.length && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No customers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
