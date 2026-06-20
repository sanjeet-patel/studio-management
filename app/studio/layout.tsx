import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StudioSidebar } from "@/components/layout/studio-sidebar";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role, tenant_id, tenants(name)")
    .eq("id", user.id)
    .single() as { data: { role: string; tenant_id: string | null; tenants: { name: string } | null } | null };

  if (profile?.role !== "studio" || !profile.tenant_id) redirect("/login");

  const tenant = profile.tenants as { name: string } | null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StudioSidebar tenantName={tenant?.name ?? "Studio"} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
