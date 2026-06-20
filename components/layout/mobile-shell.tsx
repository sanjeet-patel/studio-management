"use client";

import { useState } from "react";
import { MobileTopBar } from "./mobile-top-bar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileDrawer } from "./mobile-drawer";

export function MobileShell({ tenantName, children }: { tenantName: string; children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <MobileTopBar tenantName={tenantName} />

      {/* Content with page fade-in */}
      <main className="flex-1 overflow-auto animate-fade-in" style={{ background: "var(--page-bg)" }}>
        <div
          className="md:p-6 md:max-w-7xl md:mx-auto px-4 md:px-6"
          style={{
            paddingTop: "calc(3.5rem + env(safe-area-inset-top) + 1rem)",
            paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom))",
          }}
        >
          {children}
        </div>
      </main>

      <MobileBottomNav onMenuOpen={() => setDrawerOpen(true)} />

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} tenantName={tenantName} />
    </>
  );
}
