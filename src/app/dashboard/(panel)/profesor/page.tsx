import Link from 'next/link';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { VStack } from '@astryxdesign/core/VStack';
import { Icon } from '@/components/ui/Icon';
import { crm } from '@/lib/crm/db';
import { formatDate } from '@/lib/crm/format';
import { requireDashboard } from '@/lib/crm/session';
import { getPersonByEmail } from '@/lib/valux/data';
import { academyMoney as money } from '@/lib/valux/money';
import { TeacherCourseForm } from '@/components/dashboard/TeacherCourseForm';
import { CourseStatusPill } from '@/components/dashboard/TeacherCourseBuilder';
import { Empty, PageTitle, PayoutStatus, Pill, SectionTitle, Stat, Table, btn, btnGhost, cell, periodLabel, rowClass } from '@/components/dashboard/StaffUi';

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

// Todo se filtra por la persona de la academia con el mismo correo: nunca ve cursos, alumnos ni ventas de otros.
export default async function ProfesorPage({ searchParams }: { searchParams: Promise<{ error?: string; vista?: string }> }) {
  const session = await requireDashboard('profesor');
  const { error, vista } = await searchParams;
  if (session.role === 'profesor' && (vista === 'nuevo' || error === 'curso')) return <TeacherCourseForm error={error} />;
  const newCourse = session.role === 'profesor' ? (
    <Link href="/dashboard/profesor?vista=nuevo" className={btn}><Icon name="pen" size={16} />Crear curso</Link>
  ) : null;
  const header = <PageTitle title="Mis cursos" description="Edita tus cursos y sigue el avance de tus alumnos y lo que te corresponde de las ventas." action={newCourse} />;
  const person = await getPersonByEmail(session.email);
  if (!person) {
    return (
      <VStack gap={8} className="mx-auto w-full max-w-6xl">
        {header}
        <Empty title="Todavía no tienes cursos.">Crea tu primer curso; después podrás organizar el temario y preparar cada clase.</Empty>
      </VStack>
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
  const published = courses.filter((course) => course.published).length;

  return (
    <VStack gap={8} className="mx-auto w-full max-w-6xl">
      {header}
      <Grid columns={{ minWidth: 200, max: 3 }} gap={4}>
        <Stat label="Cursos" value={courses.length} hint={plural(published, 'publicado', 'publicados')} />
        <Stat label="Inscripciones" value={students.length} hint="En todos tus cursos" />
        <Stat label="Tu parte de las ventas" value={money(earned)} hint="Últimas 100 ventas, sin reembolsos" />
      </Grid>

      <VStack as="section" gap={4} aria-labelledby="mis-cursos">
        <SectionTitle id="mis-cursos" title="Cursos" />
        {courses.length === 0 ? <Empty title="Todavía no tienes cursos.">Crea tu primer curso; después podrás organizar el temario y preparar cada clase.</Empty> : (
          <ul className="academy-panel divide-y divide-academy-line overflow-hidden">
            {courses.map((course) => {
              const mine = students.filter((student) => student.course_id === course.id);
              const lessons = Number(course.lessons) || 0;
              return (
                <li key={course.id}>
                  <article aria-labelledby={`curso-${course.id}`}>
                    <HStack gap={4} align="center" justify="between" wrap="wrap" className="p-4 sm:p-5">
                      <VStack gap={2} className="min-w-0">
                        <HStack gap={3} align="center" wrap="wrap">
                          <Heading id={`curso-${course.id}`} level={3} className="break-words text-lg font-bold">{course.title}</Heading>
                          <CourseStatusPill course={course} />
                        </HStack>
                        <p className="text-sm text-academy-muted">{plural(lessons, 'clase', 'clases')} · {plural(mine.length, 'alumno', 'alumnos')}</p>
                      </VStack>
                      <Link href={`/dashboard/cursos/${course.id}?vista=${course.review_requested_at || course.review_feedback ? 'revision' : 'temario'}`} className={btnGhost}>
                        <Icon name="pen" size={16} />Abrir editor<small className="sr-only"> de {course.title}</small>
                      </Link>
                    </HStack>
                    {mine.length === 0 ? (
                      <p className="border-t border-academy-line bg-academy-page px-4 py-3 text-sm text-academy-muted sm:px-5">Sin alumnos todavía.</p>
                    ) : (
                      <details open className="group border-t border-academy-line">
                        <summary className="academy-focus flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 bg-academy-page px-4 text-sm font-semibold sm:px-5">
                          Alumnos ({mine.length})
                          <Icon name="chevron-down" size={16} className="transition-transform group-open:rotate-180" />
                        </summary>
                        <ul aria-label={`Alumnos de ${course.title}`} className="divide-y divide-academy-line">
                          {mine.map((student, index) => {
                            const done = Math.min(Number(student.done), lessons);
                            return (
                              <li key={index} className="grid gap-x-6 gap-y-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,theme(spacing.72))_theme(spacing.20)] sm:items-center sm:px-5">
                                <VStack gap={0} className="min-w-0">
                                  <p className="break-words font-semibold">{student.name}</p>
                                  <p className="text-xs text-academy-muted">Desde el {formatDate(student.created_at)}</p>
                                </VStack>
                                <VStack gap={1}>
                                  <p className="text-xs tabular-nums text-academy-muted">{done} de {lessons} clases</p>
                                  <ProgressBar label={`Avance de ${student.name}`} value={lessons ? Math.round((done / lessons) * 100) : 0} isLabelHidden />
                                </VStack>
                                <p className="text-sm font-semibold tabular-nums sm:text-right">{Number(student.xp)} XP</p>
                              </li>
                            );
                          })}
                        </ul>
                      </details>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </VStack>

      <VStack as="section" gap={4} aria-labelledby="ventas">
        <SectionTitle id="ventas" title="Ventas" description="Tu parte ya descuenta la comisión de la academia. Una venta reembolsada no suma." />
        {sales.length === 0 ? <Empty title="Sin ventas todavía." /> : (
          <Table label="Detalle de ventas" head={['Fecha', 'Curso', 'Total', 'Tu parte', 'Estado']}>
            {sales.map((sale, index) => (
              <tr key={index} className={sale.refunded_at ? 'text-academy-muted' : undefined}>
                <td className={`${cell} whitespace-nowrap`}>{formatDate(sale.created_at)}</td>
                <td className={cell}>{sale.title || '—'}</td>
                <td className={`${cell} tabular-nums`}>{money(Number(sale.amount_cents))}</td>
                <td className={`${cell} font-semibold tabular-nums ${sale.refunded_at ? 'line-through' : ''}`}>{money(Number(sale.seller_cents))}</td>
                <td className={cell}>{sale.refunded_at ? <Pill tone="off">Reembolsada</Pill> : <Pill tone="ok">Pagada</Pill>}</td>
              </tr>
            ))}
          </Table>
        )}
      </VStack>

      <VStack as="section" gap={4} aria-labelledby="liquidaciones">
        <SectionTitle id="liquidaciones" title="Liquidaciones" description="Se calculan por mes y se pagan el día 10 del mes siguiente." />
        {payouts.length === 0 ? <Empty title="Sin liquidaciones todavía." /> : (
          <ul className="academy-panel divide-y divide-academy-line overflow-hidden">
            {payouts.map((payout) => (
              <li key={payout.period_ym} className={rowClass}>
                <p className="font-semibold">{periodLabel(payout.period_ym)}</p>
                <HStack gap={3} align="center">
                  <p className="font-semibold tabular-nums">{money(Number(payout.amount_cents))}</p>
                  <PayoutStatus status={payout.status} />
                </HStack>
              </li>
            ))}
          </ul>
        )}
      </VStack>
    </VStack>
  );
}
