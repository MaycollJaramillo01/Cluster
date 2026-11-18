import { deleteChallenge, saveChallenge } from '@/lib/crm/lms-actions';
import { listCourses } from '@/lib/crm/lms';
import { CHALLENGE_KINDS, listChallenges, type Challenge } from '@/lib/valux/challenges';
import { Field, PageTitle, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

function day(value: string | null) {
  return value ? new Date(value).toLocaleDateString('en-CA', { timeZone: 'America/Tegucigalpa' }) : '';
}

export default async function RetosPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  const [challenges, courses] = await Promise.all([listChallenges(), listCourses()]);

  const form = (item?: Challenge) => (
    <form action={saveChallenge} className="grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-3">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <Field label="Título"><input className={fieldClass} name="title" required defaultValue={item?.title} /></Field>
      <Field label="Tipo">
        <select className={fieldClass} name="kind" defaultValue={item?.kind || 'xp'}>
          {CHALLENGE_KINDS.map((kind) => <option key={kind.id} value={kind.id}>{kind.label}</option>)}
        </select>
      </Field>
      <Field label="Meta (XP o misiones)"><input className={fieldClass} name="target" type="number" min="1" defaultValue={item?.target || ''} /></Field>
      <Field label="Curso (obligatorio si es terminar un curso)">
        <select className={fieldClass} name="course_id" defaultValue={item?.course_id || ''}>
          <option value="">Cualquier curso</option>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
      </Field>
      <Field label="XP de bonificación"><input className={fieldClass} name="bonus_xp" type="number" min="0" defaultValue={item?.bonus_xp ?? 50} /></Field>
      <Field label="Cierra el (opcional)"><input className={fieldClass} name="ends_at" type="date" defaultValue={day(item?.ends_at ?? null)} /></Field>
      <div className="md:col-span-2"><Field label="Descripción"><input className={fieldClass} name="description" defaultValue={item?.description} /></Field></div>
      <div className="flex items-end gap-3">
        {item ? (
          <label className="flex items-center gap-2 text-sm">
            <input name="active" type="checkbox" value="1" defaultChecked={item.active} /> Activo
          </label>
        ) : null}
        <button className={btn} type="submit">{item ? 'Guardar' : 'Crear reto'}</button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <PageTitle title="Retos" />
      <p className="max-w-2xl text-sm text-black/60">
        Un reto pide una meta medible: juntar XP de misiones, aprobar cierta cantidad de misiones o terminar un curso.
        XP y misiones cuentan desde que se crea el reto. Quien lo cumple reclama el bono una sola vez desde la academia.
      </p>
      {query.error === 'datos' ? <p className="text-sm text-red-700">Falta el título, la meta o el curso del reto.</p> : null}
      {form()}
      <div className="space-y-4">
        {challenges.map((item) => (
          <div key={item.id} className="space-y-2">
            {form(item)}
            <form action={deleteChallenge}>
              <input type="hidden" name="id" value={item.id} />
              <button className={btnTiny} type="submit">Eliminar «{item.title}»</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
