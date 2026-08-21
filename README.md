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

Levanta tres servicios: `web`, `api`, y `proxy` (nginx, ver `nginx.conf`) con un volumen (`instru_data`) para `db.sqlite` y `uploads/`. `proxy` enruta por path sobre un mismo origen — `web` en `/`, `api` en `/api` y `/uploads` — porque el navegador necesita llegar a las tres cosas sin CORS y Dokploy no resuelve ese ruteo por sí solo entre servicios de un mismo compose (cada servicio queda con su propio dominio autogenerado si no se configura nada extra). En Dokploy: una app tipo "Compose" apuntando a este repo, con la Domain configurada sobre el servicio **`proxy`** (puerto 3000) — no sobre `web` directamente.

### CI/CD

Cada push a `main` dispara `.github/workflows/deploy.yml`: arma las imágenes `Dockerfile.api`/`Dockerfile.web` y las sube a GHCR (`ghcr.io/alvarordev/instruingenieria-api` y `-web`, tags `latest` y el SHA del commit), y al terminar pega al webhook de redeploy de Dokploy. Como el repo es público, los paquetes de GHCR quedan públicos también — Dokploy no necesita credenciales de registry para pullearlos.

Dokploy debe apuntar a `docker-compose.prod.yml` (no a `docker-compose.yml`, que sigue siendo solo para desarrollo local con `docker compose up --build`) — ese archivo referencia las imágenes de GHCR en vez de buildear desde el código, pero mantiene el mismo servicio `proxy` que el compose local, por el motivo explicado arriba.

Falta cargar el secret `DOKPLOY_WEBHOOK_URL` en el repo de GitHub (Settings → Secrets and variables → Actions) con la URL de webhook de la app en Dokploy.

## Alcance de esta primera pasada

Quedaron implementados como ejemplo completo del patrón: la home, el listado y detalle de `productos`, el login, y el CRUD admin de `productos`. El resto de páginas públicas (`nosotros`, `metrologia/*`, `servicios/*`, `alquiler`, `proyectos`, `contactos`) y CRUD admin (`categorias`, `marcas`, `servicios`) siguen el mismo patrón y quedan como siguiente pase.
