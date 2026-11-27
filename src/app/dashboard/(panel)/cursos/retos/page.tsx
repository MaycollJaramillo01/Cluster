import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { deleteChallenge, saveChallenge } from '@/lib/crm/lms-actions';
import { listCourses } from '@/lib/crm/lms';
import { formatDate } from '@/lib/crm/format';
import { CHALLENGE_KINDS, listChallenges, type Challenge } from '@/lib/valux/challenges';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Empty, Field, Notice, PageTitle, Pill, SectionTitle, btnSmall, fieldClass } from '@/components/dashboard/StaffUi';

function day(value: string | null) {
  return value ? new Date(value).toLocaleDateString('en-CA', { timeZone: 'America/Tegucigalpa' }) : '';
}

export default async function RetosPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  const [challenges, courses] = await Promise.all([listChallenges(), listCourses()]);

  const form = (item?: Challenge) => (
    <form action={saveChallenge} className="grid gap-5 md:grid-cols-3">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <Field label="Título"><input className={fieldClass} name="title" required defaultValue={item?.title} /></Field>
      <Field label="Tipo">
        <select className={fieldClass} name="kind" defaultValue={item?.kind || 'xp'}>
          {CHALLENGE_KINDS.map((kind) => <option key={kind.id} value={kind.id}>{kind.label}</option>)}
        </select>
      </Field>
      <Field label="Meta (XP o misiones)"><input className={fieldClass} name="target" type="number" min="1" defaultValue={item?.target || ''} /></Field>
      <Field label="Curso" hint="Obligatorio si el reto es terminar un curso.">
        <select className={fieldClass} name="course_id" defaultValue={item?.course_id || ''}>
          <option value="">Cualquier curso</option>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
      </Field>
      <Field label="XP de bonificación"><input className={fieldClass} name="bonus_xp" type="number" min="0" defaultValue={item?.bonus_xp ?? 50} /></Field>
      <Field label="Cierra el (opcional)"><input className={fieldClass} name="ends_at" type="date" defaultValue={day(item?.ends_at ?? null)} /></Field>
      <Field label="Descripción" className="md:col-span-3"><input className={fieldClass} name="description" defaultValue={item?.description} /></Field>
      <HStack gap={4} align="center" wrap="wrap" className="md:col-span-3">
        {item ? (
          <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
            <input name="active" type="checkbox" value="1" defaultChecked={item.active} className="size-4" /> Activo
          </label>
        ) : null}
        <AcademySubmit label={item ? 'Guardar reto' : 'Crear reto'} pending="Guardando…" />
      </HStack>
    </form>
  );

  return (
    <VStack gap={8} className="mx-auto w-full max-w-6xl">
      <PageTitle
        eyebrow="Contenido"
        title="Retos"
        description="Un reto pide una meta medible: juntar XP de misiones, aprobar cierta cantidad de misiones o terminar un curso. XP y misiones cuentan desde que se crea el reto. Quien lo cumple reclama el bono una sola vez desde la academia."
      />
      {query.error === 'datos' ? <Notice tone="error">Falta el título, la meta o el curso del reto.</Notice> : null}

      <VStack as="section" gap={5} aria-labelledby="reto-nuevo" className="academy-panel p-5 sm:p-6">
        <SectionTitle id="reto-nuevo" title="Nuevo reto" />
        {form()}
      </VStack>

      <VStack as="section" gap={4} aria-labelledby="retos-lista">
        <SectionTitle id="retos-lista" title="Retos creados" />
        {challenges.length === 0 ? <Empty title="Todavía no hay retos." /> : (
          <ul className="academy-panel divide-y divide-academy-line overflow-hidden">
            {challenges.map((item) => (
              <li key={item.id}>
                <details>
                  <summary className="academy-focus flex min-h-14 cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-academy-page sm:px-5">
                    <VStack gap={0} className="min-w-0">
                      <strong className="break-words font-semibold">{item.title}</strong>
                      <small className="text-sm text-academy-muted">{CHALLENGE_KINDS.find((kind) => kind.id === item.kind)?.label || item.kind} · meta {item.target} · +{item.bonus_xp} XP{item.course_title ? ` · ${item.course_title}` : ''}{item.ends_at ? ` · cierra el ${formatDate(item.ends_at)}` : ''}</small>
                    </VStack>
                    <HStack gap={3} align="center">
                      <Pill tone={item.active ? 'ok' : 'off'}>{item.active ? 'Activo' : 'Inactivo'}</Pill>
                      <small className="text-sm font-semibold text-academy-primary">Editar</small>
                    </HStack>
                  </summary>
                  <VStack gap={5} className="border-t border-academy-line bg-academy-page p-4 sm:p-5">
                    {form(item)}
                    <form action={deleteChallenge} className="border-t border-academy-line pt-4">
                      <input type="hidden" name="id" value={item.id} />
                      <button className={`${btnSmall} text-red-800`} type="submit">Eliminar «{item.title}»</button>
                    </form>
                  </VStack>
                </details>
              </li>
            ))}
          </ul>
        )}
      </VStack>
    </VStack>
  );
}
