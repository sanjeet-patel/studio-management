"use client";
import { CatalogPage } from "@/components/studio/catalog-page";
import { createCoverType, deleteCoverType } from "@/lib/actions/catalog";
export function CoverTypesClient({ items }: { items: any[] }) {
  return <CatalogPage title="Cover Types" items={items} onAdd={createCoverType} onDelete={deleteCoverType} />;
}
