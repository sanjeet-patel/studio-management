import { getAccessories } from "@/lib/actions/catalog";
import { AccessoriesClient } from "./client";
export default async function AccessoriesPage() {
  const items = await getAccessories();
  return <AccessoriesClient items={items} />;
}
