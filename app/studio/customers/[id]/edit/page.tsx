import { getCustomer } from "@/lib/actions/customers";
import { EditCustomerForm } from "./form";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) return <div>Not found</div>;
  return <EditCustomerForm customer={customer} />;
}
