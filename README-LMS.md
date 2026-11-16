# Academia (LMS) de Cluster

La academia es el LMS. El equipo la arma en `/dashboard/cursos`. El alumno la usa en `/academia`. Las dos cosas leen la misma base Neon del CRM. El panel, los contactos y los leads están en [README-CRM.md](README-CRM.md).

Hay dos identidades:

| Quién | Tabla | Cuándo aparece |
| --- | --- | --- |
| Contacto del CRM | `contacts` | Formularios, citas, embudo. El panel también puede inscribirlo a un curso. |
| Persona de la academia | `valux_people` | Checkout, alta manual o ficha. Es quien entra a `/academia`. |

Una fila de `lms_enrollments` lleva `contact_id` o `person_id`. El aula pública solo mira `person_id`.

## Qué es un curso

Tabla `lms_courses`: título, slug único, descripción, precio en centavos, portada, profesor (`teacher_id`), publicado o no.

Por dentro:

- **Secciones** (`lms_sections`), ordenadas.
- **Lecciones** (`lms_lessons`): slug único dentro del curso, texto, video, puntos (10 si no se dice otra cosa), duración y sección.
- **Recursos** (`lms_resources`): tipo, título, URL o texto.
- **Inscripciones** (`lms_enrollments`): alumno, nota final y notas internas.
- **Progreso** (`lms_progress`): puntaje y fecha en que se completó cada lección.

Crear, publicar, borrar y calificar es `src/lib/crm/lms-actions.ts`. Leer el temario del panel es `src/lib/crm/lms.ts`.

Al crear un curso se puede marcar “publicar” y pegar el video de la primera lección. El slug sale del título. Publicar es lo que lo muestra en `/academia`. Borrar el curso borra secciones, lecciones, recursos, progreso e inscripciones.

Desde la ficha del curso el equipo puede:

- agregar secciones, lecciones y recursos;
- inscribir una persona de la academia (`enrollPerson`) o un contacto del CRM (`enrollContact`);
- guardar la nota de una lección y la nota final.

## Menú del panel

Todo cuelga de `/dashboard/cursos`.

| Pantalla | Qué hace |
| --- | --- |
| Cursos | Temario, precio, portada y publicación |
| Marketplace | Productos digitales (`valux_products`). Nacen en revisión `pendiente` |
| Blog | Posts (`valux_posts`). Nacen en `borrador` |
| Ventas | Cada cobro en `valux_sales`: total, comisión de Cluster y parte del creador |
| Revisiones | Aprobar o rechazar productos y posts. Ahí pasan a `publicado` |
| Fichas | Solicitudes de alta (`valux_applications`), con estado `nueva` hasta que alguien las mueve |
| Personas | Usuarios de `valux_people` |
| Clientes | Quienes ya tienen una venta |
| Suscripción | Periodos en `valux_subscriptions` |
| Liquidaciones | Lo que se le debe a cada creador por mes (`valux_payouts`) |
| Donaciones | Aportes en `valux_donations` |
| Comisión | `valux_settings`: comisión **30 %** y suscripción **USD 20** al nacer la base |

Roles que usa el código: `usuario`, `suscriptor`, `asociado`, `profesor`, `junta`. Una persona inactiva (`is_active = false`) no lee cursos ni productos de pago.

`recordSale`, en el panel, otorga un curso, un producto o una suscripción sin pasar por la pasarela. Sirve para cargar una venta a mano.

## Lo que ve el alumno

Rutas en `src/app/academia/`.

| Ruta | Uso |
| --- | --- |
| `/academia` | Catálogo de cursos publicados |
| `/academia/[slug]` | Temario del curso |
| `/academia/[slug]/[lesson]` | Lección, video y recursos |
| `/academia/mis-cursos` | Cursos de la persona con sesión |
| `/academia/marketplace` | Productos ya publicados |
| `/academia/blog` | Posts publicados |
| `/academia/entrar` | Volver a entrar con el correo |
| `/academia/perfil` | Nombre, bio, nicho, redes y PayPal para cobrar |
| `/academia/suscripcion` | Comprar meses de suscripción |
| `/academia/apoyar` | Donación |
| `/academia/ficha` | Formulario largo de alta |

La sesión del alumno es la cookie `cluster_academia`: el id de `valux_people`, HttpOnly, 90 días, path `/`. No es la cookie del CRM.

**Volver a entrar** (`enterAcademia`) no crea cuentas. El correo tiene que existir y, además, tener una inscripción, una venta, una suscripción, o un rol distinto de `usuario`. Si no, la pantalla responde error.

**Curso gratis** (precio 0): `checkout` llama a `grantAccess` en el momento, deja la cookie y entra al curso. No pide pasarela.

**Curso, producto, suscripción o donación con precio:** hace falta PayPal o Stripe.

1. Si hay `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET`, se usa PayPal (`PAYPAL_MODE=sandbox` o el modo live). Se guarda un intento en `valux_intents` y el alumno aprueba en PayPal. El retorno es `/academia/paypal/retorno`. Cancelar cae en `/academia/paypal/cancelado`.
2. Si PayPal no está y sí hay `STRIPE_SECRET_KEY`, el checkout es de Stripe y vuelve por `/academia/stripe/retorno`.
3. Si no hay ninguna de las dos, el formulario vuelve con `?error=pasarela` y no entrega nada.

La suscripción con precio es **recurrente**: cada mes, al precio de `valux_settings`. En PayPal se crea un plan mensual por precio (se guarda en `crm_meta`) y una suscripción `I-…`; en Stripe, un checkout en modo `subscription` (`sub_…`). El id queda en `valux_subscriptions.gateway_id`. La donación sigue siendo un monto mensual pagado de una vez por hasta 24 meses.

El alumno ve su suscripción en `/academia/suscripcion` y puede cancelar la renovación: queda en `no_renueva` y conserva el acceso hasta el vencimiento. Cancelar desde el panel la corta ya, también en la pasarela.

## Webhooks

El retorno del navegador no basta: si el alumno cierra la pestaña o el mes se renueva, solo avisa el webhook. Los dos llaman a las mismas funciones de `fulfill.ts` y son idempotentes por id de pasarela.

| Pasarela | URL | Eventos |
| --- | --- | --- |
| Stripe | `/api/academia/stripe` | `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted` |
| PayPal | `/api/academia/paypal` | `CHECKOUT.ORDER.APPROVED`, `BILLING.SUBSCRIPTION.ACTIVATED`, `PAYMENT.SALE.COMPLETED`, `BILLING.SUBSCRIPTION.CANCELLED`, `BILLING.SUBSCRIPTION.SUSPENDED`, `BILLING.SUBSCRIPTION.EXPIRED` |

Cada cobro mensual es una venta `suscripcion` sin vendedor y mueve el vencimiento.

## Qué pasa cuando el pago cierra

`grantAccess` (`src/lib/valux/fulfill.ts`) es el único lugar que abre el acceso:

1. Si ese id de orden ya está en `valux_sales` o `valux_donations`, no crea otra fila.
2. Una donación solo se anota como `pagada`. No crea persona ni inscripción.
3. En lo demás, crea la persona si el correo no existe. La compra ya no cambia el rol: `suscriptor` queda para dar acceso a mano.
4. Parte el monto con `splitCents`: la comisión configurada se queda Cluster (`fee_cents`) y el resto es del profesor del curso o del creador del producto (`seller_cents`). Sin creador, todo el monto queda como comisión. El periodo de la venta es `YYYY-MM` en hora de Tegucigalpa.
5. Si es un curso y esa persona no estaba inscrita, inserta `lms_enrollments`.
6. Si es suscripción sin pasarela (precio 0 o venta a mano), inserta un periodo `activa` que vence a los N meses. Las de pasarela pasan por `activateSubscription`.
7. Manda el correo “Tu acceso en la academia” si Resend está configurado.

## Quién puede leer

`canReadCourse` y `canReadProduct` en `src/lib/valux/data.ts`.

Un curso de precio 0 lo lee cualquiera. Uno de pago lo lee si la persona está activa y cumple una de estas:

- rol `junta`;
- rol `profesor` y es el `teacher_id` de ese curso;
- suscripción vigente, o rol `suscriptor` (el rol solo ya abre el asiento), o rol `asociado` sin filas de suscripción;
- tiene inscripción de ese curso.

Un producto de precio 0 es público. Uno de pago lo abre la junta, su creador, el mismo asiento de suscripción, o una venta de ese producto para esa persona.

Completar una lección (`completeLesson`) exige sesión, curso publicado y permiso de lectura. Guarda `completed_at` en `lms_progress` de esa persona. No pisa una fecha que ya existía. La nota numérica la carga el equipo desde el panel, no el alumno.

El catálogo público no muestra el cuerpo de la lección: título, sección y duración. El texto, el video y los recursos salen en la página de la lección.

## Liquidaciones

`buildPayouts` junta, por creador y por mes, los `seller_cents` de `valux_sales` que todavía no están en un pago. El vencimiento queda el día 10 del mes siguiente. Cada par creador + periodo es único.

`markPayout` lo pasa a `transferida`. Si la persona tiene `paypal_email` y PayPal está configurado, intenta el envío con `sendPaypalPayout`. Si PayPal lo rechaza, la fila sigue pendiente y guarda la nota “PayPal no aceptó el envío.”

## Archivos

```
src/app/academia/              Catálogo, aula, blog, marketplace y retornos de pago
src/app/dashboard/(panel)/cursos/   Operación del equipo
src/lib/crm/lms.ts             Lectura del temario en el panel
src/lib/crm/lms-actions.ts     Crear curso, lección, inscripción y notas
src/lib/valux/data.ts          Catálogo público y permisos de lectura
src/lib/valux/actions.ts       Checkout, entrar, perfil, revisión, liquidar
src/lib/valux/fulfill.ts       Crear persona, venta, inscripción y correo
src/lib/valux/session.ts       Cookie del alumno
src/lib/valux/money.ts         Comisión, periodo y slugs
src/lib/valux/paypal.ts        Órdenes y payouts
src/lib/valux/stripe.ts        Checkout de Stripe
```

## Variables

| Variable | Para qué |
| --- | --- |
| Las del CRM (`DATABASE_URL`, conector Neon, etc.) | La academia usa la misma base. Ver [README-CRM.md](README-CRM.md) |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE` | Cobrar y liquidar. Si están, PayPal gana sobre Stripe |
| `STRIPE_SECRET_KEY` | Cobrar cuando PayPal no está |
| `STRIPE_WEBHOOK_SECRET` | Firma del webhook de Stripe (`whsec_…`) |
| `PAYPAL_WEBHOOK_ID` | Id del webhook creado en PayPal; sin él se rechazan sus avisos |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` | Correo de acceso |
| `BLOB_READ_WRITE_TOKEN` | Portadas y archivos subidos |
