# CRM de Cluster

El CRM es el panel en `/dashboard`. Vive en este mismo repo de Next.js y usa la base Postgres de Neon que también usa la academia. La academia está documentada en [README-LMS.md](README-LMS.md).

Un **contacto** (`contacts`) es una persona del negocio: escribió un formulario, compró, agendó o se cargó a mano. No es lo mismo que un alumno de la academia (`valux_people`). Una inscripción a un curso puede apuntar a cualquiera de los dos.

## Entrar al panel

`/dashboard` no se indexa. Sin sesión, el layout manda a `/dashboard/login`.

La sesión es la cookie `cluster_dashboard`: HttpOnly, path `/dashboard`, 14 días, firmada con HMAC. El secreto es `CAREERS_AUTH_SECRET` o, si no está, `DASHBOARD_AUTH_SECRET`.

Puede entrar un correo que esté en la lista de `src/lib/crm/session.ts`: el administrador principal del código, más los de `DASHBOARD_ALLOWED_EMAILS` y `CAREERS_ADMIN_EMAILS`.

Hay dos caminos:

1. **Correo y clave.** La clave tiene al menos 8 caracteres y se guarda en `crm_admins` con scrypt. La primera vez solo el administrador principal puede crear la clave. Después, cada correo de la lista entra con la suya.
2. **Google.** Hace falta `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`. El retorno es `/dashboard/auth/callback`. Solo pasa un correo verificado que ya esté en la lista.

Cada vez que se abre el panel se corren las automatizaciones vencidas. Si la base no responde, se muestra la pantalla de configuración.

## La base

`src/lib/crm/db.ts` crea las tablas la primera vez que algo llama a `crm()`. No hay un paso de migración aparte.

La URL se busca en este orden (`src/lib/crm/connect.ts`):

1. Conector de Vercel `neon/clustercrm`. En local hace falta `VERCEL_OIDC_TOKEN` (`vercel env pull`).
2. `DATABASE_URL` o `POSTGRES_URL`.
3. `NEON_API_KEY` (empieza por `napi_`). Elige el proyecto cuyo nombre contiene “cluster”, la rama primaria y arma la cadena. `NEON_ORG_ID` acota la organización si hace falta.

La URL se recuerda 10 minutos.

Si `crm_meta` tiene la clave `seeded`, esa primera pasada borra las filas operativas y quita la clave. Sirve para limpiar datos de prueba viejos una sola vez. Una base que ya no tiene esa clave no se vacía de nuevo.

## Cómo entra un lead del sitio

Los formularios llaman a `captureLead` (`src/lib/crm/leads.ts`).

1. Guarda el envío en `form_submits`, con el nombre del formulario y el resto de campos en `details`.
2. Si el correo es válido, busca el contacto por email. Si no existe, lo crea y pone `source` con el nombre del formulario. Si existe, completa teléfono, país, ciudad y estado solo donde estaban vacíos.
3. Amarra el envío a ese contacto.
4. Dispara las automatizaciones en estado `activa`, salvo que se pase `automate: false`.

Sin un correo con `@` queda el envío, pero no hay contacto ni automatización. Los campos de identidad (nombre, email, teléfono, país) no se duplican dentro de `details`.

## Secciones

La navegación está en `src/components/dashboard/nav.ts`. Leer es `src/lib/crm/queries.ts`. Escribir es `src/lib/crm/actions.ts`.

**Inicio** (`/dashboard`). Resumen de contactos, citas, campañas y el dinero que se está moviendo.

**Contactos** (`/dashboard/contactos`). Búsqueda, creados en 7 o 30 días, y filtro por membresía. La ficha tiene notas y etiquetas. También hay importación, propiedades custom, envíos de formularios y ajustes de membresías y tags. Borrar un contacto borra sus notas, etiquetas, oportunidades y mensajes.

**Embudo** (`/dashboard/embudo`). Una oportunidad pertenece a un contacto y tiene título, valor y etapa. Las etapas son fijas: nuevo, calificado, propuesta, ganado, perdido.

**Citas** (`/dashboard/citas`).

- Eventos: nombre, duración, descripción.
- Operadores: quién atiende.
- Servicios: duración y precio.
- Agenda: reservas con inicio, fin y estado `confirmada`. Al crear una se puede mandar un `.ics`. Cancelar deja el estado en cancelada; la fila sigue.

**Mensajes** (`/dashboard/mensajes`).

- Campañas. Por correo van a suscriptores con estado `subscribed`. Por WhatsApp o SMS van a contactos que tengan teléfono. Cada disparo recorre como máximo 200 destinatarios.
- Automatizaciones. Solo corren las que están en `activa`. Los pasos son `email`, `espera`, `etiqueta` y `whatsapp`. Una espera (“2 días”, “3 horas”, o un número suelto en minutos) corta el flujo y deja un trabajo en `automation_jobs` para más adelante. El panel, al cargar, ejecuta los trabajos vencidos. `automation_runs` impide que el mismo contacto entre dos veces a la misma automatización.
- Bandeja. Hilos en `messages`: contacto, canal, dirección y cuerpo.
- Plantillas, correos de sistema (se pueden apagar), dominio de envío y marca (empresa, dirección, remitente, reply-to).

**Comunidad** (`/dashboard/comunidad`). Círculos con slug y precio. Un contacto entra una sola vez a cada círculo. Los posts nacen en `pendiente` hasta moderarlos. El slug público de la comunidad sale de `community_settings`.

**Sitios** (`/dashboard/sitios`) y **editor** (`/dashboard/editor`). Una página es `sitio` o `embudo`, en `borrador` hasta publicarla. Los bloques (`nav`, `heading`, `text`, `button`) se guardan como JSON en `sites.blocks`. El editor cambia orden, texto y enlace.

**Tienda** (`/dashboard/tienda`). Productos y pedidos del panel (`products`, `orders`). El marketplace de cursos y descargas es otra cosa: está en la academia.

## Canales de salida

| Canal | Qué tiene que existir | A quién llega |
| --- | --- | --- |
| Correo | `RESEND_API_KEY` y un from (`CONTACT_FROM_EMAIL`) | Suscriptores, pasos de automatización, accesos de la academia |
| WhatsApp | `WHATSAPP_TOKEN` y `WHATSAPP_PHONE_ID` | Contactos con teléfono |
| SMS | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` | Contactos con teléfono, si WhatsApp no está configurado |

Si el canal no está listo, la acción no envía y deja el motivo. El código de envío está en `src/lib/crm/deliver.ts`.

## Archivos

```
src/app/dashboard/           Rutas del panel, login y callback de Google
src/components/dashboard/    Shell, menú y tablas
src/lib/crm/db.ts            Tablas y cliente Neon
src/lib/crm/connect.ts       De dónde sale la URL
src/lib/crm/session.ts       Cookie y Google
src/lib/crm/access.ts        Login por clave
src/lib/crm/admins.ts        Hash de la clave
src/lib/crm/leads.ts         Formularios del sitio
src/lib/crm/queries.ts       Lecturas
src/lib/crm/actions.ts       Altas, ediciones y borrados
src/lib/crm/automations.ts   Flujos y trabajos
src/lib/crm/deliver.ts       Resend, Twilio, WhatsApp
src/lib/crm/types.ts         Etapas del embudo y tipos del panel
```

## Variables

| Variable | Para qué |
| --- | --- |
| `DATABASE_URL` o `POSTGRES_URL` | Base si el conector no responde |
| `NEON_API_KEY`, `NEON_ORG_ID` | Encontrar el proyecto en Neon |
| `DASHBOARD_ALLOWED_EMAILS` | Admins extra |
| `CAREERS_AUTH_SECRET` o `DASHBOARD_AUTH_SECRET` | Firma de la cookie |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Login con Google |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` | Correo |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` | WhatsApp |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` | SMS |

El resto del ejemplo está en `.env.example`.
