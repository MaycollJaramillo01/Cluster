import { loadEnvConfig } from '@next/env';
import { neon } from '@neondatabase/serverless';
import { lessonEmbed } from '../src/lib/valux/video';

const courseSlug = 'meta-ads-negocios-locales';
const videos = {
  bienvenida: 'ozhuXaaEzvA',
  'como-decide-meta': 'wtFx0AMclnM',
  'prepara-tu-cuenta': 'rH_HbIpWTz8',
  'objetivo-de-campana': 'Hl4cf6hIaP4',
  'publico-y-presupuesto': 'ZaTAlgErNFA',
  creativos: 'BZdRSrrZ2Tc',
  metricas: 'dIj8vTYWNbY',
  optimiza: 'jT274YBWm14',
};

async function main() {
  loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL.');
  const sql = neon(process.env.DATABASE_URL);
  const urls = Object.fromEntries(Object.entries(videos).map(([slug, id]) => {
    const url = `https://www.youtube.com/watch?v=${id}`;
    if (lessonEmbed(url) !== `https://www.youtube.com/embed/${id}`) throw new Error(`Video inválido para ${slug}.`);
    return [slug, url];
  }));
  const slugs = Object.keys(urls);
  const lessons = await sql`
    SELECT l.slug, l.title, l.video_url
    FROM lms_lessons l JOIN lms_courses c ON c.id = l.course_id
    WHERE c.slug = ${courseSlug} AND c.published AND l.slug = ANY(${slugs})
    ORDER BY l.sort_order
  `;
  if (lessons.length !== slugs.length || new Set(lessons.map((lesson) => lesson.slug)).size !== slugs.length) {
    throw new Error('El temario publicado no coincide con los videos seleccionados.');
  }
  if (!process.argv.includes('--apply')) {
    console.table(lessons.map((lesson) => ({ clase: lesson.slug, video: lesson.video_url || urls[lesson.slug] })));
    console.log('Vista previa. Usa --apply para guardar los videos de las lecciones vacías.');
    return;
  }
  const updated = await sql`
    UPDATE lms_lessons l SET video_url = v.value
    FROM lms_courses c, jsonb_each_text(${JSON.stringify(urls)}::jsonb) AS v
    WHERE l.course_id = c.id AND c.slug = ${courseSlug} AND c.published
      AND l.slug = v.key AND COALESCE(btrim(l.video_url), '') = ''
    RETURNING l.slug, l.video_url
  `;
  console.table(updated);
  console.log(`${updated.length} videos agregados. Las lecciones con video previo se conservan.`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
