# Perdomo Real Estate — sitio bilingüe + panel de administración

Sitio inmobiliario ES/EN para Punta Cana con el proyecto insignia **89 Villas Macao**, buscador avanzado, herramientas (calculadoras, comparador, favoritos), captación de leads y un panel `/admin` para gestionar todo el contenido.

> **Todo el contenido actual es de ejemplo.** Cada registro sembrado tiene `is_placeholder = true`: la interfaz muestra la etiqueta discreta "Información de ejemplo / Sample information" y ese contenido **nunca** se emite en datos estructurados (JSON-LD). Las imágenes son marcadores con relación de aspecto fija ("Imágenes próximamente").

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, SSG/ISR) + TypeScript + React 19 |
| Estilos y animación | Tailwind CSS v4, Motion (Framer Motion), Lenis (smooth scroll) |
| Idiomas | next-intl v4 — rutas `/es` y `/en`, slugs traducidos, hreflang + canonical automáticos |
| Datos | Supabase (Postgres + Auth + Storage) |
| Emails | Resend (notificación de cada lead) |
| Mapas | Leaflet + OpenStreetMap/CARTO (sin API key, carga diferida) |
| PDF | pdf-lib (brochure por proyecto generado al vuelo) |
| Deploy | Vercel |

**Sin Supabase configurado el sitio funciona igual**: lee los datos de ejemplo de `src/data/seed.ts` (útil para diseño y previsualizaciones). Los formularios validan y responden, pero el lead solo se registra en el log del servidor. El admin muestra un aviso de configuración.

---

## Variables de entorno

Copia `.env.example` a `.env.local` y completa:

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL pública sin barra final (canonical, hreflang, sitemap, OG). Ej. `https://www.perdomorealestate.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Solo servidor.** Inserta leads, ejecuta el seed, invita usuarios |
| `RESEND_API_KEY` | Clave de Resend |
| `LEADS_NOTIFY_TO` | Correo(s) que reciben los leads (separados por coma) |
| `LEADS_NOTIFY_FROM` | Remitente verificado en Resend, ej. `Perdomo Real Estate <leads@tudominio.com>` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Opcional: Cloudflare Turnstile anti-spam |
| `IP_HASH_SALT` | Sal para el hash de IP del rate limit (cualquier texto aleatorio) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Opcional: token de verificación de Google Search Console (método etiqueta HTML). También puede verificarse por DNS |

GTM / GA4 **no** van en variables: se configuran en **Admin → Ajustes** y solo se cargan si el visitante acepta cookies.

---

## Cómo correr en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000 (redirige a `/es` o `/en` según el navegador).

### Conectar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor** ejecuta `supabase/migrations/0001_init.sql` (tablas, RLS, roles, bucket `media`).
   - Alternativa con CLI: `npx supabase link --project-ref <ref>` y `npx supabase db push`.
3. Completa `.env.local` con URL, anon key y service role key.
4. Siembra el contenido de ejemplo:
   ```bash
   npm run seed            # upsert (se puede repetir)
   npm run seed -- --reset # borra contenido previo (no toca leads ni usuarios)
   ```
5. Crea el primer usuario en **Authentication → Users → Add user** (email + contraseña). **El primer usuario creado se convierte en `admin`** automáticamente; los siguientes son `editor` (cámbialo en Admin → Usuarios).
6. Entra a http://localhost:3000/admin.

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run lint` | Chequeo de tipos (`tsc --noEmit`) |
| `npm run seed` | Siembra Supabase con el contenido de ejemplo |

---

## Desplegar en Vercel

1. Sube el repositorio a GitHub e impórtalo en Vercel (framework: Next.js, sin cambios de build).
2. Agrega las variables de entorno de la tabla anterior en **Settings → Environment Variables** (Production y Preview).
3. En Supabase → **Authentication → URL Configuration** agrega el dominio de producción a *Site URL* y *Redirect URLs* (para recuperación de contraseña).
4. Conecta el dominio en Vercel y actualiza `NEXT_PUBLIC_SITE_URL`.
5. Verifica `https://tudominio.com/sitemap.xml` y `https://tudominio.com/robots.txt`.

**ISR sin redeploy:** las páginas públicas se regeneran cada 5 minutos y, además, cada guardado en el admin llama a `revalidatePath("/", "layout")`, así que los cambios se ven al instante.

---

## Cómo agregar un proyecto desde el admin

1. **Admin → Proyectos → Nuevo**.
2. Completa nombre, textos ES | EN lado a lado, ubicación (lat/lng), estado, precio desde y fecha de entrega.
3. Agrega amenidades, timeline (fase, fecha, % de avance), planes de pago (los % deben sumar 100), distancias, datos del desarrollador y documentos PDF.
4. **SEO**: title y description por idioma y los slugs `slug_es` / `slug_en` (se sugieren desde el nombre).
5. Guarda y luego, en la misma ficha:
   - **Imágenes**: arrastra varias a la vez; se comprimen y convierten a WebP en el navegador. Reordena arrastrando, marca la portada y edita el texto alternativo ES/EN.
   - **Modelos de villa** (si aplica) con sus fotos y planos.
6. Si el proyecto tiene unidades/lotes, ve a **Admin → Unidades**, elige el proyecto y usa "Generar unidades"; luego edita estado/precio en la tabla o con el **cambio de estado en lote**. El masterplan y la tabla de disponibilidad públicos se actualizan solos.
7. Desactiva **"Información de ejemplo"** en cada registro cuando su contenido sea real y marca **Publicado**.
8. El proyecto insignia (`is_flagship`) se muestra en la landing `/es/villas-en-venta-macao-punta-cana`.

Para el WhatsApp prellenado del proyecto: **Admin → Ajustes → Mensajes de WhatsApp por proyecto**.

### Imagen 3D del hero
La imagen actual está en `public/images/hero-villa.webp` (WebP con transparencia, 1448×1039, optimizada desde el PNG original). Para cambiarla, reemplaza ese archivo por otra imagen sin fondo de proporción similar (~4:3) y vuelve a desplegar; Next.js genera automáticamente versiones AVIF/WebP del tamaño adecuado para cada pantalla. Si quitas el archivo, el hero vuelve a mostrar la ilustración de ejemplo.

---

## Estructura

```
src/
  app/
    [locale]/            páginas públicas (home, villas-macao, properties, projects, blog, legal…)
    admin/               panel de administración (Supabase Auth, roles admin/editor)
    actions/leads.ts     server action de leads (Zod, honeypot, rate limit, Supabase, Resend)
    api/brochure/[slug]  PDF del proyecto
    sitemap.ts, robots.ts
  components/            UI, secciones, herramientas, mapa, formularios, admin
  i18n/                  rutas y slugs traducidos (routing.ts)
  lib/                   datos (data.ts), SEO, JSON-LD, búsqueda, formato, Supabase
  data/seed.ts           contenido de ejemplo (fuente única para seed y modo sin BD)
messages/{es,en}/*.json  textos de la interfaz
supabase/migrations/     esquema SQL + RLS
scripts/seed.ts          siembra de Supabase
```

### Analítica (dataLayer)
Eventos ya emitidos: `whatsapp_click`, `form_submit_success`, `price_request`, `visit_request`, `phone_click`, `email_click`. Con Consent Mode v2 en "denied" por defecto; GTM/GA4 se cargan solo al aceptar el banner de cookies. Crea en GTM los activadores de "Evento personalizado" con esos nombres.

### Leads
Tipos: `info`, `price`, `visit` (con fecha, hora y modalidad), `whatsapp_click` (registro anónimo del clic). Protección: honeypot, rate limit por IP con hash (5 envíos / 10 min) y Turnstile opcional. Bandeja en **Admin → Leads** con estados, notas internas y exportación CSV.

### Redirecciones
Mapa de redirecciones en `next.config.ts → redirects()`. Agrega ahí las URLs antiguas cuando reemplaces un sitio existente.

---

## Pendientes antes de publicar

**Contenido real**
- [ ] Fotos y renders reales (hero PNG transparente, galerías 16:9, tarjetas 4:3, planos 1:1, portadas de blog 16:9)
- [ ] Logo definitivo (hoy es un placeholder de texto + ícono en `src/components/layout/Logo.tsx`, `src/app/icon.svg`)
- [ ] Datos reales del proyecto 89 Villas: modelos, precios, estados de los 89 lotes, planes de pago, timeline, desarrollador, documentos legales y brochure PDF
- [ ] Proyectos y propiedades reales; desactivar "Información de ejemplo" en cada uno (o el interruptor global en Ajustes)
- [ ] Artículos de blog y FAQs reales
- [ ] Textos de "Sobre nosotros" y fotos del equipo
- [ ] Revisión legal de privacidad, cookies, términos y aviso de información
- [ ] Número de WhatsApp, teléfono, correo, dirección y redes reales (Admin → Ajustes)

**Técnico**
- [ ] Dominio + `NEXT_PUBLIC_SITE_URL`
- [ ] Supabase de producción (migración + primer usuario admin)
- [ ] Resend: verificar dominio remitente y configurar `LEADS_NOTIFY_*`
- [ ] GTM / GA4: crear contenedor, poner IDs en Admin → Ajustes, configurar activadores
- [ ] Google Search Console: verificar dominio (DNS o `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`), enviar `sitemap.xml` y dar acceso propietario al cliente
- [ ] Copias de seguridad: activar backups diarios / PITR en Supabase (plan Pro) y exportar la base periódicamente
- [ ] (Opcional) Cloudflare Turnstile
- [ ] Lighthouse móvil con imágenes reales (objetivo ≥ 90 en Performance y SEO)
