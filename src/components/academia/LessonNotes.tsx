'use client';

import { useActionState, useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { saveLessonNote } from '@/lib/valux/lesson-note-actions';
import type { LessonNote, NoteFeedback } from '@/lib/valux/lesson-notes';

export function LessonNotes({ lessonId, note }: { lessonId: string; note: LessonNote | null }) {
  const [body, setBody] = useState(note?.body ?? '');
  const initial: NoteFeedback = { status: 'idle', message: '', version: note?.version ?? '' };
  const [state, action, pending] = useActionState(saveLessonNote, initial);
  return (
    <section id="mis-notas" aria-labelledby="titulo-notas" className="academy-panel scroll-mt-24 space-y-4 p-5 sm:p-6">
      <header className="space-y-1">
        <Heading id="titulo-notas" level={2} className="text-lg font-bold">Mis notas</Heading>
        <p className="text-sm text-ink/70">Solo tú puedes leer esta nota. Se guarda con tu cuenta.</p>
      </header>
      <form action={action} className="space-y-3">
        <input type="hidden" name="lesson_id" value={lessonId} />
        <input type="hidden" name="version" value={state.version} />
        <label htmlFor="nota-clase" className="block text-sm font-medium">Nota de esta clase</label>
        <textarea id="nota-clase" name="body" aria-describedby="nota-ayuda" value={body} onChange={(event) => setBody(event.target.value)} disabled={pending} maxLength={6000} rows={5}
          className="academy-field block w-full resize-y" />
        <p id="nota-ayuda" className="text-sm text-ink/65">Para eliminar la nota, deja el campo vacío y guarda.</p>
        <section className="flex flex-wrap items-center gap-3" aria-label="Guardar la nota">
          <Button type="submit" isLoading={pending} isDisabled={!body.trim() && !state.version} label={pending ? 'Guardando…' : 'Guardar nota'} />
          <p role={state.status === 'error' ? 'alert' : 'status'} className={`text-sm ${state.status === 'error' ? 'text-red-800' : 'text-ink/75'}`}>{state.message}</p>
        </section>
      </form>
    </section>
  );
}
