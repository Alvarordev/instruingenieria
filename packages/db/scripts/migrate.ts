import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const defaultUrl = join(import.meta.dir, "..", "data", "db.sqlite");
const url = process.env.DATABASE_URL ?? defaultUrl;
mkdirSync(dirname(url), { recursive: true });

const sqlite = new Database(url);
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: join(import.meta.dir, "..", "drizzle") });

console.log(`Migrations applied to ${url}`);
sqlite.close();
