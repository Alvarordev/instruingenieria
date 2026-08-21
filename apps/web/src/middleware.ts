import { defineMiddleware } from "astro:middleware";
import { API_URL } from "./lib/api";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const cookie = context.request.headers.get("cookie") ?? "";
    const res = await fetch(`${API_URL}/api/auth/me`, { headers: { cookie } });

    if (!res.ok) {
      return context.redirect("/admin/login");
    }
  }

  return next();
});
