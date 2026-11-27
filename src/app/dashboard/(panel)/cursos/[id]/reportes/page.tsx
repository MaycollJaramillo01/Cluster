import { notFound } from 'next/navigation';
import { VStack } from '@astryxdesign/core/VStack';
import { requireCourseEditor } from '@/lib/crm/course-access';
import { courseLessonReports, getReportCourse } from '@/lib/crm/course-reports';
import { parseMission } from '@/lib/valux/mission';
import { Empty, PageTitle, SectionTitle, btn } from '@/components/dashboard/StaffUi';
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

export default async function CourseReports({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireCourseEditor(id);
  const course = await getReportCourse(id);
  if (!course) notFound();
  const lessons = await courseLessonReports(id);
  const quizzes = lessons.filter((lesson) => lesson.attempts || parseMission(lesson.mission ?? '').mission?.kind === 'quiz');
  const base = `/dashboard/cursos/${id}`;
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
    </VStack>
  );
}
