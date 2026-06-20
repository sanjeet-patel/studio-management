import { getCustomerDues } from "@/lib/actions/reports";

export default async function CustomerDuesPage() {
  const dues = await getCustomerDues();
  const totalDue = dues.reduce((s, d) => s + d.outstanding, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Customer Dues</h1>
        <div className="bg-red-50 rounded-xl px-4 py-2">
          <p className="text-xs text-red-600">Total Outstanding</p>
          <p className="text-lg font-bold text-red-700">₹{totalDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Customer</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Order No</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Order Total</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Outstanding</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Mobile</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {dues.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{d.customer}</td>
                <td className="px-4 py-3 font-mono text-xs text-indigo-600">{d.order_no}</td>
                <td className="px-4 py-3 text-right">₹{d.grand_total.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-bold text-red-600">₹{d.outstanding.toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-500">{d.mobile || "—"}</td>
              </tr>
            ))}
            {!dues.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No outstanding dues. All payments cleared!</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
