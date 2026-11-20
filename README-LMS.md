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

La portada de `/academia` separa hasta cuatro cursos destacados, el catálogo completo con búsqueda y filtros (todos, gratis y de pago), y una entrada al Marketplace, que también muestra los cursos publicados. En `/dashboard/cursos`, «La selección de la portada» permite guardar hasta cuatro cursos publicados, sin repetir, en el orden elegido. La selección vive en `crm_meta.academia_featured_courses`. Hasta guardar una selección, se muestran los primeros cuatro publicados; nunca se inventan cursos para completar posiciones.

El acceso de `/academia/entrar` tiene pestañas para **Estudiantes** (código por correo y registro) y **Maestros** (`?acceso=maestros`, contraseña y segundo factor). `/dashboard/login` conserva enlaces antiguos y redirige al acceso docente manteniendo los errores. Cada cuenta conserva los permisos de su rol; elegir una pestaña no asigna permisos.

Todo cuelga de `/dashboard/cursos`.

| Pantalla | Qué hace |
| --- | --- |
| Cursos | Temario, precio, portada y publicación. Un curso con revisión pedida por su profesor dice «Revisión pendiente» |
| Retos | Metas con XP de bonificación (`lms_challenges`) |
| Analítica | KPIs con filtro de fechas y curso (solo finanzas y superadmin) |
| Cupones | Códigos de descuento para cursos (`valux_coupons`, solo finanzas y superadmin) |
| Marketplace | Productos digitales (`valux_products`). Nacen en revisión `pendiente` |
| Blog | Posts (`valux_posts`). Nacen en `borrador` |
| Ventas | Cada cobro en `valux_sales`: total, comisión de Cluster y parte del creador |
| Revisiones | Aprobar o rechazar productos y posts. Ahí pasan a `publicado` |
| Fichas | Solicitudes de alta (`valux_applications`), con estado `nueva` hasta que alguien las mueve |
| Personas | Usuarios de `valux_people`, con etapa, fuente, UTM y consentimientos |
| Clientes | Quienes ya tienen una venta |
| Membresías | Los 3 planes (`valux_plans`: nombre, precio, beneficios, a la venta) y los periodos de `valux_subscriptions` |
| Liquidaciones | Lo que se le debe a cada creador por mes (`valux_payouts`) y el contrato de cada profesor |
| Donaciones | Aportes en `valux_donations` |
| Comisión | `valux_settings`: comisión **30 %** y datos bancarios para transferencia |

Roles que usa el código: `usuario`, `suscriptor`, `asociado`, `profesor`, `junta`. Una persona inactiva (`is_active = false`) no lee cursos ni productos de pago.

`recordSale`, en el panel, otorga un curso, un producto o una suscripción sin pasar por la pasarela. Sirve para cargar una venta a mano. Una membresía cargada así exige elegir el plan: se cobra al precio del plan por los meses indicados y abre lo de ese nivel.

En la ficha de cada curso se elige desde qué plan queda incluido (o ninguno: solo se compra), el order bump y el upsell, cada uno con su precio de oferta.

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
| `/academia/entrar` | Entrar con el correo, o crear cuenta (`?modo=registro`) con nombre, WhatsApp y correo |
| `/academia/entrar/codigo` | Escribir el código de 6 dígitos |
| `/academia/entrar/confirmar` | Destino del enlace del correo: un botón lo gasta |
| `/academia/perfil` | Nombre, bio, nicho, redes y PayPal para cobrar |
| `/academia/suscripcion` | Elegir uno de los 3 planes de membresía |
| `/academia/apoyar` | Donación |
| `/academia/ficha` | Formulario largo de alta |

La sesión del alumno es la cookie `cluster_academia`: el id de `valux_people`, HttpOnly, 90 días, path `/`. No es la cookie del CRM.

**Entrar y registrarse** (`enterAcademia`, `src/lib/valux/login.ts`) no usan contraseña. Cada pedido guarda una fila en `academia_logins` con el hash de un código de 6 dígitos y de un enlace, y los manda por correo:

- vencen a los **15 minutos** y sirven **una sola vez**;
- el código acepta **5 intentos**; al quinto fallo muere;
- máximo **5 pedidos por correo y por hora**; un pedido nuevo anula los anteriores;
- la pantalla responde lo mismo exista o no el correo. A un correo sin cuenta solo le llega código si viene del registro, con nombre y WhatsApp;
- la persona se crea, o recibe su WhatsApp en `valux_people.phone`, recién cuando el código o el enlace se confirman;
- el enlace abre `/academia/entrar/confirmar`, que no lo gasta: lo gasta el botón (POST). Así los antivirus de correo, que solo hacen GET, no lo queman.

La prueba `scripts/check-academia.ts` recorre esto, los planes y los reembolsos contra la base de `.env.local`, y borra lo que crea.

**Curso gratis** (precio 0, también con cupón del 100 %): requiere sesión verificada por código. `checkout` usa el nombre y correo de esa sesión e ignora los del formulario. Sin sesión redirige al registro. No pide pasarela ni crea cookies de acceso.

**Moneda:** la academia cobra en **lempiras (HNL)**. Los montos se guardan en centavos de lempira (`CURRENCY` y `academyMoney` en `src/lib/valux/money.ts`).

**Curso, producto, suscripción o donación con precio:** hace falta Stripe o datos para transferencia. PayPal ya no cobra en la academia; solo queda para liquidar a creadores y para suscripciones viejas.

1. **Tarjeta:** con `STRIPE_SECRET_KEY`, el checkout es de Stripe en HNL y vuelve por `/academia/stripe/retorno`. Se guarda un intento en `valux_intents`.
2. **Transferencia:** aparece cuando el panel tiene datos bancarios (Comisión → Datos para transferencia). Crea una fila en `valux_transfers` con referencia `CL-XXXXXXXX`, vence a las 72 horas y le manda al comprador los datos por correo. En `/academia/transferencia/<referencia>` ve las instrucciones y puede subir el comprobante (privado, solo se abre desde el panel). **No da acceso**: finanzas aprueba en `/dashboard/cursos/transferencias` después de ver el depósito en el banco y anota el número de operación. Aprobar llama a `grantAccess` con el id `tr_<referencia>`, así un doble clic no crea dos ventas. La tarea programada vence las pendientes; una vencida todavía se puede aprobar.

Con los dos métodos disponibles, el formulario pregunta cuál usar.

**Order bump:** si el curso tiene uno, el checkout muestra una casilla **sin marcar** con otro curso a precio de oferta. El precio sale de la base, nunca del navegador. Va en el mismo pago (segunda línea en Stripe o el total de la transferencia) y crea una segunda venta con id `<pago>:bump`.

**Upsell:** al volver del pago (`?ok=1`), quien ya tiene el curso y no tiene el ofrecido ve la oferta. Pide marcar "Autorizo un cargo nuevo" y abre **otro** pago: no reutiliza la tarjeta.
3. Si no hay ninguna de las dos, el formulario vuelve con `?error=pasarela` y no entrega nada.

La membresía con precio es **recurrente**: cada mes, al precio de su plan (`valux_plans`). El plan queda en `valux_subscriptions.plan_id`. Con tarjeta es un checkout de Stripe en modo `subscription` (`sub_…`). Por transferencia se paga un mes por vez. Las suscripciones `I-…` de PayPal que ya existan se siguen renovando y cancelando. El id queda en `valux_subscriptions.gateway_id`. La donación sigue siendo un monto mensual pagado de una vez por hasta 24 meses.

El alumno ve su suscripción en `/academia/suscripcion` y puede cancelar la renovación: queda en `no_renueva` y conserva el acceso hasta el vencimiento. Cancelar desde el panel la corta ya, también en la pasarela.

## Webhooks

El retorno del navegador no inicia sesión: pagar con un correo no prueba ser su dueño. El alumno entra con el código enviado a su correo. El retorno del navegador no basta: si el alumno cierra la pestaña o el mes se renueva, solo avisa el webhook. Los dos llaman a las mismas funciones de `fulfill.ts` y son idempotentes por id de pasarela.

| Pasarela | URL | Eventos |
| --- | --- | --- |
| Stripe | `/api/academia/stripe` | `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `charge.refunded`, `charge.dispute.created` |
| PayPal | `/api/academia/paypal` | `CHECKOUT.ORDER.APPROVED`, `BILLING.SUBSCRIPTION.ACTIVATED`, `PAYMENT.SALE.COMPLETED`, `BILLING.SUBSCRIPTION.CANCELLED`, `BILLING.SUBSCRIPTION.SUSPENDED`, `BILLING.SUBSCRIPTION.EXPIRED` |

Cada cobro mensual es una venta `suscripcion` sin vendedor y mueve el vencimiento.

**Registro de eventos de Stripe:** cada evento firmado se guarda en `stripe_events` por su id. Si ya tiene `processed_at`, un reenvío responde 200 sin volver a aplicarlo. Si falla, guarda el error y responde 500 para que Stripe reintente.

**Conciliación nocturna** (`src/lib/valux/reconcile.ts`): la tarea programada de cada 5 minutos la corre una vez al día, después de las 3 a. m. de Honduras (el día queda reclamado en `crm_meta.academia_nightly`). Hace tres cosas:
- Pide a Stripe las sesiones pagadas de las últimas 48 horas y entrega las que no tienen venta. Cubre un webhook que no llegó.
- Pasa a `inactivo` a los miembros sin membresía vigente.
- Cuenta los eventos de Stripe sin procesar de los últimos 2 días.

El resultado queda en `crm_meta.academia_reconcile`.

**Reembolsos y disputas** (`revokeSales` en `fulfill.ts`):

- Un reembolso **total** (`charge.refunded`) o una disputa abierta (`charge.dispute.created`) busca en Stripe la sesión o la factura de ese cargo.
- Marca la venta y su bump con `refunded_at`.
- Borra la inscripción, salvo que otra venta vigente pague el mismo curso.
- Corta la membresía en el acto, también en Stripe.
- La venta deja de contar en las liquidaciones.
- Un reembolso parcial no quita nada. En Ventas, el botón **Reembolsar** hace lo mismo a mano, por ejemplo para una transferencia devuelta.
- Si una disputa se gana, el acceso se devuelve con una venta a mano.

## Qué pasa cuando el pago cierra

`grantAccess` (`src/lib/valux/fulfill.ts`) es el único lugar que abre el acceso:

1. Si ese id de orden ya está en `valux_sales` o `valux_donations`, no crea otra fila.
2. Una donación solo se anota como `pagada`. No crea persona ni inscripción.
3. En lo demás, crea la persona si el correo no existe. La compra ya no cambia el rol: `suscriptor` queda para dar acceso a mano.
4. Parte el monto con `splitCents` según el contrato del vendedor (`sellerCommission`). La comisión se la queda Cluster (`fee_cents`) y el resto es del profesor del curso o del creador del producto (`seller_cents`). Sin creador, todo el monto queda como comisión. El periodo de la venta es `YYYY-MM` en hora de Tegucigalpa.
5. Si es un curso y esa persona no estaba inscrita, inserta `lms_enrollments`.
6. Si es suscripción sin pasarela (precio 0 o venta a mano), inserta un periodo `activa` que vence a los N meses. Las de pasarela pasan por `activateSubscription`.
7. Manda el correo “Tu acceso en la academia” si Resend está configurado.
8. Registra `purchase_completed` y sube la etapa del lead a `comprador`, o a `miembro` si es membresía.

## Quién puede leer

`canReadCourse` y `canReadProduct` en `src/lib/valux/data.ts`.

Un curso de precio 0 lo lee cualquiera. Uno de pago lo lee si la persona está activa y cumple una de estas:

- rol `junta`;
- rol `profesor` y es el `teacher_id` de ese curso;
- tiene inscripción de ese curso (comprado: queda aunque la membresía termine);
- membresía vigente cuyo plan tiene nivel igual o mayor al `plan_level` del curso (`0` = ningún plan). Rol `suscriptor`, rol `asociado` sin filas de suscripción y las suscripciones sin plan cuentan como el nivel más alto.

Un producto de precio 0 es público. Uno de pago lo abre la junta, su creador, cualquier membresía vigente, o una venta no reembolsada de ese producto para esa persona.

Completar una lección (`completeLesson`) exige sesión, curso publicado, permiso de lectura y que la clase esté desbloqueada. Guarda `completed_at` en `lms_progress` de esa persona. No pisa una fecha que ya existía. La nota numérica la carga el equipo desde el panel, no el alumno.

**Desbloqueo** (`lessonAccess`):
- Una clase se abre cuando la anterior está completada.
- El orden es el del temario: secciones en su orden y al final las clases sueltas.
- La junta y el profesor del curso ven todo.

**Misiones** (`src/lib/valux/mission.ts`): en la ficha de la lección, el campo Misión acepta dos formatos.

- **Quiz:** un bloque por pregunta separado por una línea en blanco. La pregunta va en la primera línea y cada opción empieza con `-`. La correcta empieza con `*`.
- **Checklist:** una casilla por línea, `[ ] texto`.

Cómo funciona:
- El panel avisa si el texto tiene errores. Mientras tanto, la clase se completa sin misión.
- Con misión, la clase solo se completa aprobándola (`submitMission`): todas las respuestas correctas o todas las casillas marcadas.
- La corrección es en el servidor; el navegador nunca recibe la respuesta.
- Al aprobar, se acreditan los XP de la lección una sola vez: `lms_xp` tiene llave (persona, lección).
- El nivel es `XP / 100 + 1` y se muestra en Mis cursos.
- La checklist no prueba resultados reales; para evidencia (ingresos, entregas) sigue la nota manual del equipo.

El catálogo público no muestra el cuerpo de la lección: título, sección y duración. El texto, el video y los recursos salen en la página de la lección.

**Retos** (`src/lib/valux/challenges.ts`): contenido los crea en `/dashboard/cursos/retos`. Hay tres tipos:
- **Juntar XP:** XP de misiones ganados desde que se creó el reto.
- **Aprobar misiones:** cuántas misiones aprobó desde que se creó el reto.
- **Terminar un curso:** todas las clases de un curso completadas.

Los dos primeros se pueden limitar a un curso. Cada reto tiene bono de XP y fecha de cierre opcional. El alumno ve su avance en `/academia/retos`. **Reclamar** verifica la meta en el servidor y suma el bono una sola vez: `lms_challenge_claims` tiene llave (reto, persona). El XP total de la persona es misiones más bonos.

**Recibos:** `/academia/recibos` lista las ventas de la persona de la sesión, incluidas las reembolsadas. `/academia/recibos/<id>` es un comprobante imprimible (Imprimir → PDF del navegador). No es una factura fiscal. Otra persona no puede abrir el recibo, aunque tenga el id.

## Cupones

En `/dashboard/cursos/cupones` (finanzas) se crean códigos con estas opciones:
- porcentaje o monto fijo;
- para un curso o para todos;
- tope de usos y fecha de vencimiento opcionales.

Funcionan así:
- Solo descuentan cursos. La membresía es recurrente y no lleva cupón.
- El alumno escribe el código en el checkout. `buyCourse` calcula el precio en el servidor con `applyCoupon` y rechaza el código si no existe, venció, se agotó o es de otro curso.
- El código queda en el intent, en la transferencia y en la venta (`coupon_code`).
- Un uso se cuenta cuando la venta queda entregada, también en un curso que queda gratis con el cupón.
- La comisión y la parte del profesor salen de lo cobrado de verdad.
- El tope es orientativo: dos pagos simultáneos con el último uso pueden pasar los dos.

## Correos de seguimiento

`src/lib/valux/followups.ts`. La tarea programada los corre cada 5 minutos, hasta 50 por tipo y corrida. Cada uno queda en `academia_followups` con una llave única, así que no se repite.

| Correo | Cuándo | A quién |
| --- | --- | --- |
| Pago pendiente | Un `checkout_started` de hace entre 1 y 48 h sin compra después. Máximo uno cada 7 días por correo | Solo con `consent_email` (es marketing) |
| Recordatorio | Compró un curso, no lo terminó y lleva 7 días sin completar clases. Hasta 3, cada 14 días | Todos los compradores, salvo que lo apaguen en Perfil (`reminders_off`) |
| Membresía por vencer | Vence en 3 días o menos y no se renueva sola (`no_renueva` o sin pasarela) | Todos |
| Cobro fallido | Webhook `invoice.payment_failed`; trae el enlace de Stripe para pagar con otra tarjeta | Todos |

La llave se reserva antes de mandar el correo y solo cuenta como enviado cuando Resend lo acepta. Si falla, se libera para la siguiente corrida (los avisos de cobro fallido se recuperan con el reintento del webhook). Una reserva interrumpida vence en 5 minutos. Los errores temporales se reintentan hasta 3 veces con una llave de idempotencia estable y timeout. Los correos de acceso tras una compra y las instrucciones de transferencia quedan en `academia_mail_queue`; el cron recupera los pendientes cada 5 minutos. Un código cuyo envío falla se invalida y la pantalla permite volver a pedirlo.

**Primer deploy:** quien ya tenga un curso sin avanzar recibe su primer recordatorio en las primeras corridas, de a 50 cada 5 minutos.

## Videos protegidos (Bunny Stream)

En el campo Video de la lección se pega `bunny:<id del video>` o la URL de Bunny (`https://iframe.mediadelivery.net/embed/<biblioteca>/<video>`). `lessonEmbed` (`src/lib/valux/video.ts`) solo genera el enlace para quien puede ver la clase. Con `BUNNY_STREAM_TOKEN_KEY` el enlace va firmado: `token = sha256(clave + id + vencimiento)` y vence a las 6 horas.

En Bunny hay que hacer tres cosas:
1. Activar **Token authentication** en la biblioteca. Sin eso, Bunny no exige la firma.
2. Agregar el dominio del sitio en **Allowed domains**.
3. Copiar la clave y el id de la biblioteca a Vercel.

YouTube y Vimeo se siguen aceptando, pero su enlace funciona fuera de la academia.

## Alertas de errores

`alertTeam` (`src/lib/valux/alerts.ts`) manda un correo por Resend a `ALERT_EMAIL`, o al correo del sitio. Hay como máximo uno por tema cada hora; el tope queda en `crm_meta`, `alert:<tema>`. Avisa en estos casos:
- falla un webhook de Stripe o de PayPal;
- falla la tarea programada;
- falla la conciliación, o la conciliación encuentra pagos sin entregar o eventos de Stripe sin procesar;
- fallan los correos de seguimiento;
- cualquier error del servidor en producción (`src/instrumentation.ts`, `onRequestError`). Las redirecciones y los 404 no cuentan.

## Leads y eventos

**Primer contacto:** la primera visita a `/academia` con parámetros `utm_*`, o con un referer externo, guarda la cookie `cluster_lead` (fuente y UTM) por 90 días. Visitas posteriores no la pisan.

**Registro:** en «Crear cuenta» hay dos casillas sin marcar: WhatsApp y correo. Al confirmar el código o el enlace se guardan en la persona:
- `source` y `utm`, solo la primera vez;
- `consent_whatsapp` y `consent_email`, con `consent_at`.

**Etapa** (`valux_people.stage`): `nuevo` → `interesado` (abrió la ficha de un curso con sesión) → `checkout` (empezó un pago) → `comprador` → `miembro`. Solo avanza. La conciliación nocturna pone `inactivo` y cualquier avance posterior la saca de ahí.

**Eventos** (`academia_events`, con `trackEvent` en `src/lib/valux/events.ts`): los eventos que pueden repetirse llevan un id fijo, y un reintento no duplica. Si guardar un evento falla, no rompe el cobro ni la clase. Se registran:
- `lead_created`;
- `checkout_started`, `bump_accepted`, `payment_succeeded` (cada cobro, también los mensuales), `purchase_completed`;
- `lesson_started` (primera vez que abre una clase desbloqueada), `lesson_completed`, `mission_submitted`, `mission_validated`, `reward_unlocked`;
- `subscription_started`, `subscription_renewed` (cada cobro de membresía después del primero), `subscription_canceled` (una vez por membresía: el alumno, el panel, la pasarela o un reembolso), `refund_issued`.

Las renovaciones se reconocen por un `payment_succeeded` anterior de la misma suscripción. Las membresías que ya existían antes de este cambio cuentan su primer cobro posterior como alta, no como renovación.

**Analítica** (`/dashboard/cursos/analitica`, `src/lib/valux/analytics.ts`): por defecto muestra los últimos 30 días. Se filtra por fechas y por curso.

| KPI | Cómo se calcula |
| --- | --- |
| Ingresos | Ventas no reembolsadas, con la comisión de Cluster aparte |
| Pedidos y ticket promedio | Un pedido junta la venta y su bump; ticket = ingresos ÷ pedidos |
| Reembolsos | Ventas reembolsadas en el rango |
| Conversión de checkout | `purchase_completed` ÷ `checkout_started` |
| Bumps aceptados | Eventos `bump_accepted` |
| Alumnos activos | Completaron al menos una clase en el rango |
| Finalización | De quienes empezaron un curso, cuántos lo terminaron entero |
| Activación D1 | Compras de curso del rango cuyo comprador completó una clase de ese curso en las primeras 24 h |
| Retención | Por mes (los 6 que terminan en «hasta»): de quienes tenían membresía vigente al empezar el mes, cuántos la seguían teniendo al empezar el siguiente, o hoy si el mes no terminó |
| Membresías y MRR | Membresías vigentes por plan; el MRR usa el precio actual del plan |
| Leads | Personas nuevas por etapa y por fuente |

## Profesores

**Contrato** (Liquidaciones → Contratos, solo finanzas). Hay tres tipos:
- **General:** usa la comisión de ajustes.
- **Porcentaje propio:** fija la comisión de la academia para esa persona.
- **Honorario fijo:** el profesor cobra un monto cada mes y sus ventas quedan enteras para la academia.

**Regla de reembolso:** `descontar` (por defecto) o `academia`. Con `descontar`, un reembolso de una venta cuyo mes ya se pagó se resta en la liquidación del mes del reembolso.

**Edición con revisión:** el profesor (rol `profesor` en Equipo, con el mismo correo que su persona en la academia) abre «Editar temario» desde su panel. Edita secciones, lecciones, misiones, recursos y notas por clase, solo de sus cursos: cada acción verifica `teacher_id` en el servidor. No ve el precio, la portada, el bump ni el upsell, ni puede publicar, inscribir o ver correos. Con «Pedir revisión para publicar» marca `review_requested_at`. Contenido lo ve en la lista y, al publicar o despublicar, la marca se limpia.

## Liquidaciones

`buildPayouts` (con `computePayouts` en `fulfill.ts`) calcula, por creador y por mes:

**ventas vigentes del mes + honorario del contrato − reembolsos del mes sobre meses ya transferidos**

El resultado de cada parte queda en `valux_payouts.detail`. Si el saldo da negativo, la liquidación queda en 0 con estado `sin saldo` y el resto se guarda en `carry_cents`. Al calcular el mes siguiente se descuenta, y si tampoco alcanza sigue pasando. Recalcular un mes viejo no corrige los meses calculados después: hay que recalcularlos en orden. Las liquidaciones pendientes se recalculan y las transferidas no se tocan. El vencimiento es el día 10 del mes siguiente. Cada par creador + periodo es único.

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
src/lib/valux/login.ts         Código y enlace de un solo uso
src/lib/valux/money.ts         Comisión, periodo y slugs
src/lib/valux/paypal.ts        Payouts y suscripciones PayPal viejas
src/lib/valux/transfers.ts     Órdenes por transferencia
src/lib/valux/transfer-actions.ts  Comprobante, aprobar y rechazar
src/lib/valux/stripe.ts        Checkout de Stripe
src/lib/valux/events.ts        Eventos, etapa del lead y consentimientos
src/lib/valux/reconcile.ts     Conciliación nocturna
src/lib/valux/receipts.ts      Recibos del alumno
src/lib/valux/challenges.ts    Retos
src/lib/valux/analytics.ts     KPIs del panel
src/lib/crm/course-access.ts   Quién puede editar un curso
scripts/check-lms-cierre.ts    Prueba de contratos, leads, eventos, Stripe, recibos, retos y analítica
src/lib/valux/coupons.ts       Cupones
src/lib/valux/followups.ts     Correos de seguimiento
src/lib/valux/video.ts         Video incrustado y firma de Bunny
src/lib/valux/alerts.ts        Alertas por correo
scripts/check-seguimiento.ts   Prueba de cupones, seguimientos, Bunny y alertas
```

## Variables

| Variable | Para qué |
| --- | --- |
| Las del CRM (`DATABASE_URL`, conector Neon, etc.) | La academia usa la misma base. Ver [README-CRM.md](README-CRM.md) |
| `STRIPE_SECRET_KEY` | Cobrar con tarjeta |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE` | Liquidar a creadores y suscripciones PayPal viejas |
| `STRIPE_WEBHOOK_SECRET` | Firma del webhook de Stripe (`whsec_…`) |
| `PAYPAL_WEBHOOK_ID` | Id del webhook creado en PayPal; sin él se rechazan sus avisos |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` | Correo de acceso |
| `BLOB_READ_WRITE_TOKEN` | Portadas y archivos subidos |
| `BUNNY_STREAM_LIBRARY_ID` | Biblioteca de Bunny Stream para lecciones cargadas como `bunny:<id>` |
| `BUNNY_STREAM_TOKEN_KEY` | Clave de firma de Bunny («Token authentication key»); sin ella el video de Bunny va sin firma |
| `ALERT_EMAIL` | A quién llegan las alertas de errores (por defecto el correo del sitio) |


## Validación aislada y pendientes de operación

`npm run test:lms` ejecuta las pruebas de acceso, planes, pagos simulados, reembolsos, retos, permisos, correos y seguridad en un esquema PostgreSQL temporal. El esquema se elimina al terminar; los correos y las pasarelas se interceptan. Necesita `DATABASE_URL` con permiso de crear esquemas. No procesa contactos ni ventas reales.

El webhook de Stripe se registra en `https://www.cluster.marketing/api/academia/stripe`, con los ocho eventos de la tabla anterior y `STRIPE_WEBHOOK_SECRET` en producción.

Pendientes por decisión del propietario: datos bancarios, biblioteca y clave de Bunny Stream, videos y nuevos cursos. Transferencias permanece oculta sin banco configurado. La compra real con tarjeta de prueba requiere credenciales del entorno de pruebas de Stripe; la clave disponible es de producción.

Referencias del rediseño: [Coursera](https://www.coursera.org/) para separar destacados, búsqueda y catálogo; [MasterClass](https://www.masterclass.com/) para dar peso a las portadas y mantener una jerarquía editorial; [Canvas](https://www.instructure.com/canvas/login) para explicar el acceso antes de pedir credenciales. En Inspo se revisaron las capturas móviles de Coursera y MasterClass y la descripción de sus composiciones de escritorio; las páginas públicas también se abrieron. La implementación conserva la tipografía y los colores de Cluster. La nueva selección se prueba en `scripts/check-academia-catalog.ts`, incluido en `npm run test:lms`.

La conversión inicial USD → HNL usa L27 por US$1 como referencia comercial redondeada. En producción, la primera inicialización convierte precios, ofertas, cupones fijos y honorarios de forma atómica, guarda los originales en `crm_meta.academia_currency_backup_usd` y marca `academia_currency=HNL`. Si hay ventas, suscripciones, órdenes, transferencias, liquidaciones o donaciones previas, detiene la conversión para exigir conciliación; no reetiqueta operaciones. Los reintentos no vuelven a multiplicar precios. PayPal recibe o liquida USD con conversión explícita. `scripts/check-academia-currency.ts` comprueba la migración y el rechazo de pagos en otra moneda.
