import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { Hono } from "hono";
import { createSession, destroySession, findAdminByUsername } from "../lib/session";
import { requireAuth } from "../middleware/auth";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "instru_session";

export const authRoutes = new Hono();

authRoutes.post("/login", async (c) => {
  const { username, password } = await c.req.json<{ username?: string; password?: string }>();

  const user = username ? await findAdminByUsername(username) : null;
  const valid = user ? await Bun.password.verify(password ?? "", user.passwordHash) : false;

  if (!user || !valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const session = await createSession(user.id);

  setCookie(c, COOKIE_NAME, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    expires: session.expiresAt,
  });

  return c.json({ username: user.username });
});

authRoutes.post("/logout", async (c) => {
  const token = getCookie(c, COOKIE_NAME);
  if (token) await destroySession(token);
  deleteCookie(c, COOKIE_NAME, { path: "/" });
  return c.json({ ok: true });
});

authRoutes.get("/me", requireAuth, (c) => c.json({ ok: true }));
