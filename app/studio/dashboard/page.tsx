import { getDashboardStats } from "@/lib/actions/customers";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, DollarSign, AlertCircle, TrendingUp, Clock, Receipt } from "lucide-react";

export default async function StudioDashboard() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Today's Orders", value: stats.todays_orders, icon: ShoppingBag, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Today's Collection", value: `₹${stats.todays_collection.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending Orders", value: stats.pending_orders, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Outstanding", value: `₹${stats.outstanding_amount.toLocaleString()}`, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Monthly Revenue", value: `₹${stats.monthly_revenue.toLocaleString()}`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending Bills", value: stats.pending_bills, icon: Receipt, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Pending Salaries", value: stats.pending_salaries, icon: DollarSign, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-5 pb-4">
                <div className={`inline-flex p-2 rounded-lg ${card.bg} mb-3`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
