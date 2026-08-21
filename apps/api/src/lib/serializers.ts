interface ProductRow {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  categoryId: number;
  brandId: number | null;
  type: "venta" | "alquiler";
  imageUrl: string | null;
  tagline: string | null;
  specs: string[] | null;
  applications: string[] | null;
  fichaTecnicaUrl: string | null;
}

// Allowlist serializer: `price` is structurally excluded, not hidden by convention.
export function toPublicProduct(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    categoryId: row.categoryId,
    brandId: row.brandId,
    type: row.type,
    imageUrl: row.imageUrl,
    tagline: row.tagline,
    specs: row.specs,
    applications: row.applications,
    fichaTecnicaUrl: row.fichaTecnicaUrl,
  };
}
