import { loadEnvConfig } from '@next/env';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { parseMission } from '../src/lib/valux/mission';
import { TEXT_TEMPLATE_KIND } from '../src/lib/valux/upload';

const slug = 'meta-ads-negocios-locales';
const outcomes = [
  'Elegir un objetivo de campaña que corresponda a la acción del cliente.',
  'Definir público, presupuesto y una prueba con dos anuncios comparables.',
  'Calcular el costo por resultado y decidir un cambio con datos suficientes.',
].join('\n');
const audience = 'Dueños y equipos de negocios locales que quieren generar consultas, pedidos o reservas con anuncios en Facebook e Instagram.';
const prerequisites = 'Tener una oferta concreta y conocer la zona que atiende el negocio. Puedes practicar con los ejemplos sin invertir dinero.';

const metaAdsMaterials = [
  {
    id: 'meta-ads-brief',
    lesson: 'bienvenida',
    title: 'Ficha de campaña para un negocio local',
    content: `FICHA DE CAMPAÑA

Negocio:
Zona donde puedo atender:
Oferta concreta:
Acción que cuento como resultado:
Quién responderá y en cuánto tiempo:
Costo máximo que puedo pagar por cada resultado:

Ejemplo: una clínica dental ofrece evaluación inicial a personas que viven
a 5 km. El resultado es una reserva confirmada y la recepción responde
en menos de 30 minutos en el horario publicado.

Antes de publicar, confirma que la oferta está disponible y que puedes
atender el volumen de consultas previsto.`,
  },
  {
    id: 'meta-ads-registro',
    lesson: 'metricas',
    title: 'Registro semanal de resultados',
    content: `REGISTRO SEMANAL

Periodo:
Objetivo:
Presupuesto máximo (L):
Costo máximo por resultado (L):

Anuncio A | Gasto | Impresiones | Clics | Resultados confirmados
Anuncio B | Gasto | Impresiones | Clics | Resultados confirmados

Costo por resultado = gasto ÷ resultados confirmados.
CTR = clics ÷ impresiones × 100.
Si todavía no hubo resultados, registra el gasto y el resultado como 0.
Deja vacío el costo por resultado.

Ejemplo: L 360 de gasto y 12 reservas confirmadas = L 30 por reserva.
Cambio que probaré:
Variable que mantendré igual:
Fecha en que volveré a medir:`,
  },
];

export async function prepareMetaAdsCourse(sql: NeonQueryFunction<false, false>, apply: boolean) {
  const [draft] = await sql`SELECT d.id FROM lms_courses c JOIN lms_courses d ON d.revision_of = c.id
    WHERE c.slug = ${slug} AND c.published AND c.price_cents = 0 AND NOT d.published AND d.review_requested_at IS NULL`;
  if (!draft) throw new Error('Abre un borrador editable desde «Editar próxima versión» en el curso Meta Ads.');
  const lessons = await sql`SELECT slug, video_url, mission FROM lms_lessons WHERE course_id = ${draft.id}`;
  if (lessons.length < 8 || lessons.some((lesson) => !lesson.video_url) ||
    !lessons.some((lesson) => parseMission(lesson.mission ?? '').mission?.kind === 'quiz') ||
    !metaAdsMaterials.every((item) => lessons.some((lesson) => lesson.slug === item.lesson))) {
    throw new Error('El borrador necesita las ocho clases con video y al menos un cuestionario válido.');
  }
  if (!apply) return lessons.length;
  const [applied] = await sql`WITH editable AS (
    UPDATE lms_courses SET authoring_version = authoring_version + 1,
      learning_outcomes = COALESCE(NULLIF(btrim(learning_outcomes), ''), ${outcomes}),
      audience = COALESCE(NULLIF(btrim(audience), ''), ${audience}),
      prerequisites = COALESCE(NULLIF(btrim(prerequisites), ''), ${prerequisites})
    WHERE id = ${draft.id} AND NOT published AND review_requested_at IS NULL RETURNING id
  ), materials AS (
    INSERT INTO lms_resources (id, lesson_id, kind, title, content, sort_order)
    SELECT md5('demo:' || d.id || ':' || m.id), l.id, ${TEXT_TEMPLATE_KIND}, m.title, m.content, 100
    FROM editable d JOIN lms_lessons l ON l.course_id = d.id
    JOIN jsonb_to_recordset(${JSON.stringify(metaAdsMaterials)}::jsonb) AS m(id text, lesson text, title text, content text)
      ON m.lesson = l.slug
    WHERE NOT EXISTS (SELECT FROM lms_resources r WHERE r.lesson_id = l.id AND r.kind = ${TEXT_TEMPLATE_KIND} AND r.title = m.title)
    ON CONFLICT (id) DO NOTHING
  ) SELECT id FROM editable`;
  if (!applied) throw new Error('El borrador cambió de estado. Comprueba la ficha antes de reintentar.');
  return lessons.length;
}

async function main() {
  loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL.');
  const apply = process.argv.includes('--apply');
  const count = await prepareMetaAdsCourse(neon(process.env.DATABASE_URL), apply);
  console.log(`${count} clases con video y evaluación. Materiales: ${metaAdsMaterials.map((item) => item.title).join(', ')}.`);
  if (apply) console.log('Ficha y materiales preparados. Envía el borrador a revisión desde el panel.');
}

if (process.argv[1]?.endsWith('prepare-meta-ads-course.ts')) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
