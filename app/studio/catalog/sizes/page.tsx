import { getSizes } from "@/lib/actions/catalog";
import { CatalogSizesClient } from "./client";

export default async function SizesPage() {
  const sizes = await getSizes();
  return <CatalogSizesClient items={sizes} />;
}
