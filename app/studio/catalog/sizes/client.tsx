"use client";
import { CatalogPage } from "@/components/studio/catalog-page";
import { createSize, updateSize, deleteSize } from "@/lib/actions/catalog";
import type { Size } from "@/types/database";

export function CatalogSizesClient({ items }: { items: Size[] }) {
  return (
    <CatalogPage
      title="Sizes"
      items={items}
      onAdd={createSize}
      onDelete={deleteSize}
      onUpdate={updateSize}
    />
  );
}
