import { getExpenseReport } from "@/lib/actions/reports";

export default async function ExpensesReportPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month } = await searchParams;
  const currentMonth = month ?? new Date().toISOString().slice(0, 7);
  const { byCategory, total } = await getExpenseReport(currentMonth);
  const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Expense Report</h1>
        <form className="flex gap-2">
          <input type="month" name="month" defaultValue={currentMonth} className="border rounded-lg px-3 py-1.5 text-sm" />
          <button type="submit" className="bg-indigo-600 text-white rounded-lg px-3 py-1.5 text-sm">View</button>
        </form>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Category</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Amount (₹)</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">% of Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {entries.map(([cat, amount]) => (
              <tr key={cat} className="hover:bg-slate-50">
                <td className="px-4 py-3">{cat}</td>
                <td className="px-4 py-3 text-right font-semibold">₹{amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-slate-500">{total > 0 ? ((amount / total) * 100).toFixed(1) : "0"}%</td>
              </tr>
            ))}
            <tr className="bg-slate-50 font-bold">
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right text-red-700">₹{total.toFixed(2)}</td>
              <td className="px-4 py-3 text-right">100%</td>
            </tr>
            {!entries.length && <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">No expenses for {currentMonth}.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
