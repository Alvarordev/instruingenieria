import { brands, categories, db, products, services } from "@instru/db";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { handleProductImageUpload } from "../lib/uploads";
import { requireAuth } from "../middleware/auth";

export const adminRoutes = new Hono();

adminRoutes.use("*", requireAuth);

// Categories
adminRoutes.get("/categories", async (c) => c.json(await db.select().from(categories)));
adminRoutes.post("/categories", async (c) => {
  const body = await c.req.json();
  const [row] = await db.insert(categories).values(body).returning();
  return c.json(row, 201);
});
adminRoutes.patch("/categories/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const [row] = await db.update(categories).set(body).where(eq(categories.id, id)).returning();
  return c.json(row);
});
adminRoutes.delete("/categories/:id", async (c) => {
  try {
    await db.delete(categories).where(eq(categories.id, Number(c.req.param("id"))));
    return c.json({ ok: true });
  } catch {
    return c.json({ error: "No se puede eliminar: tiene subcategorías o productos asociados." }, 409);
  }
});

// Brands
adminRoutes.get("/brands", async (c) => c.json(await db.select().from(brands)));
adminRoutes.post("/brands", async (c) => {
  const body = await c.req.json();
  const [row] = await db.insert(brands).values(body).returning();
  return c.json(row, 201);
});
adminRoutes.patch("/brands/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const [row] = await db.update(brands).set(body).where(eq(brands.id, id)).returning();
  return c.json(row);
});
adminRoutes.delete("/brands/:id", async (c) => {
  try {
    await db.delete(brands).where(eq(brands.id, Number(c.req.param("id"))));
    return c.json({ ok: true });
  } catch {
    return c.json({ error: "No se puede eliminar: tiene productos asociados." }, 409);
  }
});

// Products
adminRoutes.get("/products", async (c) => {
  const type = c.req.query("type");
  const rows =
    type === "venta" || type === "alquiler"
      ? await db.select().from(products).where(eq(products.type, type))
      : await db.select().from(products);
  return c.json(rows);
});
adminRoutes.get("/products/:id", async (c) => {
  const [row] = await db
    .select()
    .from(products)
    .where(eq(products.id, Number(c.req.param("id"))))
    .limit(1);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});
adminRoutes.post("/products", async (c) => {
  const body = await c.req.json();
  const [row] = await db.insert(products).values(body).returning();
  return c.json(row, 201);
});
adminRoutes.patch("/products/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const [row] = await db
    .update(products)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
  return c.json(row);
});
adminRoutes.delete("/products/:id", async (c) => {
  await db.delete(products).where(eq(products.id, Number(c.req.param("id"))));
  return c.json({ ok: true });
});

// Services
adminRoutes.get("/services", async (c) => {
  const group = c.req.query("group");
  const rows =
    group === "metrologia" || group === "servicios"
      ? await db.select().from(services).where(eq(services.group, group))
      : await db.select().from(services);
  return c.json(rows);
});
adminRoutes.post("/services", async (c) => {
  const body = await c.req.json();
  const [row] = await db.insert(services).values(body).returning();
  return c.json(row, 201);
});
adminRoutes.patch("/services/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const [row] = await db.update(services).set(body).where(eq(services.id, id)).returning();
  return c.json(row);
});
adminRoutes.delete("/services/:id", async (c) => {
  try {
    await db.delete(services).where(eq(services.id, Number(c.req.param("id"))));
    return c.json({ ok: true });
  } catch {
    return c.json({ error: "No se puede eliminar este laboratorio/servicio." }, 409);
  }
});

// Uploads
adminRoutes.post("/uploads/product-image", handleProductImageUpload);
