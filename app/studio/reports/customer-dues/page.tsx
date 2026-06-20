import { getCustomerDues } from "@/lib/actions/reports";
import Link from "next/link";
import { Phone, AlertCircle, ChevronRight } from "lucide-react";

export default async function CustomerDuesPage() {
  const dues = await getCustomerDues();
  const totalDue = dues.reduce((s, d) => s + d.outstanding, 0);

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Customer Dues</h1>
        <div className="bg-red-50 rounded-xl px-3 py-2 text-right">
          <p className="text-[10px] text-red-500 uppercase font-semibold">Outstanding</p>
          <p className="text-base font-bold text-red-700">₹{totalDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* ── Mobile cards ── */}
      <div className="md:hidden space-y-2">
        {dues.map((d, i) => (
          <Link
            key={d.id}
            href={`/studio/orders/${d.id}`}
            className={`block bg-white rounded-2xl shadow-sm card-lift animate-fade-up`}
            style={{ animationDelay: `${0.04 * i}s` }}
          >
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{d.customer}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="font-mono text-xs text-teal-600">{d.order_no}</span>
                  {d.mobile && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Phone className="h-3 w-3" />{d.mobile}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-base font-bold text-red-600">₹{d.outstanding.toFixed(2)}</p>
                <p className="text-xs text-slate-400">of ₹{d.grand_total.toFixed(0)}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
            </div>
          </Link>
        ))}
        {!dues.length && (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-sm font-medium text-emerald-700">All payments cleared!</p>
            <p className="text-xs text-slate-400 mt-1">No outstanding dues.</p>
          </div>
        )}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block bg-white rounded-xl border overflow-hidden shadow-sm">
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
                <td className="px-4 py-3 font-mono text-xs text-teal-600">{d.order_no}</td>
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
