import { crm } from '@/lib/crm/db';
import { formatDate } from '@/lib/crm/format';
import { requireDashboard } from '@/lib/crm/session';
import { getPersonByEmail } from '@/lib/valux/data';
import { academyMoney as money } from '@/lib/valux/money';
import { PageTitle } from '@/components/dashboard/ui';

// Todo se filtra por la persona de la academia con el mismo correo: nunca ve cursos, alumnos ni ventas de otros.
export default async function ProfesorPage() {
  const session = await requireDashboard('profesor');
  const person = await getPersonByEmail(session.email);
  if (!person) {
    return (
      <div className="space-y-4">
        <PageTitle title="Mis cursos" />
        <p className="text-sm text-black/60">
          Tu correo ({session.email}) no está en Academia → Personas. Pide que te den de alta como profesor y te asignen tus cursos.
        </p>
      </div>
    );
  }
  const sql = await crm();
  const courses = (await sql`
    SELECT c.id, c.title, c.published,
      (SELECT count(*) FROM lms_lessons l WHERE l.course_id = c.id) AS lessons
    FROM lms_courses c WHERE c.teacher_id = ${person.id}
    ORDER BY c.created_at DESC
  `) as unknown as { id: string; title: string; published: boolean; lessons: number }[];
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
    <div className="space-y-8">
      <PageTitle title="Mis cursos" />
      <div className="grid gap-3 sm:grid-cols-3">
        <p className="border border-black/10 bg-white p-4"><span className="block font-display text-4xl">{courses.length}</span><span className="text-xs text-black/50">cursos</span></p>
        <p className="border border-black/10 bg-white p-4"><span className="block font-display text-4xl">{students.length}</span><span className="text-xs text-black/50">inscripciones</span></p>
        <p className="border border-black/10 bg-white p-4"><span className="block font-display text-4xl">{money(earned)}</span><span className="text-xs text-black/50">tu parte de las ventas (últimas 100)</span></p>
      </div>

      {courses.length === 0 ? <p className="text-sm text-black/60">Todavía no tienes cursos asignados.</p> : courses.map((course) => {
        const mine = students.filter((student) => student.course_id === course.id);
        const lessons = Number(course.lessons) || 0;
        return (
          <section key={course.id} className="space-y-2">
            <h2 className="text-xl font-medium">{course.title} <span className="text-sm font-normal text-black/45">· {course.published ? 'publicado' : 'borrador'} · {lessons} clases · {mine.length} alumnos</span></h2>
            {mine.length === 0 ? <p className="text-sm text-black/50">Sin alumnos todavía.</p> : (
              <table className="w-full border border-black/10 bg-white text-left text-sm">
                <thead><tr className="border-b border-black/10 text-xs text-black/50"><th className="px-4 py-2 font-medium">Alumno</th><th className="px-4 py-2 font-medium">Desde</th><th className="px-4 py-2 font-medium">Avance</th><th className="px-4 py-2 font-medium">XP</th></tr></thead>
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
            )}
          </section>
        );
      })}

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Ventas</h2>
        {sales.length === 0 ? <p className="text-sm text-black/50">Sin ventas todavía.</p> : (
          <table className="w-full border border-black/10 bg-white text-left text-sm">
            <thead><tr className="border-b border-black/10 text-xs text-black/50"><th className="px-4 py-2 font-medium">Fecha</th><th className="px-4 py-2 font-medium">Curso</th><th className="px-4 py-2 font-medium">Total</th><th className="px-4 py-2 font-medium">Tu parte</th></tr></thead>
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
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Liquidaciones</h2>
        {payouts.length === 0 ? <p className="text-sm text-black/50">Sin liquidaciones todavía.</p> : (
          <ul className="space-y-1 text-sm">
            {payouts.map((payout) => <li key={payout.period_ym}>{payout.period_ym}: {money(Number(payout.amount_cents))} · {payout.status}</li>)}
          </ul>
        )}
      </section>
    </div>
  );
}
