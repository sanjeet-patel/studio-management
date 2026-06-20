import { getCustomer } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) return <div className="text-slate-500">Customer not found.</div>;

  const fields = [
    ["Customer Name", customer.customer_name],
    ["Studio Name", customer.studio_name ?? "—"],
    ["Mobile", customer.mobile ?? "—"],
    ["WhatsApp", customer.whatsapp ?? "—"],
    ["Address", customer.address ?? "—"],
    ["City", customer.city ?? "—"],
    ["Notes", customer.notes ?? "—"],
    ["Status", customer.status],
    ["Created", new Date(customer.created_at).toLocaleDateString("en-IN")],
  ];

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/studio/customers"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold text-slate-800">{customer.customer_name}</h1>
        <Link href={`/studio/customers/${id}/edit`} className="ml-auto">
          <Button variant="outline" size="sm"><Pencil className="h-4 w-4 mr-1" />Edit</Button>
        </Link>
      </div>
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <dl className="space-y-3">
            {fields.map(([label, value]) => (
              <div key={label} className="grid grid-cols-3 gap-2">
                <dt className="text-sm font-medium text-slate-500">{label}</dt>
                <dd className="col-span-2 text-sm text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
