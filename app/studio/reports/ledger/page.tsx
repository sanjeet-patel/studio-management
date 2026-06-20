import { getLedger } from "@/lib/actions/reports";

export default async function LedgerPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month } = await searchParams;
  const currentMonth = month ?? new Date().toISOString().slice(0, 7);
  const { ledger } = await getLedger(currentMonth);

  const totalCredits = ledger.filter((e) => e.credit > 0).reduce((s, e) => s + e.credit, 0);
  const totalDebits = ledger.filter((e) => e.debit > 0).reduce((s, e) => s + e.debit, 0);
  const closingBalance = totalCredits - totalDebits;

  const typeColor: Record<string, string> = {
    income: "bg-emerald-100 text-emerald-700",
    expense: "bg-red-100 text-red-700",
    bill: "bg-amber-100 text-amber-700",
    salary: "bg-blue-100 text-blue-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800">General Ledger</h1>
        <form className="flex gap-2">
          <input type="month" name="month" defaultValue={currentMonth} className="border rounded-lg px-3 py-1.5 text-sm" />
          <button type="submit" className="bg-teal-600 text-white rounded-lg px-3 py-1.5 text-sm">View</button>
        </form>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 rounded-xl p-4">
          <p className="text-xs text-emerald-600 font-medium uppercase">Total Credits</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">₹{totalCredits.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-xs text-red-600 font-medium uppercase">Total Debits</p>
          <p className="text-xl font-bold text-red-700 mt-1">₹{totalDebits.toFixed(2)}</p>
        </div>
        <div className={`rounded-xl p-4 ${closingBalance >= 0 ? "bg-teal-50" : "bg-orange-50"}`}>
          <p className={`text-xs font-medium uppercase ${closingBalance >= 0 ? "text-teal-600" : "text-orange-600"}`}>Closing Balance</p>
          <p className={`text-xl font-bold mt-1 ${closingBalance >= 0 ? "text-indigo-700" : "text-orange-700"}`}>₹{closingBalance.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Narration</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-right">Debit (₹)</th>
              <th className="px-4 py-3 text-right">Credit (₹)</th>
              <th className="px-4 py-3 text-right">Balance (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {/* Opening row */}
            <tr className="bg-slate-50">
              <td className="px-4 py-2 text-slate-400 text-xs">{currentMonth}-01</td>
              <td className="px-4 py-2 text-slate-500 font-medium">Opening Balance</td>
              <td className="px-4 py-2"></td>
              <td className="px-4 py-2 text-right">—</td>
              <td className="px-4 py-2 text-right">—</td>
              <td className="px-4 py-2 text-right font-mono font-semibold">0.00</td>
            </tr>
            {ledger.map((entry, i) => (
              <tr key={i} className={`hover:bg-slate-50 ${entry.credit > 0 ? "" : "bg-red-50/20"}`}>
                <td className="px-4 py-2 text-slate-500">{new Date(entry.date).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-2">{entry.narration}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColor[entry.type] ?? "bg-slate-100 text-slate-600"}`}>{entry.type}</span>
                </td>
                <td className="px-4 py-2 text-right font-mono text-red-600">{entry.debit > 0 ? entry.debit.toFixed(2) : "—"}</td>
                <td className="px-4 py-2 text-right font-mono text-emerald-600">{entry.credit > 0 ? entry.credit.toFixed(2) : "—"}</td>
                <td className={`px-4 py-2 text-right font-mono font-semibold ${entry.balance >= 0 ? "text-teal-600" : "text-red-600"}`}>{entry.balance.toFixed(2)}</td>
              </tr>
            ))}
            {/* Closing row */}
            <tr className="bg-slate-800 text-white font-bold">
              <td className="px-4 py-3" colSpan={3}>Closing Balance — {currentMonth}</td>
              <td className="px-4 py-3 text-right font-mono text-red-300">{totalDebits.toFixed(2)}</td>
              <td className="px-4 py-3 text-right font-mono text-emerald-300">{totalCredits.toFixed(2)}</td>
              <td className={`px-4 py-3 text-right font-mono text-lg ${closingBalance >= 0 ? "text-indigo-300" : "text-orange-300"}`}>{closingBalance.toFixed(2)}</td>
            </tr>
            {!ledger.length && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No transactions for {currentMonth}.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
