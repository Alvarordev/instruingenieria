import type { Context } from "hono";
import { mkdir } from "node:fs/promises";
import { join, normalize, sep } from "node:path";

// Falls back to a path anchored to this app (not process.cwd()).
const defaultUploadsDir = join(import.meta.dir, "..", "..", "data", "uploads");
const UPLOADS_DIR = process.env.UPLOADS_DIR ?? defaultUploadsDir;
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export async function handleProductImageUpload(c: Context) {
  const form = await c.req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return c.json({ error: "Missing file" }, 400);
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return c.json({ error: "Unsupported file type" }, 400);
  }

  if (file.size > MAX_SIZE) {
    return c.json({ error: "File too large" }, 400);
  }

  const dir = join(UPLOADS_DIR, "products");
  await mkdir(dir, { recursive: true });

  const filename = `${crypto.randomUUID()}${ext}`;
  await Bun.write(join(dir, filename), file);

  return c.json({ url: `/uploads/products/${filename}` });
}

export async function serveUpload(c: Context) {
  const requestedPath = c.req.path.replace(/^\/uploads\//, "");
  const safePath = normalize(requestedPath);

  if (safePath.startsWith("..") || safePath.startsWith(sep)) {
    return c.json({ error: "Not found" }, 404);
  }

  const file = Bun.file(join(UPLOADS_DIR, safePath));

  if (!(await file.exists())) {
    return c.json({ error: "Not found" }, 404);
  }

  return new Response(file);
}
