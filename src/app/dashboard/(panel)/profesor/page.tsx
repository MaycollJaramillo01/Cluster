import Link from 'next/link';
import { Button } from '@astryxdesign/core/Button';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Icon } from '@/components/ui/Icon';
import { crm } from '@/lib/crm/db';
import { formatDate } from '@/lib/crm/format';
import { requireDashboard } from '@/lib/crm/session';
import { getPersonByEmail } from '@/lib/valux/data';
import { academyMoney as money } from '@/lib/valux/money';
import { TeacherCourseForm } from '@/components/dashboard/TeacherCourseForm';

// Todo se filtra por la persona de la academia con el mismo correo: nunca ve cursos, alumnos ni ventas de otros.
export default async function ProfesorPage({ searchParams }: { searchParams: Promise<{ error?: string; vista?: string }> }) {
  const session = await requireDashboard('profesor');
  const { error, vista } = await searchParams;
  if (session.role === 'profesor' && (vista === 'nuevo' || error === 'curso')) return <TeacherCourseForm error={error} />;
  const newCourse = session.role === 'profesor' ? (
    <Button as={Link} href="/dashboard/profesor?vista=nuevo" label="Crear curso" variant="primary" size="lg" />
  ) : null;
  const person = await getPersonByEmail(session.email);
  if (!person) {
    return (
      <section className="space-y-5">
        <HStack gap={3} align="center" justify="between" wrap="wrap"><Heading level={1} className="academy-title">Mis cursos</Heading>{newCourse}</HStack>
        <p className="academy-notice">Todavía no tienes cursos.</p>
      </section>
    );
  }
  const sql = await crm();
  const courses = (await sql`
    SELECT c.id, c.title, c.published, c.review_requested_at, c.review_feedback,
      (SELECT count(*) FROM lms_lessons l WHERE l.course_id = c.id) AS lessons
    FROM lms_courses c WHERE c.teacher_id = ${person.id} AND c.revision_of IS NULL
    ORDER BY c.created_at DESC
  `) as unknown as { id: string; title: string; published: boolean; review_requested_at: string | null; review_feedback: string | null; lessons: number }[];
  const ids = courses.map((course) => course.id);
  const students = ids.length
    ? ((await sql`
        SELECT e.course_id, v.name, e.created_at,
          (
            SELECT count(*) FROM lms_progress p JOIN lms_lessons l ON l.id = p.lesson_id
            WHERE l.course_id = e.course_id AND p.person_id = e.person_id AND p.completed_at IS NOT NULL
          ) AS done,
          (
            SELECT COALESCE(sum(x.xp), 0) FROM lms_xp x JOIN lms_lessons l ON l.id = x.lesson_id
            WHERE l.course_id = e.course_id AND x.person_id = e.person_id
          ) AS xp
        FROM lms_enrollments e JOIN valux_people v ON v.id = e.person_id
        WHERE e.course_id = ANY(${ids})
        ORDER BY e.created_at DESC
      `) as unknown as { course_id: string; name: string; created_at: string; done: number; xp: number }[])
    : [];
  const sales = (await sql`
    SELECT s.created_at, s.amount_cents, s.seller_cents, s.refunded_at, c.title
    FROM valux_sales s LEFT JOIN lms_courses c ON c.id = s.course_id
    WHERE s.seller_id = ${person.id}
    ORDER BY s.created_at DESC LIMIT 100
  `) as unknown as { created_at: string; amount_cents: number; seller_cents: number; refunded_at: string | null; title: string | null }[];
  const payouts = (await sql`
    SELECT period_ym, amount_cents, status FROM valux_payouts WHERE seller_id = ${person.id} ORDER BY period_ym DESC LIMIT 12
  `) as unknown as { period_ym: string; amount_cents: number; status: string }[];
  const earned = sales.filter((sale) => !sale.refunded_at).reduce((sum, sale) => sum + Number(sale.seller_cents), 0);

  return (
    <VStack gap={8} className="mx-auto w-full max-w-6xl">
      <HStack as="header" gap={4} align="center" justify="between" wrap="wrap">
        <Heading level={1} className="academy-title">Mis cursos</Heading>
        {newCourse}
      </HStack>
      <Grid columns={{ minWidth: 146, max: 3 }} gap={0} className="academy-panel overflow-hidden bg-academy-tint">
        {[
          { label: 'Cursos', value: courses.length },
          { label: 'Inscripciones', value: students.length },
          { label: 'Tu parte de las ventas (últimas 100)', value: money(earned) },
        ].map((metric) => (
          <VStack as="dl" key={metric.label} gap={2} className="min-w-0 border-academy-line p-4 sm:border-r sm:last:border-r-0">
            <dt className="text-sm font-semibold text-academy-muted">{metric.label}</dt>
            <dd className="break-words text-3xl font-bold tabular-nums text-academy-ink">{metric.value}</dd>
          </VStack>
        ))}
      </Grid>

      {courses.length === 0 ? <p className="text-sm text-black/60">Todavía no tienes cursos.</p> : courses.map((course) => {
        const mine = students.filter((student) => student.course_id === course.id);
        const lessons = Number(course.lessons) || 0;
        return (
          <section key={course.id} className="academy-panel space-y-3 p-4 sm:p-5">
            <HStack align="center" justify="between" wrap="wrap" gap={3}>
              <VStack gap={2} className="min-w-0">
                <Heading level={2} className="break-words text-xl font-bold">{course.title}</Heading>
                <p className="text-sm text-academy-muted">{course.published ? 'Publicado' : course.review_requested_at ? 'En revisión' : course.review_feedback ? 'Cambios solicitados' : 'Borrador'} · {lessons} {Number(lessons) === 1 ? 'clase' : 'clases'} · {mine.length} {mine.length === 1 ? 'alumno' : 'alumnos'}</p>
              </VStack>
              <Button as={Link} href={`/dashboard/cursos/${course.id}?vista=${course.review_requested_at || course.review_feedback ? 'revision' : 'temario'}`} label="Abrir editor" icon={<Icon name="pen" size={16} />} />
            </HStack>
            {mine.length === 0 ? <p className="text-sm text-academy-muted">Sin alumnos todavía.</p> : (
              <section className="academy-panel overflow-x-auto" aria-label={`Alumnos de ${course.title}`} tabIndex={0}>
              <table className="w-full min-w-max text-left text-sm">
                <thead><tr className="border-b border-black/10 text-xs text-academy-muted"><th className="px-4 py-2 font-medium">Alumno</th><th className="px-4 py-2 font-medium">Desde</th><th className="px-4 py-2 font-medium">Avance</th><th className="px-4 py-2 font-medium">XP</th></tr></thead>
                <tbody>
                  {mine.map((student, index) => (
                    <tr key={index} className="border-b border-black/5">
                      <td className="px-4 py-2">{student.name}</td>
                      <td className="px-4 py-2">{formatDate(student.created_at)}</td>
                      <td className="px-4 py-2">{Number(student.done)} / {lessons}</td>
                      <td className="px-4 py-2">{Number(student.xp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </section>
            )}
          </section>
        );
      })}

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Ventas</h2>
        {sales.length === 0 ? <p className="text-sm text-academy-muted">Sin ventas todavía.</p> : (
          <section className="academy-panel overflow-x-auto" aria-label="Detalle de ventas" tabIndex={0}>
          <table className="w-full min-w-max text-left text-sm">
            <thead><tr className="border-b border-black/10 text-xs text-academy-muted"><th className="px-4 py-2 font-medium">Fecha</th><th className="px-4 py-2 font-medium">Curso</th><th className="px-4 py-2 font-medium">Total</th><th className="px-4 py-2 font-medium">Tu parte</th></tr></thead>
            <tbody>
              {sales.map((sale, index) => (
                <tr key={index} className={`border-b border-black/5 ${sale.refunded_at ? 'text-black/40 line-through' : ''}`}>
                  <td className="px-4 py-2">{formatDate(sale.created_at)}</td>
                  <td className="px-4 py-2">{sale.title || '—'}</td>
                  <td className="px-4 py-2">{money(Number(sale.amount_cents))}</td>
                  <td className="px-4 py-2">{money(Number(sale.seller_cents))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </section>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Liquidaciones</h2>
        {payouts.length === 0 ? <p className="text-sm text-academy-muted">Sin liquidaciones todavía.</p> : (
          <ul className="space-y-1 text-sm">
            {payouts.map((payout) => <li key={payout.period_ym}>{payout.period_ym}: {money(Number(payout.amount_cents))} · {payout.status}</li>)}
          </ul>
        )}
      </section>
    </VStack>
  );
}
