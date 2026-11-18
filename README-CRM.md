# CRM de Cluster

El CRM es el panel en `/dashboard`. Vive en este mismo repo de Next.js y usa la base Postgres de Neon que también usa la academia. La academia está documentada en [README-LMS.md](README-LMS.md).

Un **contacto** (`contacts`) es una persona del negocio: escribió un formulario, compró, agendó o se cargó a mano. No es lo mismo que un alumno de la academia (`valux_people`). Una inscripción a un curso puede apuntar a cualquiera de los dos.

## Entrar al panel

`/dashboard` no se indexa. Sin sesión, el layout manda a `/dashboard/login`.

La sesión es la cookie `cluster_dashboard`: HttpOnly, path `/dashboard`, 14 días, firmada con HMAC. El secreto es `CAREERS_AUTH_SECRET` o, si no está, `DASHBOARD_AUTH_SECRET`.

**Quién entra y con qué rol** (`src/lib/crm/roles.ts`):

| Rol | Ve |
| --- | --- |
| Superadmin | Todo, incluido **Equipo** (`/dashboard/equipo`) |
| Admin de contenido | Academia: cursos, lecciones, misiones, retos, marketplace, blog, revisiones, fichas, personas |
| Finanzas | Academia: ventas, cupones, transferencias, comprobantes, clientes, membresías, liquidaciones y contratos, donaciones, comisión, analítica |
| Profesor | `/dashboard/profesor` (sus cursos, alumnos, ventas y liquidaciones) y el temario de sus propios cursos, con «Pedir revisión» |

- Los correos de la lista del servidor (`PRIMARY_ADMIN` en `session.ts`, `DASHBOARD_ALLOWED_EMAILS`, `CAREERS_ADMIN_EMAILS`) son superadmin fijos.
- El resto del equipo vive en `crm_staff`. Un superadmin lo da de alta en Equipo con una clave inicial de 12 caracteres o más.
- El profesor ve los cursos donde la persona de la academia con su mismo correo es el profesor asignado.

**Permisos en el servidor, no en los botones:**
- Cada server action llama a `requireDashboard(área)`. Sin área, la acción es del CRM y solo la puede usar un superadmin.
- El middleware redirige las páginas fuera del rol, también en la navegación interna.
- El rol se vuelve a leer de la base en cada pedido. Si cambia, la sesión deja de valer y hay que volver a entrar.

**Entrar son dos pasos:**

1. **Correo y clave, o Google.**
   - La clave tiene al menos 8 caracteres y se guarda en `crm_admins` con scrypt. La primera vez solo el administrador principal puede crear la suya, con `CAREERS_ADMIN_PASSWORD`.
   - Google necesita `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`, con retorno en `/dashboard/auth/callback`. Solo pasa un correo verificado que sea del equipo.
2. **Código TOTP de 6 dígitos (MFA, obligatorio para todos)** en `/dashboard/login/mfa`.
   - La primera vez muestra la clave para cargarla en una app de códigos (Google Authenticator, 1Password, Authy).
   - El paso dura 10 minutos (cookie `cluster_mfa`).
   - Un código usado no se acepta otra vez. 5 códigos malos bloquean 15 minutos (`crm_mfa`).
   - Las sesiones de antes del segundo factor ya no sirven.
   - Si alguien pierde el celular, un superadmin lo reinicia en Equipo.
   - Si el único superadmin pierde el suyo: `DELETE FROM crm_mfa WHERE email = '<correo>'` en la base.

`scripts/check-misiones-equipo.ts` prueba los roles, el TOTP, las misiones y el XP.

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

## Tarea programada

`/api/cron/crm` corre cada 5 minutos (`vercel.json`). Necesita `CRON_SECRET`: Vercel lo manda como `Authorization: Bearer …` y sin él la ruta responde 401. Ejecuta los pasos de automatización vencidos, vence transferencias, corre una vez al día la conciliación de la academia (ver README-LMS) y manda campañas en lotes. Abrir el panel también ejecuta los pasos vencidos; cada paso se toma una sola vez.

**Campañas.** Al enviar, toda la audiencia entra a `campaign_sends` (`pendiente` → `enviado` o `fallido`) y el panel manda el primer lote. El resto sale con la tarea programada. Si el primer lote falla completo, la campaña vuelve con `?error=envio` y no queda encolada. Cada correo lleva un enlace de baja firmado y las cabeceras `List-Unsubscribe` / `List-Unsubscribe-Post`. La baja es `/api/crm/baja`: el enlace muestra un botón y el POST da de baja.

## Canales de entrada

Las respuestas llegan a la bandeja como mensajes `in`. El contacto se busca por los últimos 8 dígitos del teléfono o por el correo. Si no existe se crea; por teléfono lleva un correo `<número>@whatsapp.invalid` o `@sms.invalid`, porque `contacts` exige correo.

| Canal | URL del webhook | Variables |
| --- | --- | --- |
| WhatsApp (Meta Cloud API) | `/api/crm/whatsapp` | `WHATSAPP_VERIFY_TOKEN` (verificación) y `WHATSAPP_APP_SECRET` (firma) |
| SMS (Twilio) | `/api/crm/sms` | `TWILIO_AUTH_TOKEN` (firma) |
| Correo (Resend inbound) | `/api/crm/correo` | `RESEND_INBOUND_WEBHOOK_SECRET` (`whsec_…`) |

Sin la variable de firma, la ruta rechaza todo.

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
src/lib/crm/campaigns.ts     Cola de campañas y enlace de baja
src/lib/crm/inbound.ts       Mensajes entrantes
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
| `CRON_SECRET` | Tarea programada |
| `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` | WhatsApp entrante |
| `RESEND_INBOUND_WEBHOOK_SECRET` | Correo entrante |

El resto del ejemplo está en `.env.example`.
