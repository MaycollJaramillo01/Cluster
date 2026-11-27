import Link from 'next/link';
import { Badge } from '@astryxdesign/core/Badge';
import { Grid } from '@astryxdesign/core/Grid';
import { VStack } from '@astryxdesign/core/VStack';
import { saveFeaturedCourses } from '@/lib/crm/lms-actions';
import { pendingCourseAccessCounts } from '@/lib/crm/course-access-requests';
import { listCourses } from '@/lib/crm/lms';
import { academyMoney as money } from '@/lib/valux/money';
import { featuredCourseIds, selectFeatured } from '@/lib/valux/catalog';
import { CourseStatusPill, NewCourseForm } from '@/components/dashboard/TeacherCourseBuilder';
import { Empty, Field, Notice, PageTitle, SectionTitle, Stat, Table, btnGhost, cell, fieldClass } from '@/components/dashboard/StaffUi';
import { requireDashboard } from '@/lib/crm/session';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Icon } from '@/components/ui/Icon';

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ error?: string; guardado?: string }> }) {
  await requireDashboard('contenido');
  const query = await searchParams;
  const [courses, selected, requests] = await Promise.all([listCourses(), featuredCourseIds(), pendingCourseAccessCounts()]);
  const pendingByCourse = new Map(requests.map((request) => [request.course_id, request.pending]));
  courses.sort((a, b) => Number(Boolean(b.review_requested_at && !b.published)) - Number(Boolean(a.review_requested_at && !a.published)));
  const published = courses.filter((course) => course.published);
  const featured = selectFeatured(published, selected);
  const toReview = courses.filter((course) => course.review_requested_at).length;

  return (
    <VStack gap={8} className="mx-auto w-full max-w-6xl">
      <PageTitle
        eyebrow="Contenido"
        title="Cursos"
        description="Crea cursos, revisa los que envían los profesores y elige cuáles destacan en la portada."
        action={<Link href="/dashboard/cursos/revisiones" className={btnGhost}>Revisiones{toReview ? <Badge label={String(toReview)} /> : null}</Link>}
      />
      <NewCourseForm error={query.error} />
      <Grid columns={{ minWidth: 160, max: 4 }} gap={4}>
        <Stat label="Cursos" value={courses.length} />
        <Stat label="Publicados" value={published.length} />
        <Stat label="Clases" value={courses.reduce((sum, course) => sum + course.lessons, 0)} />
        <Stat label="Por revisar" value={toReview} />
      </Grid>

      <VStack as="section" gap={4} aria-labelledby="all-courses">
        <SectionTitle id="all-courses" title="Todos los cursos" action={<Link href="/dashboard/cursos/marketplace" className="academy-nav academy-focus">Gestionar marketplace <Icon name="arrow-right" size={15} /></Link>} />
        {courses.length ? (
          <Table label="Todos los cursos" head={['Curso', 'Estado', 'Clases', 'Alumnos', 'Precio', 'Acción']}>
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-academy-page">
                <td className={`${cell} max-w-xs`}>
                  <Link href={`/dashboard/cursos/${course.id}`} className="academy-focus font-semibold hover:underline">{course.title}</Link>
                  {pendingByCourse.has(course.id) ? <Link href={`/dashboard/cursos/${course.id}?vista=alumnos`} className="academy-focus block text-sm underline">Solicitudes de acceso ({pendingByCourse.get(course.id)})</Link> : null}
                  {featured.some((item) => item.id === course.id) ? <small className="block text-xs text-academy-muted">En la portada</small> : null}
                </td>
                <td className={cell}><CourseStatusPill course={course} /></td>
                <td className={`${cell} tabular-nums`}>{course.lessons}</td>
                <td className={`${cell} tabular-nums`}>{course.students}</td>
                <td className={`${cell} whitespace-nowrap tabular-nums`}>{course.price_cents ? money(course.price_cents) : 'Gratis'}</td>
                <td className={cell}>
                  <Link href={`/dashboard/cursos/${course.id}?vista=${course.review_requested_at ? 'revision' : 'temario'}`} className="academy-nav academy-focus -my-2 -ml-3 whitespace-nowrap text-academy-primary">
                    {course.review_requested_at ? 'Revisar curso' : 'Abrir editor'}<small className="sr-only"> {course.title}</small><Icon name="arrow-right" size={15} />
                  </Link>
                </td>
              </tr>
            ))}
          </Table>
        ) : <Empty title="Tu primer curso empieza aquí.">Escribe su título arriba; después completas la ficha, organizas el temario y preparas cada clase.</Empty>}
      </VStack>

      <VStack as="section" gap={5} className="academy-panel p-5 sm:p-6" aria-labelledby="featured-settings">
        <SectionTitle id="featured-settings" title="Cursos destacados" description={`Aparecen primero en la portada de la academia. ${featured.length} de 4 seleccionados.`} />
        {query.error === 'destacados' ? <Notice tone="error">Selecciona hasta cuatro cursos publicados, sin repetir ninguno.</Notice> : null}
        {query.guardado === 'destacados' ? <Notice tone="ok">Se guardaron los cursos destacados.</Notice> : null}
        <form action={saveFeaturedCourses} className="space-y-5">
          <Grid columns={{ minWidth: 280, max: 2 }} gap={4}>
            {[0, 1, 2, 3].map((index) => (
              <Field key={index} label={`Destacado ${index + 1}`}>
                <select name="featured" defaultValue={featured[index]?.id || ''} className={fieldClass}>
                  <option value="">Sin seleccionar</option>
                  {published.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                </select>
              </Field>
            ))}
          </Grid>
          <AcademySubmit label="Guardar destacados" pending="Guardando…" />
        </form>
      </VStack>
    </VStack>
  );
}
