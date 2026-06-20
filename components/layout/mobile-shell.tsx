"use client";

import { useState } from "react";
import { MobileTopBar } from "./mobile-top-bar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileDrawer } from "./mobile-drawer";

export function MobileShell({ tenantName, children }: { tenantName: string; children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <MobileTopBar tenantName={tenantName} />

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile: padded for top bar + bottom nav */}
        <div className="md:p-6 md:max-w-7xl md:mx-auto pt-14 pb-24 px-3 md:pt-6 md:pb-6 md:px-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileBottomNav onMenuOpen={() => setDrawerOpen(true)} />

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} tenantName={tenantName} />
    </>
  );
}
