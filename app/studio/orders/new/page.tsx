import { getOrderFormData } from "@/lib/actions/orders";
import { NewOrderForm } from "./form";

export default async function NewOrderPage() {
  const data = await getOrderFormData();
  return <NewOrderForm data={data} />;
}
