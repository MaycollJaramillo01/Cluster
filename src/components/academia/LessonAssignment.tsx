import Link from 'next/link';
import { VStack } from '@astryxdesign/core/VStack';
import { submitAssignment } from '@/lib/valux/assignment-actions';
import { getAssignmentSubmission } from '@/lib/valux/assignments';
import { AcademySubmit } from './AcademySubmit';
import { LessonText } from './ui';

const statusLabel = { pendiente: 'Entrega en revisión', cambios: 'Tu profesor pidió cambios', aprobada: 'Tarea aprobada' };

export async function LessonAssignment({ lessonId, personId, instructions, done, error, points }: {
  lessonId: string; personId: string; instructions: string; done: boolean; error: boolean; points: number;
}) {
  const submission = await getAssignmentSubmission(lessonId, personId);
  const ready = !done && (!submission || submission.status === 'cambios');
  return (
    <section id="mision" className="academy-panel scroll-mt-24 p-5 sm:p-6">
      <VStack gap={4}>
        <header>
          <h2 className="text-lg font-semibold">Tarea</h2>
          <p className="text-sm text-black/65">Con revisión del profesor · {points} XP</p>
        </header>
        <LessonText text={instructions} />
        {submission ? (
          <section className="space-y-2 border-t border-black/10 pt-4">
            <p role="status" className="academy-notice font-medium">{statusLabel[submission.status]}</p>
            {submission.feedback ? <p className="whitespace-pre-wrap break-words text-sm">{submission.feedback}</p> : null}
            {submission.status !== 'cambios' ? <details className="text-sm">
              <summary className="cursor-pointer">Ver mi entrega</summary>
              <p className="mt-2 whitespace-pre-wrap break-words">{submission.response}</p>
            </details> : null}
          </section>
        ) : null}
        {!personId ? <p className="text-sm"><Link className="underline" href="/academia/entrar">Entra</Link> para entregar tu tarea.</p> : null}
        {personId && ready ? (
          <form action={submitAssignment} className="space-y-3">
            <input type="hidden" name="lesson_id" value={lessonId} />
            <input type="hidden" name="attempt" value={submission?.attempt ?? 0} />
            <label className="block space-y-2 text-sm font-medium">
              Tu respuesta
              <textarea name="response" defaultValue={submission?.response} required maxLength={12000} rows={6} className="academy-field block w-full" />
            </label>
            {error ? <p role="alert" className="text-sm text-red-800">Escribe una respuesta de hasta 12000 caracteres.</p> : null}
            <AcademySubmit pending="Enviando…" label={submission ? 'Reenviar para revisión' : 'Entregar tarea'} />
          </form>
        ) : null}
      </VStack>
    </section>
  );
}
