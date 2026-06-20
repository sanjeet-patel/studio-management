"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, ShoppingBag, Package, UserCheck,
  DollarSign, Receipt, TrendingUp, Settings, LogOut, Camera,
  ChevronDown, BookOpen, Tag, Layers, Grid
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const navGroups = [
  {
    label: "Main",
    items: [
      { href: "/studio/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/studio/customers", label: "Customers", icon: Users },
      { href: "/studio/orders", label: "Orders", icon: ShoppingBag },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/studio/catalog/sizes", label: "Sizes", icon: Grid },
      { href: "/studio/catalog/paper-types", label: "Paper Types", icon: Layers },
      { href: "/studio/catalog/cover-types", label: "Cover Types", icon: BookOpen },
      { href: "/studio/catalog/accessories", label: "Accessories", icon: Package },
      { href: "/studio/catalog/photo-pricing", label: "Photo Pricing", icon: Tag },
      { href: "/studio/catalog/cover-pricing", label: "Cover Pricing", icon: Tag },
    ],
  },
  {
    label: "HR & Finance",
    items: [
      { href: "/studio/employees", label: "Employees", icon: UserCheck },
      { href: "/studio/salaries", label: "Salaries", icon: DollarSign },
      { href: "/studio/bills", label: "Recurring Bills", icon: Receipt },
      { href: "/studio/expenses", label: "Expenses", icon: Package },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/studio/reports/profit-loss", label: "Profit & Loss", icon: TrendingUp },
      { href: "/studio/reports/ledger", label: "Ledger", icon: BookOpen },
      { href: "/studio/reports/expenses", label: "Expenses", icon: Receipt },
      { href: "/studio/reports/customer-dues", label: "Customer Dues", icon: Users },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/studio/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function StudioSidebar({ tenantName }: { tenantName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [catalogOpen, setCatalogOpen] = useState(pathname.startsWith("/studio/catalog"));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="flex flex-col w-64 bg-slate-900 text-white min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700">
        <div className="bg-indigo-600 rounded-lg p-1.5">
          <Camera className="h-5 w-5 text-white" />
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-semibold text-white truncate">{tenantName}</p>
          <p className="text-xs text-slate-400">Studio Management</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
