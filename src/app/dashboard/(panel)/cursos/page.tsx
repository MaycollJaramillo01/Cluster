import Link from 'next/link';
import { saveFeaturedCourses } from '@/lib/crm/lms-actions';
import { listCourses } from '@/lib/crm/lms';
import { academyMoney as money } from '@/lib/valux/money';
import { featuredCourseIds, selectFeatured } from '@/lib/valux/catalog';
import { Button } from '@astryxdesign/core/Button';
import { courseStatusLabel } from '@/components/dashboard/TeacherCourseBuilder';
import { TeacherCourseForm } from '@/components/dashboard/TeacherCourseForm';
import { AcademySurface } from '@/components/academia/AcademySurface';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { requireDashboard } from '@/lib/crm/session';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Icon } from '@/components/ui/Icon';

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ error?: string; guardado?: string; vista?: string }> }) {
  await requireDashboard('contenido');
  const query = await searchParams;
  if (query.vista === 'nuevo' || query.error === 'curso') return <TeacherCourseForm staff error={query.error} />;
  const [courses, selected] = await Promise.all([listCourses(), featuredCourseIds()]);
  courses.sort((a, b) => Number(Boolean(b.review_requested_at && !b.published)) - Number(Boolean(a.review_requested_at && !a.published)));
  const published = courses.filter((course) => course.published);
  const featured = selectFeatured(published, selected);
  const stats = [['Cursos', courses.length], ['Publicados', published.length], ['Lecciones', courses.reduce((sum, c) => sum + c.lessons, 0)], ['Por revisar', courses.filter((c) => c.review_requested_at).length]];
  return (
    <AcademySurface className="mx-auto w-full max-w-6xl gap-7">
      <HStack gap={4} justify="between" align="end" wrap="wrap">
        <Heading level={1} className="academy-title">Cursos</Heading>
        <HStack gap={2} wrap="wrap">
          <Button as={Link} href="/dashboard/cursos/revisiones" label="Revisiones" variant="secondary" />
          <Button as={Link} href="/dashboard/cursos?vista=nuevo" label="Crear curso" variant="primary" />
        </HStack>
      </HStack>
      <Grid columns={{ minWidth: 135, max: 4 }} gap={0} className="academy-panel overflow-hidden bg-academy-tint">
        {stats.map(([title, value]) => <VStack gap={2} key={title} className="border-academy-line p-4 sm:border-r sm:last:border-r-0"><Text type="supporting" className="font-semibold">{title}</Text><Text className="text-3xl font-bold" hasTabularNumbers>{value}</Text></VStack>)}
      </Grid>
      <VStack as="section" gap={5} className="academy-panel p-5 sm:p-6" aria-labelledby="featured-settings">
        <HStack gap={3} align="center" justify="between" wrap="wrap"><Heading id="featured-settings" level={2} className="academy-section-title">Cursos destacados</Heading><Text type="supporting">{featured.length} de 4 seleccionados</Text></HStack>
        {query.error === 'destacados' ? <Text role="alert" as="p" className="border-l-2 border-ink bg-paper-soft p-4">Selecciona hasta cuatro cursos publicados, sin repetir ninguno.</Text> : null}
        {query.guardado === 'destacados' ? <Text role="status" as="p" className="bg-brand/10 p-4">Se guardaron los cursos destacados.</Text> : null}
        <form action={saveFeaturedCourses} className="space-y-5">
          <Grid columns={{ minWidth: 190, max: 4 }} gap={4}>
            {[0,1,2,3].map((index) => <label key={index} className="min-w-0 space-y-2 text-sm"><Text display="block" type="label">Destacado {index + 1}</Text><select name="featured" defaultValue={featured[index]?.id || ''} className="academy-field w-full min-w-0"><option value="">Sin seleccionar</option>{published.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>)}
          </Grid>
          <AcademySubmit label="Guardar destacados" pending="Guardando…" />
        </form>
      </VStack>
      <VStack as="section" gap={4} aria-labelledby="all-courses">
        <HStack justify="between" align="center" gap={4} wrap="wrap"><Heading id="all-courses" level={2} className="academy-section-title">Todos los cursos</Heading><Link href="/dashboard/cursos/marketplace" className="academy-nav academy-focus">Gestionar Marketplace <Icon name="arrow-right" size={15} /></Link></HStack>
        {courses.length ? <VStack className="academy-panel overflow-x-auto" tabIndex={0}>
          <table className="w-full min-w-max border-collapse text-left text-sm">
            <thead><tr className="border-b border-black/10 bg-paper-soft text-xs text-black/55"><th className="px-5 py-4 font-medium">Curso</th><th className="px-5 py-4 font-medium">Estado</th><th className="px-5 py-4 font-medium">Clases</th><th className="px-5 py-4 font-medium">Alumnos</th><th className="px-5 py-4 font-medium">Precio</th><th className="px-5 py-4 font-medium">Acción</th></tr></thead>
            <tbody>{courses.map((course) => <tr key={course.id} className="border-b border-black/5 last:border-0 hover:bg-paper"><td className="max-w-xs px-5 py-5"><Link href={`/dashboard/cursos/${course.id}`} className="font-semibold hover:underline">{course.title}</Link>{featured.some((item) => item.id === course.id) ? <Text display="block" type="supporting">En la portada</Text> : null}</td><td className="px-5 py-5">{courseStatusLabel(course)}</td><td className="px-5 py-5 tabular-nums">{course.lessons}</td><td className="px-5 py-5 tabular-nums">{course.students}</td><td className="px-5 py-5">{course.price_cents ? money(course.price_cents) : 'Gratis'}</td><td className="px-5 py-5"><Link href={`/dashboard/cursos/${course.id}?vista=${course.review_requested_at ? 'revision' : 'temario'}`} className="underline underline-offset-4">{course.review_requested_at ? 'Revisar curso' : 'Abrir editor'} →</Link></td></tr>)}</tbody>
          </table>
        </VStack> : <VStack gap={2} padding={8} className="border border-dashed border-black/20"><Heading level={3}>Tu primer curso empieza aquí</Heading></VStack>}
      </VStack>
    </AcademySurface>
  );
}
