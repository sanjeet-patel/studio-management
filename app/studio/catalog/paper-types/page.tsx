import { getPaperTypes } from "@/lib/actions/catalog";
import { CatalogPaperTypesClient } from "./client";
export default async function PaperTypesPage() {
  const items = await getPaperTypes();
  return <CatalogPaperTypesClient items={items} />;
}
