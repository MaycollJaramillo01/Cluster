import Link from 'next/link';
import { createCourse, saveFeaturedCourses } from '@/lib/crm/lms-actions';
import { listCourses } from '@/lib/crm/lms';
import { academyMoney as money } from '@/lib/valux/money';
import { featuredCourseIds, selectFeatured } from '@/lib/valux/catalog';
import { Field, btn, fieldClass } from '@/components/dashboard/ui';
import { AcademySurface } from '@/components/academia/AcademySurface';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ error?: string; guardado?: string }> }) {
  const [courses, selected, query] = await Promise.all([listCourses(), featuredCourseIds(), searchParams]);
  const published = courses.filter((course) => course.published);
  const featured = selectFeatured(published, selected);
  const stats = [['Cursos', courses.length], ['Publicados', published.length], ['Lecciones', courses.reduce((sum, c) => sum + c.lessons, 0)], ['Por revisar', courses.filter((c) => c.review_requested_at).length]];
  return (
    <AcademySurface className="gap-8">
      <HStack gap={4} justify="between" align="end" wrap="wrap">
        <VStack gap={2}><Text type="label" className="text-xs uppercase tracking-widest text-black/50">Gestión de la academia</Text><Heading level={1} className="font-display text-5xl tracking-wide">Cursos</Heading></VStack>
        <Link href="/academia" className="border border-black/20 bg-white px-4 py-3 text-sm hover:border-ink">Ver academia ↗</Link>
      </HStack>
      <Grid columns={{ minWidth: 150, max: 4 }} gap={4} className="border-y border-black/10 py-6">
        {stats.map(([title, value]) => <VStack gap={2} key={title}><Text type="supporting">{title}</Text><Text type="display-3" hasTabularNumbers>{value}</Text></VStack>)}
      </Grid>
      <VStack as="section" gap={5} className="border border-black/10 bg-white p-5 sm:p-6" aria-labelledby="featured-settings">
        <HStack gap={4} justify="between" wrap="wrap"><VStack gap={2}><Heading id="featured-settings" level={2} className="font-display text-3xl tracking-wide">Cursos destacados</Heading></VStack><Text type="label">{featured.length} de 4 seleccionados</Text></HStack>
        {query.error === 'destacados' ? <Text role="alert" as="p" className="border-l-2 border-ink bg-paper-soft p-4">Selecciona hasta cuatro cursos publicados, sin repetir ninguno.</Text> : null}
        {query.guardado === 'destacados' ? <Text role="status" as="p" className="bg-brand/10 p-4">Cursos destacados quedó guardada.</Text> : null}
        <form action={saveFeaturedCourses} className="space-y-5">
          <Grid columns={{ minWidth: 190, max: 4 }} gap={4}>
            {[0,1,2,3].map((index) => <label key={index} className="min-w-0 space-y-2 text-sm"><Text as="span" display="block" type="label">Destacado {index + 1}</Text><select name="featured" defaultValue={featured[index]?.id || ''} className="min-h-12 w-full min-w-0 border border-black/20 bg-white px-3 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"><option value="">Sin seleccionar</option>{published.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>)}
          </Grid>
          <button className={btn} type="submit">Guardar destacados</button>
        </form>
      </VStack>
      <VStack as="section" gap={4} aria-labelledby="all-courses">
        <HStack justify="between" align="center" gap={4} wrap="wrap"><Heading id="all-courses" level={2} className="font-display text-3xl tracking-wide">Todos los cursos</Heading><Link href="/dashboard/cursos/marketplace" className="text-sm underline underline-offset-4">Gestionar Marketplace →</Link></HStack>
        {courses.length ? <VStack className="overflow-x-auto border border-black/10 bg-white">
          <table className="w-full min-w-max border-collapse text-left text-sm">
            <thead><tr className="border-b border-black/10 bg-paper-soft text-xs text-black/55"><th className="px-5 py-4 font-medium">Curso</th><th className="px-5 py-4 font-medium">Estado</th><th className="px-5 py-4 font-medium">Clases</th><th className="px-5 py-4 font-medium">Alumnos</th><th className="px-5 py-4 font-medium">Precio</th><th className="px-5 py-4 font-medium">Acción</th></tr></thead>
            <tbody>{courses.map((course) => <tr key={course.id} className="border-b border-black/5 last:border-0 hover:bg-paper"><td className="max-w-xs px-5 py-5"><Link href={`/dashboard/cursos/${course.id}`} className="font-semibold hover:underline">{course.title}</Link>{featured.some((item) => item.id === course.id) ? <Text display="block" type="supporting">En la portada</Text> : null}</td><td className="px-5 py-5">{course.published ? 'Publicado' : course.review_requested_at ? 'Revisión pendiente' : 'Borrador'}</td><td className="px-5 py-5 tabular-nums">{course.lessons}</td><td className="px-5 py-5 tabular-nums">{course.students}</td><td className="px-5 py-5">{course.price_cents ? money(course.price_cents) : 'Gratis'}</td><td className="px-5 py-5"><Link href={`/dashboard/cursos/${course.id}`} className="underline underline-offset-4">Editar curso →</Link></td></tr>)}</tbody>
          </table>
        </VStack> : <VStack gap={2} padding={8} className="border border-dashed border-black/20"><Heading level={3}>Tu primer curso empieza aquí</Heading></VStack>}
      </VStack>
      <details className="border border-black/10 bg-white p-5 sm:p-6">
        <summary className="cursor-pointer text-base font-semibold focus-visible:outline focus-visible:outline-2">Crear un nuevo curso</summary>
        <form action={createCourse} className="mt-6 max-w-2xl space-y-4">
          <Field label="Título"><input className={fieldClass} name="title" required /></Field>
          <Field label="Descripción"><textarea className={fieldClass} name="description" rows={4} required /></Field>
          <Field label="Precio (L)"><input className={fieldClass} name="price" type="number" min="0" step="0.01" defaultValue="0" /></Field>
          <Field label="Portada"><input className={fieldClass} name="cover_url" placeholder="https://" /></Field>
          <Field label="O sube la portada"><input className={fieldClass} name="cover" type="file" accept="image/*" /></Field>
          <Field label="Video de la primera lección"><input className={fieldClass} name="video_url" placeholder="https://" /></Field>
          <label className="flex items-center gap-2 text-sm"><input name="published" type="checkbox" />Publicar en el catálogo</label>
          <button className={btn} type="submit">Crear curso</button>
        </form>
      </details>
    </AcademySurface>
  );
}
