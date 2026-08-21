import { eq } from "drizzle-orm";
import { adminUsers, db } from "../src";

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

if (!username || !password) {
  console.error("ADMIN_USERNAME and ADMIN_PASSWORD must be set");
  process.exit(1);
}

const passwordHash = await Bun.password.hash(password);

const existing = await db
  .select()
  .from(adminUsers)
  .where(eq(adminUsers.username, username))
  .limit(1);

if (existing[0]) {
  await db.update(adminUsers).set({ passwordHash }).where(eq(adminUsers.id, existing[0].id));
  console.log(`Updated password for admin user "${username}"`);
} else {
  await db.insert(adminUsers).values({ username, passwordHash });
  console.log(`Created admin user "${username}"`);
}
