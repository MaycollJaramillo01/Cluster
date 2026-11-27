import Link from 'next/link';
import { HStack } from '@astryxdesign/core/HStack';
import { notFound } from 'next/navigation';
import { VStack } from '@astryxdesign/core/VStack';
import { requireCourseEditor } from '@/lib/crm/course-access';
import { courseLessonReports, courseQuizAttempts, getReportCourse } from '@/lib/crm/course-reports';
import { parseMission } from '@/lib/valux/mission';
import { Empty, PageTitle, SectionTitle, Table, btn, btnGhost, cell } from '@/components/dashboard/StaffUi';
import { Icon } from '@/components/ui/Icon';

function ReportValue({ label, value }: { label: string; value: string | number }) {
  return (
    <td role="cell" className="px-4 pb-3 tabular-nums sm:py-3">
      <small className="block text-xs text-academy-muted sm:hidden">{label}</small>
      {value}
    </td>
  );
}

const head = 'hidden border-b border-academy-line bg-academy-tint text-xs text-academy-muted sm:table-header-group';
const th = 'px-4 py-3 font-semibold';

const attemptDate = new Intl.DateTimeFormat('es-HN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Tegucigalpa' });

export default async function CourseReports({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ alumno?: string; pagina?: string }>;
}) {
  const { id } = await params;
  await requireCourseEditor(id);
  const course = await getReportCourse(id);
  if (!course) notFound();
  const query = await searchParams;
  const student = typeof query.alumno === 'string' ? query.alumno : '';
  const page = Math.min(10000, Math.max(1, Number.parseInt(query.pagina ?? '', 10) || 1));
  const [lessons, attempts] = await Promise.all([courseLessonReports(id), courseQuizAttempts(id, student, (page - 1) * 50)]);
  const quizzes = lessons.filter((lesson) => lesson.attempts || parseMission(lesson.mission ?? '').mission?.kind === 'quiz');
  const base = `/dashboard/cursos/${id}`;
  const attemptsHref = (target: number, person = student) => `${base}/reportes?pagina=${target}${person ? '&alumno=' + encodeURIComponent(person) : ''}#intentos`;
  return (
    <VStack gap={8} className="mx-auto w-full max-w-5xl">
      <PageTitle
        back={{ href: base, label: course.title }}
        eyebrow="Reportes"
        title="Reportes del curso"
        description="Dónde se detienen los alumnos y cómo les va en los cuestionarios."
        action={<a href={`${base}/reportes/exportar`} download className={btn}><Icon name="upload" size={16} className="rotate-180" />Descargar progreso en CSV</a>}
      />
      <VStack as="section" gap={4} aria-labelledby="retencion">
        <SectionTitle id="retencion" title="Abandono por clase" description="Se cuenta a quien abrió una clase hace 7 días o más y todavía no la completó." />
        {lessons.length ? (
          <section tabIndex={0} aria-labelledby="retencion" className="academy-panel relative overflow-x-auto">
            <table role="table" className="block w-full text-left text-sm sm:table">
              <thead className={head}><tr><th scope="col" className={th}>Clase</th><th scope="col" className={th}>Iniciaron</th><th scope="col" className={th}>Completaron</th><th scope="col" className={th}>Abandono</th></tr></thead>
              <tbody role="rowgroup" className="block divide-y divide-academy-line sm:table-row-group">{lessons.map((lesson) => <tr role="row" key={lesson.id} className="grid grid-cols-3 sm:table-row">
                <th scope="row" role="rowheader" className="col-span-full px-4 py-3 font-semibold">{lesson.title}{lesson.section ? <small className="block text-xs font-normal text-academy-muted">{lesson.section}</small> : null}</th>
                <ReportValue label="Iniciaron" value={lesson.started} />
                <ReportValue label="Completaron" value={lesson.finished} />
                <ReportValue label="Abandono" value={lesson.stalled} />
              </tr>)}</tbody>
            </table>
          </section>
        ) : <Empty title="El curso todavía no tiene clases." />}
      </VStack>
      <VStack as="section" gap={4} aria-labelledby="quizzes">
        <SectionTitle id="quizzes" title="Resultados de cuestionarios" />
        {quizzes.length ? (
          <section tabIndex={0} aria-labelledby="quizzes" className="academy-panel relative overflow-x-auto">
            <table role="table" className="block w-full text-left text-sm sm:table">
              <thead className={head}><tr><th scope="col" className={th}>Clase</th><th scope="col" className={th}>Intentos</th><th scope="col" className={th}>Participantes</th><th scope="col" className={th}>Aprobaron</th><th scope="col" className={th}>Promedio</th></tr></thead>
              <tbody role="rowgroup" className="block divide-y divide-academy-line sm:table-row-group">{quizzes.map((lesson) => <tr role="row" key={lesson.id} className="grid grid-cols-2 sm:table-row">
                <th scope="row" role="rowheader" className="col-span-full px-4 py-3 font-semibold">{lesson.title}</th>
                <ReportValue label="Intentos" value={lesson.attempts} />
                <ReportValue label="Participantes" value={lesson.participants} />
                <ReportValue label="Aprobaron" value={lesson.passed} />
                <ReportValue label="Promedio" value={lesson.average == null ? '—' : `${lesson.average}%`} />
              </tr>)}</tbody>
            </table>
          </section>
        ) : <Empty title="Todavía no hay cuestionarios." />}
      </VStack>
      <VStack as="section" gap={4} aria-labelledby="intentos">
        <SectionTitle id="intentos" title="Intentos por alumno" action={student ? <Link href={attemptsHref(1, '')} className={btnGhost}>Ver todos</Link> : undefined} />
        {attempts.length ? (
          <Table label="Intentos por alumno" head={['Alumno', 'Clase', 'Fecha', 'Aciertos', 'Resultado']}>
            {attempts.slice(0, 50).map((attempt) => (
              <tr key={attempt.id}>
                <td className={cell}>{attempt.student || 'Alumno'}</td>
                <td className={cell}>{attempt.lesson}</td>
                <td className={cell}>{attemptDate.format(new Date(attempt.created_at))}</td>
                <td className={cell}>{attempt.correct}/{attempt.total}</td>
                <td className={cell}>{attempt.correct === attempt.total ? 'Aprobó' : 'Por aprobar'}</td>
              </tr>
            ))}
          </Table>
        ) : <Empty title="Todavía no hay intentos de cuestionarios." />}
        {page > 1 || attempts.length > 50 ? (
          <HStack as="nav" aria-label="Páginas de intentos" gap={3}>
            {page > 1 ? <Link className={btnGhost} href={attemptsHref(page - 1)}>Anterior</Link> : null}
            {attempts.length > 50 ? <Link className={btnGhost} href={attemptsHref(page + 1)}>Siguiente</Link> : null}
          </HStack>
        ) : null}
      </VStack>
    </VStack>
  );
}
