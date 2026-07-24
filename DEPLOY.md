# Desplegar PassPoint (Vercel + Render)

PassPoint son dos piezas que se despliegan por separado:

| Pieza | Qué es | Dónde | Config |
|---|---|---|---|
| **apps/web** | Frontend Vite + PWA + SEO | **Vercel** | `vercel.json` (raíz) |
| **apps/api** | API NestJS + Prisma | **Render** | `render.yaml` (raíz) |
| Base de datos / Auth | Postgres + magic link | **Supabase** (ya en la nube) | — |

> **Orden recomendado:** primero la **API (Render)** para obtener su URL, luego el
> **Web (Vercel)** apuntando a esa URL, y al final se cruzan las variables.
> Rama a desplegar: **`proto-dashboard`**.

---

## Paso 1 — API en Render

1. Entra a **https://render.com** e inicia sesión con GitHub (cuenta de la org).
2. **New → Blueprint** → conecta el repo **`rgytgroup/PassPoint`**.
3. Render detecta `render.yaml` y propone el servicio `passpoint-api`. Confírmalo.
4. En **Environment**, rellena las variables (valores reales, NUNCA en git):

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | Cadena de Supabase. **Usa el pooler** (Connection Pooling, puerto `6543`, `?pgbouncer=true`) para producción. |
   | `SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `SUPABASE_SERVICE_KEY` | Service role key (solo backend) |
   | `STRIPE_SECRET_KEY` | `sk_live_…` o `sk_test_…` |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_…` (lo obtienes en el Paso 4) |
   | `RESEND_API_KEY` | `re_…` |
   | `APP_BASE_URL` | **URL del web en Vercel** (la tendrás tras el Paso 2 → vuelve aquí) |

5. **Create**. Render instala, corre `prisma generate` + `nest build` y arranca
   `node apps/api/dist/main.js`. Healthcheck: `/api/health`.
6. Copia la URL pública, p. ej. `https://passpoint-api.onrender.com`.

> **Nota:** el plan free se **duerme** por inactividad; el primer request tras
> dormir tarda ~50 s. Para producción real, subir de plan.

### Esquema de la base de datos
Si la BD de Supabase está vacía, aplica el esquema una vez (desde tu máquina con
el `.env` apuntando a producción):
```
npm run prisma:push --workspace apps/api
```
La **regla de oro** sigue: solo preguntas `HUMAN_APPROVED` se sirven.

---

## Paso 2 — Web en Vercel

1. Entra a **https://vercel.com** con GitHub e **Add New → Project** → importa
   **`rgytgroup/PassPoint`**.
2. **Root Directory: déjalo en la raíz** (`./`). El `vercel.json` ya define el
   build del monorepo (`npm run build --workspace apps/web` → `apps/web/dist`).
   No cambies Framework/Build/Output; los toma del `vercel.json`.
3. **Environment Variables:**

   | Variable | Valor |
   |---|---|
   | `VITE_API_BASE` | URL de la API en Render (Paso 1), p. ej. `https://passpoint-api.onrender.com` |
   | `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | Anon/public key de Supabase (no la service key) |

4. **Deploy.** Vercel construye el web + genera las páginas SEO + PWA.
5. **Production Branch:** en **Settings → Git**, pon la rama de producción en
   **`proto-dashboard`** (o mergea `proto-dashboard` → `main` cuando esté OK).
6. Copia la URL, p. ej. `https://passpoint.vercel.app`.

---

## Paso 3 — Cruzar las variables

1. Vuelve a **Render → passpoint-api → Environment** y pon
   `APP_BASE_URL = https://passpoint.vercel.app` (tu URL de Vercel).
   Esto habilita **CORS** para el frontend y los enlaces de la API. **Redeploy**.
2. (Ya hecho en Paso 2) `VITE_API_BASE` en Vercel apunta a Render.

---

## Paso 4 — Supabase (Auth) y Stripe

**Supabase → Authentication → URL Configuration:**
- **Site URL:** `https://passpoint.vercel.app`
- **Redirect URLs:** añade `https://passpoint.vercel.app/**`
  (sin esto, el magic link no vuelve a la app).

**Stripe → Developers → Webhooks → Add endpoint:**
- **Endpoint URL:** `https://passpoint-api.onrender.com/api/stripe/webhook`
- Eventos: al menos `checkout.session.completed`.
- Copia el **Signing secret** (`whsec_…`) → ponlo en Render como
  `STRIPE_WEBHOOK_SECRET` y **redeploy**.

---

## Referencia rápida de variables

| Variable | Vercel (web) | Render (api) |
|---|:--:|:--:|
| `VITE_API_BASE` | ✅ | |
| `VITE_SUPABASE_URL` | ✅ | |
| `VITE_SUPABASE_ANON_KEY` | ✅ | |
| `DATABASE_URL` | | ✅ |
| `SUPABASE_URL` | | ✅ |
| `SUPABASE_SERVICE_KEY` | | ✅ |
| `STRIPE_SECRET_KEY` | | ✅ |
| `STRIPE_WEBHOOK_SECRET` | | ✅ |
| `RESEND_API_KEY` | | ✅ |
| `APP_BASE_URL` | | ✅ |

## Comprobación final
- `https://passpoint-api.onrender.com/api/health` → responde OK.
- `https://passpoint.vercel.app` → carga; elige un estado, inicia sesión (magic
  link) y practica. El dashboard debe traer datos de la API.
- Las Hero Images son de Wikimedia (CC BY-SA, ver `apps/web/public/heroes/CREDITS.md`);
  para producción evaluar reemplazo por CC0/compradas.
