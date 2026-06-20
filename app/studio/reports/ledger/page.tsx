import { getLedger } from "@/lib/actions/reports";
import { TrendingUp, TrendingDown, Scale } from "lucide-react";

export default async function LedgerPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month } = await searchParams;
  const currentMonth = month ?? new Date().toISOString().slice(0, 7);
  const { ledger } = await getLedger(currentMonth);

  const totalCredits = ledger.filter((e) => e.credit > 0).reduce((s, e) => s + e.credit, 0);
  const totalDebits = ledger.filter((e) => e.debit > 0).reduce((s, e) => s + e.debit, 0);
  const closingBalance = totalCredits - totalDebits;

  const typeColor: Record<string, string> = {
    income:  "bg-emerald-100 text-emerald-700",
    expense: "bg-red-100 text-red-700",
    bill:    "bg-amber-100 text-amber-700",
    salary:  "bg-blue-100 text-blue-700",
  };

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Header + month picker */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <h1 className="text-xl font-bold text-slate-800">General Ledger</h1>
        <form className="flex gap-2">
          <input type="month" name="month" defaultValue={currentMonth} className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <button type="submit" className="bg-teal-600 text-white rounded-xl px-4 py-2 text-sm font-medium active:bg-teal-700 transition-colors">View</button>
        </form>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-emerald-50 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <p className="text-[10px] sm:text-xs text-emerald-600 font-semibold uppercase tracking-wide">Credits</p>
          </div>
          <p className="text-base sm:text-xl font-bold text-emerald-700">₹{totalCredits.toFixed(0)}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            <p className="text-[10px] sm:text-xs text-red-600 font-semibold uppercase tracking-wide">Debits</p>
          </div>
          <p className="text-base sm:text-xl font-bold text-red-700">₹{totalDebits.toFixed(0)}</p>
        </div>
        <div className={`rounded-2xl p-3 sm:p-4 ${closingBalance >= 0 ? "bg-teal-50" : "bg-orange-50"}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <Scale className="h-3.5 w-3.5 text-teal-500" />
            <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wide ${closingBalance >= 0 ? "text-teal-600" : "text-orange-600"}`}>Balance</p>
          </div>
          <p className={`text-base sm:text-xl font-bold ${closingBalance >= 0 ? "text-teal-700" : "text-orange-700"}`}>₹{closingBalance.toFixed(0)}</p>
        </div>
      </div>

      {/* ── Mobile: card list ── */}
      <div className="md:hidden space-y-2">
        {ledger.map((entry, i) => (
          <div key={i} className={`bg-white rounded-2xl shadow-sm overflow-hidden animate-fade-up`} style={{ animationDelay: `${0.03 * i}s` }}>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${entry.credit > 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                {entry.credit > 0
                  ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  : <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{entry.narration}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${typeColor[entry.type] ?? "bg-slate-100 text-slate-600"}`}>{entry.type}</span>
                  <span className="text-xs text-slate-400">{new Date(entry.date).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                {entry.credit > 0
                  ? <p className="text-sm font-bold text-emerald-600">+₹{entry.credit.toFixed(2)}</p>
                  : <p className="text-sm font-bold text-red-600">-₹{entry.debit.toFixed(2)}</p>}
                <p className={`text-xs font-mono ${entry.balance >= 0 ? "text-teal-600" : "text-red-500"}`}>{entry.balance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
        {!ledger.length && <div className="text-center py-12 text-slate-400 text-sm">No transactions for {currentMonth}.</div>}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block bg-white rounded-xl border overflow-hidden shadow-sm overflow-x-auto">
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
                <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColor[entry.type] ?? "bg-slate-100 text-slate-600"}`}>{entry.type}</span></td>
                <td className="px-4 py-2 text-right font-mono text-red-600">{entry.debit > 0 ? entry.debit.toFixed(2) : "—"}</td>
                <td className="px-4 py-2 text-right font-mono text-emerald-600">{entry.credit > 0 ? entry.credit.toFixed(2) : "—"}</td>
                <td className={`px-4 py-2 text-right font-mono font-semibold ${entry.balance >= 0 ? "text-teal-600" : "text-red-600"}`}>{entry.balance.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="bg-slate-800 text-white font-bold">
              <td className="px-4 py-3" colSpan={3}>Closing Balance — {currentMonth}</td>
              <td className="px-4 py-3 text-right font-mono text-red-300">{totalDebits.toFixed(2)}</td>
              <td className="px-4 py-3 text-right font-mono text-emerald-300">{totalCredits.toFixed(2)}</td>
              <td className={`px-4 py-3 text-right font-mono text-lg ${closingBalance >= 0 ? "text-teal-300" : "text-orange-300"}`}>{closingBalance.toFixed(2)}</td>
            </tr>
            {!ledger.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No transactions for {currentMonth}.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
