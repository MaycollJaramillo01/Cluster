export type PrincipalCourse = {
  slug: string; title: string; description: string; price: number; cover: string;
  sections: { title: string; lessons: { slug: string; title: string; content: string; mission: string }[] }[];
  resource: { title: string; content: string };
};

export const principalCourses: PrincipalCourse[] = [
  {
    slug: 'publicidad-facebook-instagram', title: 'Publicidad en Facebook e Instagram', price: 40500,
    description: 'Prepara tu oferta, organiza una campaña y mide el costo de conseguir consultas. Incluye ejercicios de público, anuncios, presupuesto y seguimiento.',
    cover: '/assets/videos/services/google-ads-bg-poster.jpg',
    sections: [
      { title: 'Preparar la campaña', lessons: [
        { slug: 'oferta-y-objetivo', title: 'Define una oferta y un resultado', content: `## Empieza por el resultado
Una campaña necesita una acción concreta: recibir consultas, captar solicitudes o generar compras. Escribir «vender más» no basta para elegir qué medir. Completa esta frase: «Quiero que personas de ___ soliciten ___ por ___».

## Construye la oferta
Elige un solo servicio o producto. Anota a quién ayuda, qué incluye, su precio real y cómo se entrega. Una oferta comprensible podría ser «Limpieza de sofá de dos puestos en Tegucigalpa, cotización por WhatsApp según material y estado». Evita asegurar resultados que no puedes comprobar.

## Calcula antes de anunciar
Si una venta deja L400 después de costos y de cada cinco consultas cierras una, L80 por consulta consumiría todo ese margen. Esa cifra muestra un límite económico, no un objetivo recomendable. Define un costo objetivo menor y una cantidad que puedes invertir sin comprometer la operación.

## Entrega
Escribe oferta, ciudad, acción, margen por venta y costo objetivo por consulta.`, mission: '[ ] Elegí una oferta concreta\n[ ] Definí una acción medible\n[ ] Calculé un costo objetivo de consulta' },
        { slug: 'cuenta-y-permisos', title: 'Organiza tu cuenta y tus accesos', content: `## Separa los activos
Identifica página de Facebook, cuenta de Instagram, cuenta publicitaria y medio de pago. Revisa quién es propietario y quién tiene acceso. No compartas contraseñas para trabajar con otra persona: asigna permisos desde las herramientas del negocio y retíralos cuando termine su trabajo.

## Comprueba el destino
Abre el perfil y el enlace del anuncio desde otro teléfono. Confirma nombre, horario, ciudad y contacto. Si envías a una web, prueba el formulario y su confirmación. Si envías a una conversación, define quién responderá y en qué horario.

## Revisión de seguridad
Activa el segundo factor en las cuentas administradoras y conserva acceso a la recuperación. Un proveedor externo no debe ser la única persona capaz de administrar tus activos.

## Entrega
Prepara un inventario con cada activo, su propietario y los permisos de quien ejecutará la campaña. No incluyas contraseñas.`, mission: '[ ] Identifiqué los activos y sus propietarios\n[ ] Probé el destino desde un teléfono\n[ ] Revisé accesos y segundo factor' },
        { slug: 'publico-y-zona', title: 'Elige el público y la zona de atención', content: `## El público empieza en la operación
Anuncia donde puedes atender. Escribe ciudades o zonas cubiertas, restricciones de entrega y horarios. Una audiencia grande fuera de tu cobertura genera consultas que no puedes convertir.

## Usa evidencia
Revisa consultas y ventas anteriores. Registra el problema que las personas querían resolver, las dudas frecuentes y los motivos de compra. Usa esos hallazgos para el mensaje. No deduzcas características sensibles ni afirmes conocer condiciones personales de quien verá el anuncio.

## Prepara una hipótesis
Por ejemplo: «Una oferta que muestra proceso, alcance y tiempo estimado será más comprensible que una imagen con muchos servicios». La campaña permitirá contrastar el mensaje, no demostrar que toda una ciudad se comporta igual.

## Entrega
Describe una necesidad, una zona de atención y dos motivos para consultar. Comprueba que las opciones disponibles en tu cuenta sean compatibles con el tipo de anuncio y sus políticas.`, mission: '[ ] Definí dónde puedo atender\n[ ] Identifiqué una necesidad con evidencia\n[ ] Escribí una hipótesis de mensaje' },
      ] },
      { title: 'Publicar y medir', lessons: [
        { slug: 'crear-anuncios', title: 'Crea dos anuncios que puedas comparar', content: `## Una idea por anuncio
Prepara dos piezas para la misma oferta. En una muestra el problema y la solución; en otra, el proceso o una demostración. Mantén precio, zona y acción final para interpretar qué cambió. Utiliza material propio o con permiso.

## Redacta el mensaje
Usa situación, oferta, condición y acción. Ejemplo: «¿Necesitas preparar tu local para abrir? Pintura interior según superficie y estado. Atendemos en San Pedro Sula. Escríbenos para cotizar». Sustituye los datos por información real del negocio.

## Revisa en el teléfono
La imagen debe entenderse al tamaño de publicación. No escondas condiciones en letras diminutas. Comprueba recortes, ortografía y destino. Si utilizas una reseña, cuenta con permiso y conserva su contexto.

## Entrega
Guarda las piezas, sus textos y la diferencia a comparar. No cambies simultáneamente oferta, público, precio y diseño: después no sabrás qué explica el resultado.`, mission: '[ ] Preparé dos anuncios de la misma oferta\n[ ] Verifiqué permisos de las imágenes\n[ ] Revisé textos, recortes y destino en móvil' },
        { slug: 'presupuesto-y-lanzamiento', title: 'Organiza el presupuesto y lanza una prueba', content: `## Entiende la estructura
En la campaña defines el objetivo; en los conjuntos organizas la entrega y en los anuncios presentas las piezas. Las opciones dependen de tu cuenta y objetivo. Revisa cada ajuste antes de confirmar.

## Limita la prueba
Anota presupuesto total, fechas, zona, piezas y responsable. L600 durante seis días es un ejemplo de planificación, no una promesa de alcance ni una recomendación universal. Usa un monto adecuado al negocio; también puedes preparar un borrador sin invertir.

## Lista previa
Comprueba moneda, medio de pago, límite de gasto, calendario y enlaces. Define cuándo detener la prueba: por ejemplo, si falla el destino o llegan consultas fuera de cobertura. Si nadie puede responder, conserva el borrador.

## Entrega
Completa la hoja de lanzamiento y registra si quedó en borrador o publicada. Guarda decisiones y fecha para compararlas con los resultados.`, mission: '[ ] Fijé presupuesto y fechas\n[ ] Revisé moneda, destino y zona\n[ ] Documenté la campaña o su borrador' },
        { slug: 'medir-y-mejorar', title: 'Mide consultas y decide el siguiente cambio', content: `## Lleva los resultados al negocio
Registra gasto, consultas válidas, cotizaciones y ventas. Un clic no es una compra. L600 invertidos entre 12 consultas válidas dan L50 por consulta. Si cerraste tres ventas, el costo publicitario por venta fue L200; compáralo con el margen.

## Busca el cuello de botella
Clics sin consultas invitan a revisar destino y coherencia. Consultas sin cotización pueden señalar respuesta lenta o requisitos poco claros. Cotizaciones sin venta requieren revisar precio, confianza y seguimiento. Confirma las hipótesis con conversaciones y datos.

## Cambia una variable
Elige un cambio, explica por qué debería ayudar y define cuándo evaluarlo. No aumentes inversión por un solo día bueno ni prometas resultados permanentes.

## Proyecto final
Entrega oferta, dos anuncios, presupuesto y una tabla de resultados reales o de un caso simulado identificado como tal. Añade tu próxima decisión y la información que falta.`, mission: '[ ] Calculé costo por consulta y venta\n[ ] Identifiqué un cuello de botella\n[ ] Entregué la campaña y su próxima mejora' },
      ] },
    ],
    resource: { title: 'Hoja de campaña', content: 'Oferta:\nZona:\nAcción esperada:\nMargen por venta (L):\nCosto objetivo por consulta (L):\nPresupuesto total (L):\nFechas:\nAnuncio A:\nAnuncio B:\nGasto real (L):\nConsultas válidas:\nCotizaciones:\nVentas:\nCambio a probar:\nFecha de revisión:' },
  },
  {
    slug: 'diseno-contenido-canva', title: 'Diseño de contenido en Canva', price: 45000,
    description: 'Crea una línea visual y una semana de contenido para tu negocio. Trabaja jerarquía, plantillas, carruseles, revisión en móvil y exportación.',
    cover: '/assets/videos/services/redes-sociales-bg-poster.jpg',
    sections: [
      { title: 'Construir la base visual', lessons: [
        { slug: 'objetivo-del-contenido', title: 'Define el objetivo de cada publicación', content: `## Antes de abrir el editor
Una publicación debe explicar una oferta, responder una duda, mostrar un proceso o invitar a una acción. Escribe su objetivo y la frase que el lector debería recordar. Divide las ideas independientes en varias piezas.

## Redacta primero
Prepara título, información de apoyo y acción final. Una cafetería puede anunciar un producto con precio y horario en una pieza y explicar cómo llegar en otra. Mezclar todos los productos y promociones dificulta la lectura.

## Diseña para una necesidad concreta
Usa preguntas de clientes para elegir el tema. Evita testimonios inexistentes o promesas sin respaldo. Define qué fotografía o demostración apoyará el mensaje y qué datos deben confirmarse antes de publicar.

## Entrega
Escribe tres briefs: uno comercial, uno educativo y uno de confianza. Incluye público, objetivo, texto, material visual y acción final. Todavía no necesitas una plantilla.`, mission: '[ ] Preparé tres briefs con objetivos distintos\n[ ] Definí un mensaje principal por pieza\n[ ] Confirmé los datos y materiales necesarios' },
        { slug: 'colores-y-tipografia', title: 'Elige colores y tipografías consistentes', content: `## Reduce las decisiones
Selecciona un color principal, un acento y un fondo. Elige una tipografía para títulos y otra para lectura, o una sola familia con distintos pesos. La consistencia permite reconocer una marca sin un logotipo enorme en cada pieza.

## Prueba la lectura
Comprueba el contraste y evita depender solo del color para comunicar información importante. No coloques letras muy delgadas sobre fotografías con muchos detalles. Si un título no se lee al ver la pieza en el teléfono, simplifica o aumenta su tamaño.

## Guarda una guía
Anota códigos de color, fuentes y usos del logotipo. Puedes usar las herramientas de marca disponibles en tu plan de Canva o guardar una página de referencia dentro de un diseño.

## Entrega
Crea una guía con dos combinaciones de título y texto, los colores elegidos y una prueba sobre una fotografía del negocio. Revisa la lectura antes de continuar.`, mission: '[ ] Definí paleta y tipografías\n[ ] Probé contraste y lectura en móvil\n[ ] Guardé una guía visual' },
        { slug: 'composicion-y-jerarquia', title: 'Ordena título, imagen y acción', content: `## Decide qué se ve primero
El título presenta la idea, la imagen la respalda y el resto completa lo necesario. No todos los elementos deben tener el mismo tamaño. Construye una jerarquía que permita comprender la pieza antes de leer cada detalle.

## Alinea y deja espacio
Usa márgenes consistentes, alinea elementos relacionados y separa grupos distintos. Evita acercar información importante a bordes donde puede perderse por recortes o controles de la plataforma. Revisa la vista previa del formato de publicación.

## Haz una prueba
Aleja el teléfono o reduce la vista del diseño. ¿Puedes identificar tema y acción? Si destaca primero una decoración, reduce su peso. Intenta quitar un elemento antes de añadir otro efecto.

## Entrega
Diseña dos composiciones del mismo brief. Elige una y explica qué debe verse primero, segundo y tercero. Conserva ambas versiones para compararlas.`, mission: '[ ] Diseñé dos composiciones del mismo mensaje\n[ ] Revisé márgenes y alineaciones\n[ ] Definí una jerarquía clara' },
      ] },
      { title: 'Producir y publicar', lessons: [
        { slug: 'plantillas-reutilizables', title: 'Construye tres plantillas reutilizables', content: `## Una plantilla es una estructura
Con tu guía crea una pieza para oferta, otra para una pregunta frecuente y otra para mostrar un proceso. Define qué permanece y qué cambia: mantener márgenes y fuentes mientras sustituyes imagen, título y precio.

## Reutiliza sin duplicar errores
Trabaja sobre una copia. Revisa que no queden precios, fechas o nombres de otra publicación. Si colaboras, acuerda quién revisa la versión final y usa nombres de archivo comprensibles.

## Comprueba los recursos
Verifica que fotografías, fuentes y elementos se puedan utilizar con tu cuenta y para el uso previsto. No todos los recursos de una plantilla están incluidos en cualquier plan. No elimines marcas de agua para evitar una licencia.

## Entrega
Guarda tres plantillas y crea una publicación diferente con cada una. Otra persona debería poder identificar qué puede cambiar sin alterar la estructura visual.`, mission: '[ ] Creé tres plantillas con funciones distintas\n[ ] Probé una variante de cada plantilla\n[ ] Revisé licencias y datos antiguos' },
        { slug: 'crear-un-carrusel', title: 'Cuenta una idea en un carrusel', content: `## Dale una secuencia
Un carrusel necesita apertura, desarrollo y cierre. Para un servicio de pintura puedes mostrar qué revisar antes de cotizar: superficie, estado, acceso y plazo. Cada lámina debe aportar un dato nuevo.

## Mantén la unidad
Repite posición de títulos, márgenes y estilo de imágenes. Usa numeración si ayuda a seguir el orden. Evita párrafos largos: lleva los detalles adicionales al texto de la publicación o a una página de consulta.

## Revisa la secuencia completa
Mira las láminas en el teléfono en su orden de publicación. Comprueba que el recorte no oculta contenido y que el cierre indica qué hacer. La acción propuesta debe ser algo que el negocio pueda atender.

## Entrega
Prepara cinco láminas: portada, tres ideas o pasos y cierre. Exporta una muestra, verifica el orden y pide a otra persona que explique qué entendió.`, mission: '[ ] Preparé cinco láminas conectadas\n[ ] Mantuve la línea visual\n[ ] Revisé orden y acción final en móvil' },
        { slug: 'calendario-y-exportacion', title: 'Exporta y organiza una semana de contenido', content: `## Define la entrega
Confirma formato y dimensiones para cada destino. Trabaja desde un diseño apropiado y revisa su vista previa. Exporta imágenes o documentos según su uso; una captura del editor no sustituye al archivo final.

## Revisa antes de publicar
Comprueba ortografía, precio, fechas, enlace, recorte, licencias y lectura. Usa nombres de archivo que puedas localizar y conserva el diseño editable. El archivo publicado y la plantilla original cumplen funciones distintas.

## Distribuye la semana
Elige tres publicaciones con objetivos diferentes y asigna fecha, responsable y estado: en preparación, en revisión o lista. Un calendario sostenible vale más que uno lleno de piezas sin terminar.

## Proyecto final
Entrega la guía visual, tres plantillas, el carrusel y un calendario semanal. El conjunto debe representar al mismo negocio y cada publicación debe cumplir una función concreta.`, mission: '[ ] Exporté y revisé archivos finales\n[ ] Organicé fechas y responsables\n[ ] Entregué la guía y las piezas de la semana' },
      ] },
    ],
    resource: { title: 'Brief y calendario de contenido', content: 'Marca:\nPúblico:\nObjetivo:\nMensaje principal:\nDatos confirmados:\nMaterial visual y permiso de uso:\nFormato:\nAcción final:\nFecha:\nResponsable:\nEstado:\nRevisión de ortografía:\nRevisión en móvil:\nArchivo final:' },
  },
  {
    slug: 'ventas-por-whatsapp', title: 'Ventas por WhatsApp', price: 49500,
    description: 'Organiza la atención, responde consultas, prepara cotizaciones y da seguimiento sin saturar a tus clientes. Incluye guiones y un registro de oportunidades.',
    cover: '/assets/videos/services/presencia-digital-poster.jpg',
    sections: [
      { title: 'Preparar la atención', lessons: [
        { slug: 'perfil-y-horarios', title: 'Prepara el perfil y el horario de atención', content: `## Facilita la primera consulta
Revisa que el perfil comercial muestre nombre correcto, actividad, ciudad y contacto. Una persona que llega desde un anuncio necesita reconocer al mismo negocio y entender qué puede solicitar.

## Organiza la atención
Define quién responde, cuándo y qué sucede fuera del horario. Si usas bienvenida o ausencia en la aplicación, comunica lo que puedes cumplir: «Atendemos de lunes a viernes. Déjanos el servicio y tu zona para continuar en horario de atención». No prometas respuesta inmediata si nadie está disponible.

## Prepara la información
Mantén oferta, precios, cobertura, pagos y condiciones de entrega actualizados. No dejes información sensible de clientes en notas compartidas sin control de acceso. Usa únicamente lo necesario para atender.

## Entrega
Completa el perfil y redacta bienvenida y ausencia. Pide a otra persona que pruebe el contacto desde otro teléfono.`, mission: '[ ] Revisé perfil, zona y horario\n[ ] Preparé bienvenida y ausencia\n[ ] Probé el contacto desde otro teléfono' },
        { slug: 'preguntas-para-cotizar', title: 'Haz las preguntas necesarias para cotizar', content: `## Escucha antes de ofrecer
Responde a la intención de la consulta. Si alguien pregunta precio, explica de qué depende y pide los datos mínimos para cotizar. Evita enviar un cuestionario extenso sin reconocer su necesidad.

## Usa una secuencia corta
Para un servicio local pregunta qué trabajo requiere, dónde y para cuándo. Después solicita fotos o medidas cuando hagan falta y explica por qué. No pidas documentos de identidad ni información financiera si no son necesarios para un proceso legítimo.

## Confirma lo entendido
Resume: «Necesitas pintar dos habitaciones en la zona X para la próxima semana. Con estas medidas prepararé el alcance». Confirmar evita cotizar algo distinto de lo solicitado.

## Entrega
Escribe saludo, tres preguntas de diagnóstico y un resumen. Simula una conversación y elimina las preguntas que no ayuden a decidir servicio, precio o disponibilidad.`, mission: '[ ] Redacté tres preguntas necesarias\n[ ] Preparé un resumen de confirmación\n[ ] Probé y simplifiqué el guion' },
        { slug: 'respuestas-frecuentes', title: 'Organiza respuestas frecuentes', content: `## Identifica lo que se repite
Enumera dudas sobre horarios, cobertura, entrega, precio y pagos. Prepara respuestas breves con información vigente. Las respuestas rápidas de WhatsApp Business pueden ayudarte a recuperar esos textos sin escribirlos desde cero.

## Personaliza lo importante
Un texto guardado es una base, no una excusa para ignorar una pregunta. Incluye el contexto y elimina campos pendientes antes de enviar. Si no conoces la respuesta, confirma que la consultarás con el responsable.

## Mantén una sola versión
Asigna quién actualiza los textos al cambiar precios o condiciones. Una respuesta antigua puede generar expectativas que el negocio ya no puede cumplir. Revísalas también cuando cambie un producto.

## Entrega
Prepara cinco respuestas frecuentes y una regla de actualización. Pruébalas en conversaciones simuladas: cada una debe responder la pregunta y ofrecer un siguiente paso concreto.`, mission: '[ ] Preparé cinco respuestas frecuentes\n[ ] Personalicé los textos en una simulación\n[ ] Asigné un responsable de actualización' },
      ] },
      { title: 'Cotizar y dar seguimiento', lessons: [
        { slug: 'cotizacion-clara', title: 'Envía una cotización que se entienda', content: `## Presenta alcance y precio
Indica qué incluye, qué excluye, monto en lempiras, vigencia, fecha estimada y condiciones de confirmación. No envíes solo un número si el cliente todavía no sabe qué comprará.

## Usa una estructura completa
«Servicio: limpieza de sofá de dos puestos. Incluye evaluación y limpieza según material. Total: L___. Condiciones: ___. Disponibilidad: ___. Para reservar: ___. Vigente hasta ___». Completa cada espacio con información real antes de enviarlo.

## Evita cambios inesperados
Si el trabajo puede variar después de una revisión, explica la condición antes de cobrar. Cuando cambie el alcance, confirma por escrito el nuevo total. Conserva la versión que el cliente acepta.

## Entrega
Redacta una cotización de un caso real o simulado. Otra persona debe poder identificar precio, alcance y siguiente paso sin hacer preguntas básicas.`, mission: '[ ] Preparé alcance, total y vigencia\n[ ] Aclaré condiciones y siguiente paso\n[ ] Revisé la cotización con otra persona' },
        { slug: 'objeciones-y-seguimiento', title: 'Responde objeciones y acuerda el seguimiento', content: `## Distingue una duda de un rechazo
«Está caro» puede significar alcance poco claro, comparación con otra oferta o falta de presupuesto. Pregunta qué necesita comparar antes de descontar. Explica el valor con hechos: materiales, trabajo incluido, tiempos y condiciones.

## Ofrece alternativas reales
Puedes reducir el alcance o proponer otra fecha si la operación lo permite. No ofrezcas descuentos, garantías o disponibilidad sin autorización. Una venta que no puedes cumplir perjudica la relación.

## Acuerda cuándo retomar
Pregunta: «¿Te parece si te escribo el jueves para confirmar si necesitas reservar?». Registra el acuerdo. Si no le interesa o pide no recibir mensajes, detén el seguimiento comercial.

## Entrega
Prepara respuestas a tres objeciones y un mensaje de seguimiento. Incluye una pregunta útil, una respuesta comprobable y un siguiente paso sin presión.`, mission: '[ ] Respondí tres objeciones frecuentes\n[ ] Definí un seguimiento con permiso\n[ ] Incluí una regla para detener mensajes' },
        { slug: 'registro-y-cierre', title: 'Controla oportunidades y confirma la venta', content: `## Registra el estado
Usa una hoja o un sistema de contactos con necesidad, fecha, estado, cotización y próxima acción. Puedes usar nueva consulta, diagnóstico, cotización enviada, seguimiento, ganada o cerrada sin venta. No marques un pago por una promesa o una captura sin comprobar.

## Confirma la entrega
Al concretar una venta, confirma alcance, fecha, responsable, total y forma de pago. Comprueba el abono en el medio correspondiente y entrega el comprobante utilizado por el negocio. Coordina cambios antes del servicio.

## Mide el proceso
De 20 consultas, 10 cotizaciones y cuatro ventas, analiza por qué diez no llegaron a cotización y seis cotizaciones no cerraron. Son datos de ese caso, no una tasa garantizada para otro negocio.

## Proyecto final
Simula una venta, una consulta en seguimiento y una oportunidad cerrada. Entrega el registro con estado y próxima acción coherentes para cada una.`, mission: '[ ] Registré tres oportunidades completas\n[ ] Preparé una confirmación de venta\n[ ] Calculé consultas, cotizaciones y ventas' },
      ] },
    ],
    resource: { title: 'Guion y registro de oportunidades', content: 'Cliente:\nNecesidad:\nZona:\nFecha requerida:\nDatos pendientes:\nResumen confirmado:\nCotización y alcance:\nImporte (L):\nVigencia:\nEstado:\nPermiso de seguimiento:\nPróximo contacto:\nResponsable:\nResultado:\nMotivo de cierre:' },
  },
  {
    slug: 'ia-automatizacion-negocios', title: 'IA y automatización para negocios', price: 54000,
    description: 'Diseña un flujo para una tarea repetitiva, prepara instrucciones para IA y prueba sus resultados con revisión humana. Incluye ejercicios y una matriz de pruebas.',
    cover: '/assets/videos/services/automatizacion-poster.jpg',
    sections: [
      { title: 'Elegir y preparar una tarea', lessons: [
        { slug: 'mapa-de-tareas', title: 'Encuentra una tarea que convenga automatizar', content: `## Identifica una tarea concreta
Anota cinco tareas que repites durante una semana. Registra su frecuencia, el tiempo que consumen y qué ocurre si salen mal. Separar archivos o resumir una solicitud tiene consecuencias distintas de confirmar un pago o enviar una cotización.

## Distingue ayuda y ejecución
Una herramienta puede ayudarte a preparar un borrador sin tener permiso para enviarlo. Empieza por una tarea cuyo resultado puedas revisar. Por ejemplo, convertir una consulta ficticia en un resumen para la persona encargada de atenderla.

## Describe el recorrido
Escribe qué inicia la tarea, qué datos recibe, qué pasos sigue y quién revisa el resultado. Añade qué debe pasar si falta información. Si hoy no puedes explicar el proceso, acláralo antes de conectarlo a una herramienta.

## Ejercicio
Elige una tarea y representa el proceso en seis pasos como máximo. Señala el paso que necesita una decisión humana y conserva una alternativa manual.`, mission: '[ ] Comparé cinco tareas repetitivas\n[ ] Elegí una tarea de bajo impacto\n[ ] Definí responsable y alternativa manual' },
        { slug: 'datos-y-criterios', title: 'Prepara los datos y el resultado esperado', content: `## Define la entrada
Para resumir una solicitud de servicio puedes necesitar servicio, zona, fecha y datos pendientes. Decide cuáles son obligatorios y qué formato tendrá cada uno. Una fecha ambigua debe quedar señalada para aclararla.

## Establece criterios de aceptación
Un resumen correcto conserva los hechos, identifica información faltante y evita inventar precios o disponibilidad. Escribe esos criterios antes de evaluar la respuesta de la herramienta. Una respuesta fluida puede contener errores.

## Prepara ejemplos seguros
Usa nombres y solicitudes ficticias durante el ejercicio. No incluyas contraseñas, claves de API ni información privada de clientes. Crea ejemplos completos, incompletos y fuera de la zona de atención.

## Ejercicio
Construye cinco entradas y escribe a mano el resultado esperado de cada una. En los casos incompletos, especifica qué pregunta debe recibir el responsable. Esa pequeña colección te servirá para comparar cambios posteriores.`, mission: '[ ] Definí campos y criterios de aceptación\n[ ] Preparé cinco ejemplos ficticios\n[ ] Escribí los resultados esperados' },
        { slug: 'instrucciones-para-ia', title: 'Escribe instrucciones claras y comprobables', content: `## Explica la tarea y sus límites
Una instrucción útil reúne contexto, tarea, datos disponibles, límites y formato de salida. Para nuestro ejercicio: resume la consulta usando solamente los datos recibidos, indica lo que falta y entrega servicio, zona, fecha y pregunta pendiente.

## Evita compromisos inventados
Añade que el resultado no debe confirmar disponibilidad, calcular precios desconocidos ni prometer descuentos. Cuando falte un dato, debe marcarlo como pendiente. La persona responsable decidirá el siguiente paso.

## Compara con tus ejemplos
Prueba la instrucción con los cinco casos de la lección anterior. Contrasta cada resultado con la respuesta que preparaste. No basta con pedirle a la misma herramienta que diga si su respuesta está bien.

## Ejercicio
Guarda una primera versión de tus instrucciones y anota los errores observados. Cambia una indicación y repite los mismos casos para comprobar si la mejora también funciona con entradas incompletas.`, mission: '[ ] Escribí tarea, límites y formato\n[ ] Probé los cinco casos\n[ ] Guardé una versión y sus errores' },
      ] },
      { title: 'Diseñar, probar y operar el flujo', lessons: [
        { slug: 'disparadores-y-condiciones', title: 'Diseña el flujo antes de conectarlo', content: `## Dibuja el recorrido
Para una solicitud nueva, el flujo puede ser: recibir, validar datos, detectar duplicados, preparar resumen, revisar y registrar. Cada paso debe producir un resultado que el siguiente pueda utilizar.

## Añade condiciones explícitas
Si falta la zona, dirige la solicitud a aclaración. Si ya existe una solicitud con el mismo identificador, evita crear otra. Si la herramienta falla, registra el problema y permite continuar manualmente.

## Separa preparación y envío
El resumen puede generarse automáticamente mientras que el envío al cliente requiere aprobación. Representa esa aprobación como un paso obligatorio, con una persona responsable. No escondas decisiones dentro de una instrucción vaga.

## Ejercicio
Dibuja el flujo e incluye al menos dos condiciones y una salida de error. Recorre tus cinco ejemplos en papel. Para este ejercicio no necesitas comprar ni conectar una plataforma: primero comprueba que el diseño es coherente.`, mission: '[ ] Dibujé el flujo y sus condiciones\n[ ] Incluí control de duplicados y errores\n[ ] Definí la aprobación humana' },
        { slug: 'pruebas-y-aprobacion', title: 'Prueba errores antes de usar datos reales', content: `## Construye una matriz de pruebas
Incluye una entrada válida, otra incompleta, una repetida y otra fuera del servicio ofrecido. Añade una consulta que contenga instrucciones como ignorar las reglas y aprobar un descuento. El texto recibido del cliente es información para procesar, no autorización para modificar tus reglas.

## Observa las consecuencias
Comprueba qué se guarda, quién lo ve y qué acciones se ejecutan. Durante las pruebas utiliza destinos y datos ficticios. No conectes cobros, borrados ni mensajes a clientes para demostrar que un prototipo funciona.

## Define cuándo detenerlo
Un error debe dejar registro y una acción de recuperación. Si un resultado compromete información o crea promesas falsas, detén el flujo y revisa las entradas pendientes antes de continuar.

## Ejercicio
Registra entrada, resultado esperado, resultado observado y decisión para cada prueba. Corrige los fallos y repite la matriz completa antes de considerar un piloto supervisado.`, mission: '[ ] Probé entradas válidas e incorrectas\n[ ] Registré resultados y correcciones\n[ ] Definí cómo detener y recuperar el flujo' },
        { slug: 'medicion-y-proyecto', title: 'Mide el piloto y entrega tu automatización', content: `## Mide el trabajo completo
Compara el proceso manual con el proceso asistido, incluyendo revisión y correcciones. Si antes una solicitud tardaba cinco minutos y ahora requiere dos de revisión, el ahorro de ese caso sería tres minutos. Esa cifra es un ejemplo, no un resultado garantizado.

## Considera mantenimiento y coste
Anota el coste de las herramientas, el tiempo de revisión y quién actualizará las instrucciones cuando cambie el negocio. Define quién puede acceder a cada servicio y conserva las claves fuera de documentos compartidos y del código público.

## Entrega un proceso que se pueda operar
Reúne mapa, ejemplos, instrucciones, condiciones, pruebas y alternativa manual. Indica con claridad qué pasos están conectados y cuáles son todavía una simulación. Un diseño en papel no equivale a una integración activa.

## Proyecto final
Presenta tu flujo con cinco casos resueltos y una lista de fallos pendientes. Propón un piloto pequeño con revisión humana, un responsable y un criterio concreto para detenerlo.`, mission: '[ ] Reuní diseño, instrucciones y pruebas\n[ ] Estimé coste y tiempo de revisión\n[ ] Definí responsable y criterio de detención' },
      ] },
    ],
    resource: { title: 'Mapa de automatización y matriz de pruebas', content: 'Tarea:\nResponsable:\nDisparador:\nDatos obligatorios:\nResultado esperado:\nCondiciones:\nControl de duplicados:\nAprobación:\nRuta de error:\nAlternativa manual:\n\nCaso | Entrada ficticia | Resultado esperado | Resultado observado | Corrección\n1 | | | |\n2 | | | |\n3 | | | |\n4 | | | |\n5 | | | |\n\nTiempo manual:\nTiempo de revisión:\nCoste estimado:\nPasos conectados:\nPasos simulados:\nCriterio de detención:' },
  },
];
