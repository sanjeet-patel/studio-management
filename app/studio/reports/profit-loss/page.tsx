import { getProfitLoss } from "@/lib/actions/reports";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProfitLossPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month } = await searchParams;
  const currentMonth = month ?? new Date().toISOString().slice(0, 7);
  const data = await getProfitLoss(currentMonth);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Profit & Loss</h1>
        <form className="flex gap-2">
          <input type="month" name="month" defaultValue={currentMonth} className="border rounded-lg px-3 py-1.5 text-sm" />
          <button type="submit" className="bg-indigo-600 text-white rounded-lg px-3 py-1.5 text-sm">View</button>
        </form>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardContent className="pt-5">
            <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide mb-1">Revenue</p>
            <p className="text-2xl font-bold text-emerald-700">₹{data.revenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-red-50">
          <CardContent className="pt-5">
            <p className="text-xs text-red-600 font-medium uppercase tracking-wide mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-red-700">₹{data.totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card className={`border-0 shadow-sm ${data.netProfit >= 0 ? "bg-indigo-50" : "bg-orange-50"}`}>
          <CardContent className="pt-5">
            <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${data.netProfit >= 0 ? "text-indigo-600" : "text-orange-600"}`}>Net Profit</p>
            <p className={`text-2xl font-bold ${data.netProfit >= 0 ? "text-indigo-700" : "text-orange-700"}`}>₹{data.netProfit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Category</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Amount (₹)</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr className="bg-emerald-50/60">
              <td className="px-4 py-3 font-medium text-emerald-700">Total Collections / Revenue</td>
              <td className="px-4 py-3 text-right font-semibold text-emerald-700">₹{data.revenue.toFixed(2)}</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Income</span></td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-slate-700">Recurring Bills</td>
              <td className="px-4 py-3 text-right text-red-600">₹{data.billExpenses.toFixed(2)}</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Expense</span></td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-slate-700">Salaries</td>
              <td className="px-4 py-3 text-right text-red-600">₹{data.salaryExpenses.toFixed(2)}</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Expense</span></td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-slate-700">Miscellaneous Expenses</td>
              <td className="px-4 py-3 text-right text-red-600">₹{data.miscExpenses.toFixed(2)}</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Expense</span></td>
            </tr>
            <tr className="bg-slate-50 font-bold">
              <td className="px-4 py-3">Total Expenses</td>
              <td className="px-4 py-3 text-right text-red-700">₹{data.totalExpenses.toFixed(2)}</td>
              <td className="px-4 py-3"></td>
            </tr>
            <tr className={`font-bold ${data.netProfit >= 0 ? "bg-indigo-50" : "bg-orange-50"}`}>
              <td className={`px-4 py-3 ${data.netProfit >= 0 ? "text-indigo-700" : "text-orange-700"}`}>Net Profit / Loss</td>
              <td className={`px-4 py-3 text-right text-lg ${data.netProfit >= 0 ? "text-indigo-700" : "text-orange-700"}`}>₹{data.netProfit.toFixed(2)}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${data.netProfit >= 0 ? "bg-indigo-100 text-indigo-700" : "bg-orange-100 text-orange-700"}`}>
                  {data.netProfit >= 0 ? "Profit" : "Loss"}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
