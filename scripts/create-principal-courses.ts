import { loadEnvConfig } from '@next/env';
import { neon } from '@neondatabase/serverless';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseMission } from '../src/lib/valux/mission';
import { principalCourses } from './principal-courses';

loadEnvConfig(process.cwd(), false, { info() {}, error() {} });

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL.');
  const sql = neon(process.env.DATABASE_URL);
  const ids = principalCourses.map((course) => `academy-primary-${course.slug}`);
  if (principalCourses.length !== 4 || new Set(ids).size !== 4) throw new Error('Se requieren cuatro cursos distintos.');
  for (const course of principalCourses) {
    const lessons = course.sections.flatMap((section) => section.lessons);
    if (lessons.length !== 6 || new Set(lessons.map((lesson) => lesson.slug)).size !== 6) throw new Error(`Temario inválido: ${course.slug}`);
    if (!Number.isInteger(course.price) || course.price < 40500 || course.price > 54000) throw new Error(`Precio inválido: ${course.slug}`);
    if (!existsSync(join(process.cwd(), 'public', course.cover))) throw new Error(`Portada inexistente: ${course.cover}`);
    for (const lesson of lessons) {
      const parsed = parseMission(lesson.mission);
      if (lesson.content.trim().length < 600 || parsed.errors.length || parsed.mission?.kind !== 'checklist') throw new Error(`Lección incompleta: ${lesson.slug}`);
    }
  }
  const currency = await sql`SELECT value FROM crm_meta WHERE key = 'academia_currency'`;
  if (currency[0]?.value !== 'HNL') throw new Error('La academia debe estar configurada en HNL.');
  const existing = await sql`SELECT id, slug FROM lms_courses WHERE slug = ANY(${principalCourses.map((course) => course.slug)}) OR id = ANY(${ids})`;
  for (const row of existing) {
    if (row.id !== `academy-primary-${row.slug}` || !ids.includes(row.id)) throw new Error(`Conflicto con curso existente: ${row.slug}`);
  }
  console.log(JSON.stringify(principalCourses.map((course) => ({ title: course.title, price_hnl: course.price / 100, lessons: 6 })), null, 2));
  if (!process.argv.includes('--apply')) {
    console.log('Validación correcta. Usa --apply para crear y publicar los cursos.');
    return;
  }
  const marker = 'academia_principal_courses_2026_11';
  const created = await sql`SELECT value FROM crm_meta WHERE key = ${marker}`;
  if (!created.length) {
    if (existing.length) throw new Error('Hay cursos sin registro de esta carga; revisar antes de modificar.');
    const queries = [sql`SELECT pg_advisory_xact_lock(hashtext(${marker}))`];
    for (const course of principalCourses) {
      const courseId = `academy-primary-${course.slug}`;
      queries.push(sql`INSERT INTO lms_courses (id, slug, title, description, price_cents, published, cover_url, plan_level)
        VALUES (${courseId}, ${course.slug}, ${course.title}, ${course.description}, ${course.price}, true, ${course.cover}, 0)`);
      let position = 0;
      for (const [sectionIndex, section] of course.sections.entries()) {
        const sectionId = `${courseId}-section-${sectionIndex + 1}`;
        queries.push(sql`INSERT INTO lms_sections (id, course_id, title, sort_order)
          VALUES (${sectionId}, ${courseId}, ${section.title}, ${sectionIndex})`);
        for (const lesson of section.lessons) {
          const lessonId = `${courseId}-${lesson.slug}`;
          queries.push(sql`INSERT INTO lms_lessons (id, course_id, section_id, slug, title, content, mission, points, sort_order)
            VALUES (${lessonId}, ${courseId}, ${sectionId}, ${lesson.slug}, ${lesson.title}, ${lesson.content}, ${lesson.mission}, 10, ${position})`);
          if (position === 0) {
            queries.push(sql`INSERT INTO lms_resources (id, lesson_id, kind, title, content, sort_order)
              VALUES (${`${courseId}-template`}, ${lessonId}, 'texto', ${course.resource.title}, ${course.resource.content}, 0)`);
          }
          position += 1;
        }
      }
    }
    queries.push(sql`INSERT INTO crm_meta (key, value) VALUES ('academia_featured_courses', ${JSON.stringify(ids)})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`);
    queries.push(sql`INSERT INTO crm_meta (key, value) VALUES (${marker}, ${JSON.stringify(ids)})`);
    await sql.transaction(queries);
  }
  const rows = await sql`SELECT c.id, c.title, c.slug, c.price_cents, c.published,
    COUNT(DISTINCT s.id)::int AS sections, COUNT(DISTINCT l.id)::int AS lessons,
    COUNT(DISTINCT r.id)::int AS resources,
    COUNT(DISTINCT l.id) FILTER (WHERE length(l.content) > 600 AND length(l.mission) > 0)::int AS completed_content
    FROM lms_courses c LEFT JOIN lms_sections s ON s.course_id = c.id
    LEFT JOIN lms_lessons l ON l.course_id = c.id LEFT JOIN lms_resources r ON r.lesson_id = l.id
    WHERE c.id = ANY(${ids}) GROUP BY c.id ORDER BY c.price_cents`;
  if (rows.length !== 4 || rows.some((row) => !row.published || row.sections !== 2 || row.lessons !== 6 || row.resources !== 1 || row.completed_content !== 6)) {
    throw new Error('La verificación de los cursos guardados no coincide con la carga.');
  }
  console.log('Cursos publicados y verificados:', JSON.stringify(rows, null, 2));
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
