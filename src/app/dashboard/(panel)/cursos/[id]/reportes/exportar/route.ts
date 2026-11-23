import { requireCourseEditor } from '@/lib/crm/course-access';
import { courseStudentProgress, getReportCourse, progressCsv } from '@/lib/crm/course-reports';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireCourseEditor(id);
  if (!await getReportCourse(id)) return new Response('Curso no disponible', { status: 404 });
  return new Response(progressCsv(await courseStudentProgress(id)), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="progreso-del-curso.csv"',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
