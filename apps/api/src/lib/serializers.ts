import type { ProductSpec } from "@instru/db";

interface ProductRow {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  model: string | null;
  description: string | null;
  categoryId: number;
  brandId: number | null;
  type: "venta" | "alquiler";
  imageUrl: string | null;
  galleryUrls: string[] | null;
  tagline: string | null;
  specs: ProductSpec[] | string[] | null;
  applications: string[] | null;
  fichaTecnicaUrl: string | null;
  warranty: string | null;
  inStock: boolean;
}

export function normalizeSpecs(specs: ProductRow["specs"]): ProductSpec[] | null {
  if (!specs?.length) return null;
  return specs.map((item) => {
    if (typeof item === "object" && item && "label" in item) {
      return { label: item.label, value: item.value };
    }
    const line = String(item).replace(/\.$/, "").trim();
    const idx = line.indexOf(":");
    if (idx > 0) {
      return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() || "—" };
    }
    return { label: line, value: "—" };
  });
}

// Allowlist serializer: `price` is structurally excluded, not hidden by convention.
export function toPublicProduct(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    model: row.model,
    description: row.description,
    categoryId: row.categoryId,
    brandId: row.brandId,
    type: row.type,
    imageUrl: row.imageUrl,
    galleryUrls: row.galleryUrls ?? [],
    tagline: row.tagline,
    specs: normalizeSpecs(row.specs),
    applications: row.applications,
    fichaTecnicaUrl: row.fichaTecnicaUrl,
    warranty: row.warranty,
    inStock: row.inStock,
  };
}
