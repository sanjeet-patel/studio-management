import { getDashboardStats } from "@/lib/actions/customers";
import Link from "next/link";
import { ShoppingBag, DollarSign, AlertCircle, TrendingUp, Clock, Receipt, Users, Plus, ChevronRight } from "lucide-react";

export default async function StudioDashboard() {
  const stats = await getDashboardStats();

  const todayCards = [
    { label: "Today's Orders", value: stats.todays_orders, icon: ShoppingBag, color: "text-teal-600", bg: "bg-teal-50", href: "/studio/orders" },
    { label: "Today's Collection", value: `₹${stats.todays_collection.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", href: "/studio/orders" },
  ];

  const alertCards = [
    { label: "Pending Orders", value: stats.pending_orders, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", href: "/studio/orders" },
    { label: "Outstanding", value: `₹${stats.outstanding_amount.toLocaleString()}`, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", href: "/studio/reports/customer-dues" },
    { label: "Pending Bills", value: stats.pending_bills, icon: Receipt, color: "text-purple-600", bg: "bg-purple-50", href: "/studio/bills" },
    { label: "Pending Salaries", value: stats.pending_salaries, icon: DollarSign, color: "text-rose-600", bg: "bg-rose-50", href: "/studio/salaries" },
  ];

  const quickLinks = [
    { href: "/studio/orders/new", label: "New Order", icon: Plus, color: "bg-teal-600" },
    { href: "/studio/customers/new", label: "New Customer", icon: Users, color: "bg-emerald-600" },
    { href: "/studio/orders", label: "All Orders", icon: ShoppingBag, color: "bg-slate-700" },
    { href: "/studio/reports/profit-loss", label: "P&L Report", icon: TrendingUp, color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-5 pt-1">
      {/* Today's snapshot */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Today</h2>
        <div className="grid grid-cols-2 gap-3">
          {todayCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className={`bg-white rounded-2xl p-4 shadow-sm card-lift animate-fade-up stagger-${i + 1}`}
              >
                <div className={`inline-flex p-2 rounded-xl ${card.bg} mb-3`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <p className="text-2xl font-bold text-slate-800 leading-tight">{card.value}</p>
                <p className="text-xs text-slate-500 mt-1">{card.label}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick actions */}
      <section className="animate-fade-up stagger-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-2">
          {quickLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-2 active:scale-95 transition-transform animate-scale-in stagger-${i + 3}`}
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${link.color} flex items-center justify-center shadow-sm`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-[10px] text-center text-slate-600 font-medium leading-tight">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Alerts */}
      <section className="animate-fade-up stagger-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Alerts</h2>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {alertCards.map((card, i) => {
            const Icon = card.icon;
            const isLast = i === alertCards.length - 1;
            return (
              <Link
                key={card.label}
                href={card.href}
                className={`flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 transition-colors ${!isLast ? "border-b border-slate-100" : ""}`}
              >
                <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 font-medium">{card.label}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-slate-800">{card.value}</span>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
