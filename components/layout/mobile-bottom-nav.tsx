"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ShoppingBag, Menu, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const bottomTabs = [
  { href: "/studio/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/studio/customers", label: "Customers", icon: Users },
  { href: "/studio/orders", label: "Orders", icon: ShoppingBag },
];

interface MobileBottomNavProps {
  onMenuOpen: () => void;
}

export function MobileBottomNav({ onMenuOpen }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      {/* FAB - New Order */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2">
        <Link
          href="/studio/orders/new"
          className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg active:scale-95 transition-transform border-4 border-white animate-pulse-ring"
          style={{ background: "var(--brand)" }}
          aria-label="New Order"
        >
          <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
        </Link>
      </div>

      {/* Bar */}
      <div className="bg-white border-t border-slate-100 flex items-stretch pb-safe shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
        {/* Left tabs */}
        {bottomTabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors min-h-[56px] relative",
                isActive ? "text-teal-600" : "text-slate-400"
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-teal-500 animate-scale-in" />
              )}
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={cn("text-[10px] font-medium transition-all", isActive && "font-semibold")}>{tab.label}</span>
            </Link>
          );
        })}

        {/* Center spacer for FAB */}
        <div className="flex-1" />

        {/* Right tabs */}
        {bottomTabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors min-h-[56px] relative",
                isActive ? "text-teal-600" : "text-slate-400"
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-teal-500 animate-scale-in" />
              )}
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>{tab.label}</span>
            </Link>
          );
        })}

        {/* More */}
        <button
          onClick={onMenuOpen}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 active:bg-slate-50 transition-colors min-h-[56px] text-slate-400"
        >
          <Menu className="h-5 w-5" strokeWidth={1.8} />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>
    </nav>
  );
}
