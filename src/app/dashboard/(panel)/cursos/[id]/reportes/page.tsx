import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { requireCourseEditor } from '@/lib/crm/course-access';
import { courseLessonReports, getReportCourse } from '@/lib/crm/course-reports';
import { parseMission } from '@/lib/valux/mission';

function ReportValue({ label, value }: { label: string; value: string | number }) {
  return (
    <td role="cell" className="px-3 pb-3 tabular-nums sm:p-3">
      <small className="block text-xs text-black/70 sm:hidden">{label}</small>
      <span>{value}</span>
    </td>
  );
}

export default async function CourseReports({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireCourseEditor(id);
  const course = await getReportCourse(id);
  if (!course) notFound();
  const lessons = await courseLessonReports(id);
  const quizzes = lessons.filter((lesson) => lesson.attempts || parseMission(lesson.mission ?? '').mission?.kind === 'quiz');
  const base = `/dashboard/cursos/${id}`;
  return (
    <VStack as="section" aria-labelledby="curso-reportes" gap={6} className="mx-auto w-full max-w-5xl [color-scheme:light]">
      <Link href={base} className="text-sm font-medium underline">← {course.title}</Link>
      <Heading id="curso-reportes" level={1} className="font-brand text-3xl font-semibold">Reportes del curso</Heading>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Progreso de alumnos inscritos</h2>
        <a href={`${base}/reportes/exportar`} download className="inline-flex min-h-11 items-center bg-brand px-4 text-sm font-semibold text-ink">Descargar progreso en CSV</a>
      </section>
      <section className="space-y-3">
        <h2 id="retencion" className="text-xl font-semibold">Abandono por clase</h2>
        <p className="text-sm text-black/70">Se cuenta a quien abrió una clase hace 7 días o más y todavía no la completó.</p>
        <section tabIndex={0} aria-labelledby="retencion" className="overflow-x-auto border border-black/10 bg-white">
          <table role="table" className="block w-full text-left text-sm sm:table">
            <thead className="hidden bg-paper sm:table-header-group"><tr><th scope="col" className="p-3">Clase</th><th scope="col" className="p-3">Iniciaron</th><th scope="col" className="p-3">Completaron</th><th scope="col" className="p-3">Abandono</th></tr></thead>
            <tbody role="rowgroup" className="block divide-y divide-black/10 sm:table-row-group">{lessons.map((lesson) => <tr role="row" key={lesson.id} className="grid grid-cols-3 sm:table-row">
              <th scope="row" role="rowheader" className="col-span-full p-3 font-medium">{lesson.title}{lesson.section ? <small className="block font-normal text-black/70">{lesson.section}</small> : null}</th>
              <ReportValue label="Iniciaron" value={lesson.started} />
              <ReportValue label="Completaron" value={lesson.finished} />
              <ReportValue label="Abandono" value={lesson.stalled} />
            </tr>)}</tbody>
          </table>
          {!lessons.length ? <p className="p-3 text-sm">El curso todavía no tiene clases.</p> : null}
        </section>
      </section>
      <section className="space-y-3">
        <h2 id="quizzes" className="text-xl font-semibold">Resultados de cuestionarios</h2>
        {quizzes.length ? <section tabIndex={0} aria-labelledby="quizzes" className="overflow-x-auto border border-black/10 bg-white">
          <table role="table" className="block w-full text-left text-sm sm:table">
            <thead className="hidden bg-paper sm:table-header-group"><tr><th scope="col" className="p-3">Clase</th><th scope="col" className="p-3">Intentos</th><th scope="col" className="p-3">Participantes</th><th scope="col" className="p-3">Aprobaron</th><th scope="col" className="p-3">Promedio</th></tr></thead>
            <tbody role="rowgroup" className="block divide-y divide-black/10 sm:table-row-group">{quizzes.map((lesson) => <tr role="row" key={lesson.id} className="grid grid-cols-2 sm:table-row">
              <th scope="row" role="rowheader" className="col-span-full p-3 font-medium">{lesson.title}</th>
              <ReportValue label="Intentos" value={lesson.attempts} />
              <ReportValue label="Participantes" value={lesson.participants} />
              <ReportValue label="Aprobaron" value={lesson.passed} />
              <ReportValue label="Promedio" value={lesson.average == null ? '—' : `${lesson.average}%`} />
            </tr>)}</tbody>
          </table>
        </section> : <p className="text-sm text-black/70">Todavía no hay cuestionarios.</p>}
      </section>
    </VStack>
  );
}
