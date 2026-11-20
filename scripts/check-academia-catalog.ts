export {};
import assert from 'node:assert/strict';

async function main() {
  if (!process.env.LMS_TEST_SCHEMA) throw new Error('Ejecuta esta prueba con npm run test:lms');
  const sql = await (require('@/lib/crm/db') as typeof import('@/lib/crm/db')).crm();
  const jar = new Map<string, string>();
  require('next/headers').cookies = async () => ({ get: (key: string) => jar.has(key) ? { value: jar.get(key) } : undefined });
  require('next/cache').revalidatePath = () => {};
  const { saveFeaturedCourses } = await import('@/lib/crm/lms-actions');
  const { featuredCourseIds, selectFeatured, FEATURED_KEY } = await import('@/lib/valux/catalog');
  const { issueSession, SESSION_COOKIE, PRIMARY_ADMIN } = await import('@/lib/crm/session');
  async function save(ids: string[]) {
    const form = new FormData(); ids.forEach((id) => form.append('featured', id));
    try { await saveFeaturedCourses(form); } catch (e) {
      const digest = (e as { digest?: string }).digest || '';
      if (!digest.startsWith('NEXT_REDIRECT;')) throw e;
      return digest.split(';')[2];
    }
    throw new Error('Se esperaba una redirección');
  }
  for (let i = 0; i < 5; i++) await sql`INSERT INTO lms_courses(id,slug,title,published) VALUES (${`feature-${i}`},${`feature-${i}`},${`Curso ${i}`},true)`;
  await sql`INSERT INTO lms_courses(id,slug,title,published) VALUES ('feature-draft','feature-draft','Borrador',false)`;
  const courses = Array.from({ length: 5 }, (_, i) => ({ id: `feature-${i}` }));
  assert.equal(selectFeatured(courses, null).length, 4);
  assert.equal(selectFeatured(courses.slice(0,1), null).length, 1);
  assert.deepEqual(selectFeatured(courses, ['feature-2','feature-0','deleted','feature-2']).map((c) => c.id), ['feature-2','feature-0']);
  console.log('OK   hasta cuatro cursos reales; orden estable, sin duplicados ni cursos eliminados');
  assert.match(await save(['feature-0']), /dashboard\/login/);
  assert.equal(await featuredCourseIds(), null);
  console.log('OK   un visitante no puede cambiar los destacados');
  jar.set(SESSION_COOKIE, issueSession(PRIMARY_ADMIN, 'Prueba', 'superadmin'));
  assert.match(await save(['feature-0','feature-0']), /error=destacados/);
  assert.match(await save(courses.map((c) => c.id)), /error=destacados/);
  assert.match(await save(['feature-draft']), /error=destacados/);
  assert.match(await save(['missing']), /error=destacados/);
  assert.equal(await featuredCourseIds(), null);
  console.log('OK   el servidor rechaza duplicados, más de cuatro y cursos sin publicar');
  const ids = ['feature-3','feature-1','feature-2','feature-0'];
  assert.match(await save(ids), /guardado=destacados/);
  assert.deepEqual(await featuredCourseIds(), ids);
  assert.deepEqual(selectFeatured(courses, await featuredCourseIds()).map((c) => c.id), ids);
  assert.match(await save([]), /guardado=destacados/);
  assert.deepEqual(await featuredCourseIds(), []);
  console.log('OK   el equipo guarda el orden de cuatro cursos y puede vaciar la selección');
  await sql`DELETE FROM crm_meta WHERE key=${FEATURED_KEY}`;
}
main().catch((error) => { console.error(error); process.exitCode=1; });
