'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { MISSION_LABELS, parseMission } from '@/lib/valux/mission';
import { btnGhost, btnSmall, fieldClass as field, labelClass as label } from './StaffUi';

type Question = { prompt: string; options: string[]; answer: number };
type Mode = 'none' | 'checklist' | 'quiz' | 'assignment' | 'legacy';
const blankQuestion = (): Question => ({ prompt: '', options: ['', ''], answer: 0 });

export function LessonActivityEditor({ value }: { value: string }) {
  const [initial] = useState(() => parseMission(value));
  const [mode, setMode] = useState<Mode>(initial.mission?.kind || (initial.errors.length ? 'legacy' : 'none'));
  const [tasks, setTasks] = useState(initial.mission?.kind === 'checklist' ? initial.mission.items.join('\n') : '');
  const [questions, setQuestions] = useState(initial.mission?.kind === 'quiz' ? initial.mission.questions : [blankQuestion()]);
  const [instructions, setInstructions] = useState(initial.mission?.kind === 'assignment' ? initial.mission.instructions : '');
  const root = useRef<HTMLElement>(null);

  // Si el servidor rechaza el guardado, KeepFormData devuelve la actividad enviada y aquí se vuelve a abrir.
  // Layout effect: el oyente debe existir antes del siguiente cuadro, cuando KeepFormData restaura.
  useLayoutEffect(() => {
    const section = root.current;
    const restore = (event: Event) => {
      const { mission: sent, errors } = parseMission((event as CustomEvent<string>).detail);
      if (errors.length) return;
      setMode(sent?.kind || 'none');
      if (sent?.kind === 'checklist') setTasks(sent.items.join('\n'));
      if (sent?.kind === 'quiz') setQuestions(sent.questions);
      if (sent?.kind === 'assignment') setInstructions(sent.instructions);
    };
    section?.addEventListener('keep:restore', restore);
    return () => section?.removeEventListener('keep:restore', restore);
  }, []);

  const mission = mode === 'checklist'
    ? tasks.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => `[ ] ${line}`).join('\n')
    : mode === 'quiz'
      ? questions.map(({ prompt, options, answer }) => [prompt.trim(), ...options.map((option, index) => `${index === answer ? '*' : '-'} ${option.trim()}`)].join('\n')).join('\n\n')
      : mode === 'assignment' ? `[tarea]\n${instructions.trim()}` : '';

  function updateQuestion(index: number, field: Partial<Question>) {
    setQuestions((items) => items.map((question, i) => i === index ? { ...question, ...field } : question));
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    const question = questions[questionIndex];
    const options = question.options.filter((_, i) => i !== optionIndex);
    const answer = question.answer === optionIndex ? 0 : question.answer - Number(question.answer > optionIndex);
    updateQuestion(questionIndex, { options, answer });
  }

  return (
    <section ref={root} className="space-y-4">
      <label className={label}>Tipo de actividad
        <select className={field} value={mode} onChange={(event) => setMode(event.target.value as Mode)}>
          <option value="none">Sin actividad</option>
          <option value="checklist">{MISSION_LABELS.checklist}</option>
          <option value="quiz">{MISSION_LABELS.quiz}</option>
          <option value="assignment">{MISSION_LABELS.assignment}</option>
          {initial.errors.length ? <option value="legacy">Corregir actividad anterior</option> : null}
        </select>
      </label>
      {mode !== 'legacy' ? <input type="hidden" name="mission" value={mission} data-keep /> : (
        <label className={label}>Texto de la actividad anterior
          <textarea name="mission" defaultValue={value} rows={6} className={field} />
        </label>
      )}
      {mode === 'checklist' ? (
        <label className={label}>Pasos de la tarea, uno por línea
          <textarea className={field} rows={4} value={tasks} onChange={(event) => setTasks(event.target.value)} required />
          <small className="block text-xs font-normal text-academy-muted">El alumno marca todos los pasos para completar la actividad.</small>
        </label>
      ) : null}
      {mode === 'assignment' ? (
        <label className={label}>Instrucciones de la tarea
          <textarea className={field} rows={5} value={instructions} onChange={(event) => setInstructions(event.target.value)} maxLength={6000} required />
          <small className="block text-xs font-normal text-academy-muted">Indica qué debe entregar el alumno. Podrás revisar su respuesta desde el panel.</small>
        </label>
      ) : null}
      {mode === 'quiz' ? (
        <>
          {questions.map((question, index) => (
            <fieldset key={index} className="space-y-4 rounded-academy border border-academy-line bg-academy-page p-4">
              <legend className="rounded-academy bg-academy-surface px-2 text-sm font-bold">Pregunta {index + 1}</legend>
              <label className={label}>Enunciado<input className={field} value={question.prompt} onChange={(event) => updateQuestion(index, { prompt: event.target.value })} pattern={'.*\\S.*'} required /></label>
              {question.options.map((option, optionIndex) => (
                <section key={optionIndex} className="flex flex-wrap items-end gap-2">
                  <label className={`${label} min-w-0 flex-1`}>Opción {optionIndex + 1}
                    <input className={field} value={option} onChange={(event) => updateQuestion(index, { options: question.options.map((entry, i) => i === optionIndex ? event.target.value : entry) })} pattern={'.*\\S.*'} required />
                  </label>
                  {question.options.length > 2 ? <button type="button" aria-label={`Quitar opción ${optionIndex + 1}`} className={btnSmall} onClick={() => removeOption(index, optionIndex)}>Quitar</button> : null}
                </section>
              ))}
              <label className={label}>Respuesta correcta
                <select className={field} value={question.answer} onChange={(event) => updateQuestion(index, { answer: Number(event.target.value) })}>
                  {question.options.map((_, i) => <option key={i} value={i}>Opción {i + 1}</option>)}
                </select>
              </label>
              <button type="button" className={btnSmall} onClick={() => updateQuestion(index, { options: [...question.options, ''] })}>Agregar opción</button>
              {questions.length > 1 ? <button type="button" className={`${btnSmall} ml-2 text-red-800`} onClick={() => setQuestions((items) => items.filter((_, i) => i !== index))}>Quitar pregunta</button> : null}
            </fieldset>
          ))}
          <button type="button" className={btnGhost} onClick={() => setQuestions((items) => [...items, blankQuestion()])}>Agregar pregunta</button>
        </>
      ) : null}
    </section>
  );
}
