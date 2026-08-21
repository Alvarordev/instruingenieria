import { adminUsers, db, sessions } from "@instru/db";
import { and, eq, gt } from "drizzle-orm";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 días

export async function createSession(userId: number) {
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({ id, userId, expiresAt });
  return { id, expiresAt };
}

export async function getSession(token: string) {
  const rows = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

export async function destroySession(token: string) {
  await db.delete(sessions).where(eq(sessions.id, token));
}

export async function findAdminByUsername(username: string) {
  const rows = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
  return rows[0] ?? null;
}
