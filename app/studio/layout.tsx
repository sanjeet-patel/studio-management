import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StudioSidebar } from "@/components/layout/studio-sidebar";
import { MobileShell } from "@/components/layout/mobile-shell";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await (supabase.from("users") as any)
    .select("role, tenant_id, tenants(name)")
    .eq("id", user.id)
    .single() as { data: { role: string; tenant_id: string | null; tenants: { name: string } | null } | null };

  if (profile?.role !== "studio" || !profile.tenant_id) redirect("/login");

  const tenantName = (profile.tenants as { name: string } | null)?.name ?? "Studio";

  return (
    <div className="flex min-h-screen" style={{ background: "var(--page-bg)" }}>
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <StudioSidebar tenantName={tenantName} />
      </div>

      {/* Mobile layout + desktop content wrapper */}
      <div className="flex flex-col flex-1 min-h-screen md:block">
        {/* Mobile uses MobileShell, desktop uses plain div */}
        <div className="block md:hidden flex-1 flex flex-col">
          <MobileShell tenantName={tenantName}>
            {children}
          </MobileShell>
        </div>
        <div className="hidden md:block flex-1">
          <main className="p-6 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
