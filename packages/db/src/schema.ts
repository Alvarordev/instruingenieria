import { sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: integer("parent_id").references((): AnySQLiteColumn => categories.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const brands = sqliteTable("brands", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  brandId: integer("brand_id").references(() => brands.id),
  type: text("type", { enum: ["venta", "alquiler"] }).notNull(),
  price: real("price"),
  imageUrl: text("image_url"),
  tagline: text("tagline"),
  specs: text("specs", { mode: "json" }).$type<string[]>(),
  applications: text("applications", { mode: "json" }).$type<string[]>(),
  fichaTecnicaUrl: text("ficha_tecnica_url"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  group: text("group", { enum: ["metrologia", "servicios"] }).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  items: text("items", { mode: "json" }).$type<string[]>(),
});

export const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => adminUsers.id),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});
