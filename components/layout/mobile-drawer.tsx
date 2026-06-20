"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, Camera, Grid, Layers, BookOpen, Package, Tag, UserCheck, DollarSign, Receipt, TrendingUp, BarChart2, Users, Settings, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const sections = [
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
    label: "Reports",
    items: [
      { href: "/studio/reports/profit-loss", label: "Profit & Loss", icon: TrendingUp },
      { href: "/studio/reports/ledger", label: "Ledger", icon: BarChart2 },
      { href: "/studio/reports/expenses", label: "Expenses", icon: Receipt },
      { href: "/studio/reports/customer-dues", label: "Customer Dues", icon: Users },
    ],
  },
];

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  tenantName: string;
}

export function MobileDrawer({ open, onClose, tenantName }: MobileDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          "md:hidden fixed top-0 right-0 bottom-0 z-[70] w-[85vw] max-w-sm bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 bg-indigo-600 safe-area-top">
          <div className="bg-white/20 rounded-full p-1.5">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{tenantName}</p>
            <p className="text-xs text-indigo-200">Studio Management</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full active:bg-indigo-500 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Nav sections */}
        <div className="flex-1 overflow-y-auto py-2">
          {sections.map((section) => (
            <div key={section.label} className="mb-1">
              <p className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.label}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 transition-colors",
                      isActive ? "bg-indigo-50" : ""
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      isActive ? "bg-indigo-600" : "bg-slate-100"
                    )}>
                      <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-600")} />
                    </div>
                    <span className={cn(
                      "flex-1 text-sm font-medium",
                      isActive ? "text-indigo-600" : "text-slate-700"
                    )}>
                      {item.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pb-safe">
          <Link
            href="/studio/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-4 active:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Settings className="h-4 w-4 text-slate-600" />
            </div>
            <span className="flex-1 text-sm font-medium text-slate-700">Settings</span>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-4 w-full active:bg-red-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <LogOut className="h-4 w-4 text-red-500" />
            </div>
            <span className="flex-1 text-sm font-medium text-red-500 text-left">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
