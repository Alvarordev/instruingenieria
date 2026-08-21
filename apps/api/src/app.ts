import { Hono } from "hono";
import { logger } from "hono/logger";
import { adminRoutes } from "./routes/admin";
import { authRoutes } from "./routes/auth";
import { publicRoutes } from "./routes/public";
import { serveUpload } from "./lib/uploads";

const app = new Hono();

app.use("*", logger());

app.get("/health", (c) => c.json({ ok: true }));

app.route("/api", publicRoutes);
app.route("/api/auth", authRoutes);
app.route("/api/admin", adminRoutes);

app.get("/uploads/*", serveUpload);

export default app;
