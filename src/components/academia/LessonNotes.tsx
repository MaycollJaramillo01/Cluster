'use client';

import { useActionState, useState } from 'react';
import { saveLessonNote } from '@/lib/valux/lesson-note-actions';
import type { LessonNote, NoteFeedback } from '@/lib/valux/lesson-notes';

export function LessonNotes({ lessonId, note }: { lessonId: string; note: LessonNote | null }) {
  const [body, setBody] = useState(note?.body ?? '');
  const initial: NoteFeedback = { status: 'idle', message: '', version: note?.version ?? '' };
  const [state, action, pending] = useActionState(saveLessonNote, initial);
  return (
    <section id="mis-notas" aria-labelledby="titulo-notas" className="scroll-mt-24 space-y-4 border border-black/10 bg-white p-5 sm:p-6">
      <header className="space-y-1">
        <h2 id="titulo-notas" className="text-lg font-semibold">Mis notas</h2>
        <p className="text-sm text-ink/70">Solo tú puedes leer esta nota. Se guarda con tu cuenta.</p>
      </header>
      <form action={action} className="space-y-3">
        <input type="hidden" name="lesson_id" value={lessonId} />
        <input type="hidden" name="version" value={state.version} />
        <label htmlFor="nota-clase" className="block text-sm font-medium">Nota de esta clase</label>
        <textarea id="nota-clase" name="body" aria-describedby="nota-ayuda" value={body} onChange={(event) => setBody(event.target.value)} disabled={pending} maxLength={6000} rows={5}
          className="block w-full resize-y border border-black/20 bg-paper px-3 py-2 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" />
        <p id="nota-ayuda" className="text-sm text-ink/65">Para eliminar la nota, deja el campo vacío y guarda.</p>
        <section className="flex flex-wrap items-center gap-3" aria-label="Guardar la nota">
          <button type="submit" disabled={pending || (!body.trim() && !state.version)} className="min-h-11 border border-ink px-4 text-sm font-semibold hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50">
            {pending ? 'Guardando…' : 'Guardar nota'}
          </button>
          <p role={state.status === 'error' ? 'alert' : 'status'} className={`text-sm ${state.status === 'error' ? 'text-red-800' : 'text-ink/75'}`}>{state.message}</p>
        </section>
      </form>
    </section>
  );
}
