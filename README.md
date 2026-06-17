# Cluster Media — Website

Website de **Cluster Media**, agencia de marketing digital para negocios
hispanos. Construido en **Next.js 15 (App Router) + TypeScript + Tailwind CSS**
con estilo *dark modernism*.

## Requisitos

- Node.js 18.18+ (probado en Node 22)

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # desarrollo en http://localhost:3000
npm run build    # build de producción (SSG)
npm run start    # servir el build de producción
```

## Variables de entorno

La seccion `/seo-audit` usa OpenRouter desde una ruta server-side de Next.js.
Copia `.env.example` a `.env.local` y define:

```bash
OPENROUTER_API_KEY=tu_api_key
OPENROUTER_MODEL=openrouter/free
```

## Estructura

```
src/
  app/            Rutas (Home, servicios, blog, contacto, legal, sitemap, robots)
  components/
    layout/       Header, Footer, botón flotante de WhatsApp
    ui/           Logo, Button, Icon, Section, Reveal (animaciones)
    blocks/       Hero de páginas, CTA, FAQ, tarjetas, formulario, etc.
    home/         Hero del Home (video de fondo)
    seo/          JSON-LD (Organization, LocalBusiness, FAQ, etc.)
  lib/site.ts     Configuración central: navegación, servicios, precios, casos
public/assets/    Video del hero (mp4/webm/poster) y logo
```

## Configuración pendiente

Edita `src/lib/site.ts` para conectar datos reales:

- `calendarUrl` — enlace/embed de tu calendario (Calendly, etc.)
- `whatsappNumber` — número de WhatsApp (sin signos)
- `social`, `phoneDisplay`, `email`
- El formulario de contacto hace fallback a WhatsApp; conéctalo a tu CRM/GoHighLevel.

## Paleta de marca

- Fondo oscuro: `#0E0E0E` / `#1D1D1D`
- Texto claro: `#F9F9F9`
- Verde de marca: `#2E7D32`
