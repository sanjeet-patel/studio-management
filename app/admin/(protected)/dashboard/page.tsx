import { getAdminStats } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle, Clock, DollarSign, ShoppingBag } from "lucide-react";

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Total Studios", value: stats.totalTenants, icon: Building2, color: "text-indigo-600" },
    { label: "Active Studios", value: stats.activeTenants, icon: CheckCircle, color: "text-emerald-600" },
    { label: "On Trial", value: stats.trialTenants, icon: Clock, color: "text-amber-600" },
    { label: "Platform Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-blue-600" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "text-purple-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Platform Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-0 shadow-sm">
              <CardContent className="pt-5 pb-4">
                <Icon className={`h-6 w-6 mb-2 ${card.color}`} />
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
