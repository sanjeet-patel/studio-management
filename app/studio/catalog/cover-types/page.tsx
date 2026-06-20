import { getCoverTypes } from "@/lib/actions/catalog";
import { CoverTypesClient } from "./client";
export default async function CoverTypesPage() {
  const items = await getCoverTypes();
  return <CoverTypesClient items={items} />;
}
