"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Bell } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/studio/dashboard": "Dashboard",
  "/studio/customers": "Customers",
  "/studio/orders": "Orders",
  "/studio/employees": "Employees",
  "/studio/salaries": "Salaries",
  "/studio/bills": "Bills",
  "/studio/expenses": "Expenses",
  "/studio/catalog/sizes": "Sizes",
  "/studio/catalog/paper-types": "Paper Types",
  "/studio/catalog/cover-types": "Cover Types",
  "/studio/catalog/accessories": "Accessories",
  "/studio/catalog/photo-pricing": "Photo Pricing",
  "/studio/catalog/cover-pricing": "Cover Pricing",
  "/studio/reports/profit-loss": "Profit & Loss",
  "/studio/reports/ledger": "Ledger",
  "/studio/reports/expenses": "Expense Report",
  "/studio/reports/customer-dues": "Customer Dues",
  "/studio/settings": "Settings",
};

const rootPaths = ["/studio/dashboard", "/studio/customers", "/studio/orders"];

function getTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  for (const [key, value] of Object.entries(pageTitles)) {
    if (pathname.startsWith(key + "/")) return value;
  }
  if (pathname.includes("/new")) return "New";
  if (pathname.includes("/edit")) return "Edit";
  if (pathname.includes("/invoice")) return "Invoice";
  return "Albify";
}

export function MobileTopBar({ tenantName }: { tenantName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const title = getTitle(pathname);
  const isRoot = rootPaths.includes(pathname);
  const showBack = !isRoot && pathname !== "/studio/dashboard";

  return (
    <header
      className="md:hidden fixed top-0 left-0 right-0 z-50 safe-area-top"
      style={{ background: "var(--sidebar-bg)" }}
    >
      <div className="flex items-center h-14 px-2">
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full active:bg-white/10 transition-colors mr-1"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
        ) : (
          <div className="flex items-center gap-2 px-2 mr-1">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <span className="text-teal-400 font-bold text-xs">A</span>
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-white truncate leading-tight">
            {showBack ? title : tenantName}
          </h1>
          {!showBack && (
            <p className="text-[10px] text-slate-400 leading-tight">Albify</p>
          )}
        </div>

        <button className="p-2 rounded-full active:bg-white/10 transition-colors relative">
          <Bell className="h-5 w-5 text-slate-300" />
        </button>
      </div>
    </header>
  );
}
