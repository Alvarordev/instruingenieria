import { brands, categories, db, products, services } from "@instru/db";
import { and, eq, inArray, like } from "drizzle-orm";
import { Hono } from "hono";
import { toPublicProduct } from "../lib/serializers";

export const publicRoutes = new Hono();

publicRoutes.get("/categories", async (c) => c.json(await db.select().from(categories)));

publicRoutes.get("/brands", async (c) => c.json(await db.select().from(brands)));

publicRoutes.get("/products", async (c) => {
  const { category, brand, type, q } = c.req.query();

  const conditions = [eq(products.active, true)];
  if (category) conditions.push(inArray(products.categoryId, category.split(",").map(Number)));
  if (brand) conditions.push(inArray(products.brandId, brand.split(",").map(Number)));
  if (type === "venta" || type === "alquiler") conditions.push(eq(products.type, type));
  if (q) conditions.push(like(products.name, `%${q}%`));

  const rows = await db
    .select()
    .from(products)
    .where(and(...conditions));

  return c.json(rows.map(toPublicProduct));
});

publicRoutes.get("/products/:slug", async (c) => {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, c.req.param("slug")), eq(products.active, true)))
    .limit(1);

  if (!rows[0]) return c.json({ error: "Not found" }, 404);
  return c.json(toPublicProduct(rows[0]));
});

publicRoutes.get("/services", async (c) => {
  const group = c.req.query("group");
  const rows =
    group === "metrologia" || group === "servicios"
      ? await db.select().from(services).where(eq(services.group, group))
      : await db.select().from(services);
  return c.json(rows);
});

publicRoutes.get("/services/:slug", async (c) => {
  const rows = await db.select().from(services).where(eq(services.slug, c.req.param("slug"))).limit(1);
  if (!rows[0]) return c.json({ error: "Not found" }, 404);
  return c.json(rows[0]);
});
