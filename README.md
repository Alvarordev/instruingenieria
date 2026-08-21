# Instru Ingeniería

Sitio web + CRM interno para una empresa de instrumentación/metrología industrial.

## Stack

- **`apps/web`** — Astro + islas de Svelte (público + `/admin`)
- **`apps/api`** — Hono sobre Bun (API REST + auth por sesión)
- **`packages/db`** — Schema Drizzle ORM sobre SQLite (`bun:sqlite`)

`apps/web` no accede a la base de datos directamente: hace `fetch()` a `apps/api`. En dev, Astro proxea `/api` y `/uploads` hacia el puerto del API para que el navegador vea todo bajo un mismo origen.

## Desarrollo local

```bash
cp .env.example .env   # completar ADMIN_USERNAME / ADMIN_PASSWORD

bun install
bun run db:generate    # genera migraciones a partir del schema
bun run db:migrate     # aplica migraciones a ./data/db.sqlite
bun run db:seed        # crea el usuario admin desde .env

bun run dev             # levanta apps/web (3000) y apps/api (4000) en paralelo
```

Login del CRM: `http://localhost:3000/admin/login`

## Docker / Dokploy

```bash
docker compose up --build
```

Levanta dos servicios (`web`, `api`) con un volumen (`instru_data`) para `db.sqlite` y `uploads/`. En Dokploy: una app tipo "Compose" apuntando a este repo, con reglas de dominio por servicio — `web` en `/`, `api` en `/api` y `/uploads` del mismo dominio (sin subdominio, sin CORS).

## Alcance de esta primera pasada

Quedaron implementados como ejemplo completo del patrón: la home, el listado y detalle de `productos`, el login, y el CRUD admin de `productos`. El resto de páginas públicas (`nosotros`, `metrologia/*`, `servicios/*`, `alquiler`, `proyectos`, `contactos`) y CRUD admin (`categorias`, `marcas`, `servicios`) siguen el mismo patrón y quedan como siguiente pase.
