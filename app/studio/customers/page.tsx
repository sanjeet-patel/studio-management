import { getCustomers } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { DeleteCustomerButton } from "./delete-button";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search } = await searchParams;
  const customers = await getCustomers(search);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
        <Link href="/studio/customers/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-2" />New Customer</Button>
        </Link>
      </div>

      <form className="mb-4">
        <input name="search" defaultValue={search} placeholder="Search by name…" className="border rounded-lg px-3 py-1.5 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </form>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
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
                  <Link href={`/studio/customers/${c.id}`} className="text-indigo-600 hover:underline">{c.customer_name}</Link>
                </td>
                <td className="px-4 py-3 text-slate-500">{c.studio_name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">{c.mobile ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">{c.city ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Link href={`/studio/customers/${c.id}/edit`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2"><Pencil className="h-3.5 w-3.5" /></Button>
                    </Link>
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
