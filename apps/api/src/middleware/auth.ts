import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { getSession } from "../lib/session";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "instru_session";

export const requireAuth = createMiddleware<{ Variables: { userId: number } }>(async (c, next) => {
  const token = getCookie(c, COOKIE_NAME);
  const session = token ? await getSession(token) : null;

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("userId", session.userId);
  await next();
});
