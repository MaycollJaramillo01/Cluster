'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { DualCtas } from './DualCtas';
import {
  resolveQuiz,
  type QuizAnswers,
  type QuizQuestion,
} from '@/lib/landings/quiz';

type Props = {
  vertical: 'clinicas' | 'inmobiliarias';
  countryName: string;
  countryCode: string;
  questions: QuizQuestion[];
  nudge: string;
  onTrack?: (name: string, payload?: Record<string, unknown>) => void;
  onWhatsApp: (source: string, extraMessage?: string) => void;
  onSchedule: (source: string) => void;
  whatsappBase: string;
};

const empty: QuizAnswers = {
  pain: '',
  channel: '',
  stack: '',
  goal: '',
};

export function LandingNeedsQuiz({
  vertical,
  countryName,
  countryCode,
  questions,
  nudge,
  onTrack,
  onWhatsApp,
  onSchedule,
  whatsappBase,
}: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(empty);
  const [started, setStarted] = useState(false);

  const current = questions[step];
  const done = step >= questions.length;
  const result = done ? resolveQuiz(answers, vertical) : null;
  const waMsg = result
    ? `${whatsappBase} Completé el diagnóstico: ${result.waSummary} (${countryName})`
    : whatsappBase;

  function start() {
    if (!started) {
      setStarted(true);
      onTrack?.('QuizStart', { vertical, country: countryCode });
    }
  }

  function pick(optionId: string) {
    start();
    const key = current.id;
    const nextAnswers = { ...answers, [key]: optionId };
    setAnswers(nextAnswers);
    onTrack?.('QuizStep', {
      vertical,
      country: countryCode,
      step: key,
      answer: optionId,
    });
    const nextStep = step + 1;
    setStep(nextStep);
    if (nextStep >= questions.length) {
      const resolved = resolveQuiz(nextAnswers, vertical);
      onTrack?.('QuizComplete', {
        vertical,
        country: countryCode,
        ...nextAnswers,
        services: resolved.services.map((s) => s.id).join(','),
      });
    }
  }

  function restart() {
    setStep(0);
    setAnswers(empty);
  }

  return (
    <div id="diagnostico-quiz" className="mt-10 border border-line bg-ink-950/50 p-6 sm:p-8">
      <p className="mono-label text-accent">Diagnóstico rápido</p>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
        {nudge} Cuatro preguntas. Te decimos qué servicio de Cluster encaja y cómo
        te ayudamos.
      </p>

      {!done && (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-4">
            <p className="font-display text-xl text-fg sm:text-2xl">
              {current.title}
            </p>
            <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
              {step + 1} / {questions.length}
            </span>
          </div>
          <div
            className="mt-2 h-1 w-full bg-line"
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={questions.length}
          >
            <div
              className="h-full bg-accent transition-[width]"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            />
          </div>
          <div className="mt-5 grid gap-2">
            {current.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => pick(option.id)}
                className="border border-line bg-surface px-4 py-3.5 text-left text-[15px] text-fg transition hover:border-accent hover:bg-surface-2"
              >
                {option.label}
              </button>
            ))}
          </div>
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-faint hover:text-accent"
            >
              Pregunta anterior
            </button>
          )}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-6">
          <div>
            <p className="mono-label text-accent">Lo que necesitas</p>
            <h3 className="mt-2 font-display text-2xl leading-tight text-fg sm:text-3xl">
              {result.headline}
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              {result.diagnosis}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-fg">
              {result.help}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.services.map((service) => (
              <div
                key={service.id}
                className="flex h-full flex-col border border-line bg-surface p-5"
              >
                <p className="font-display text-lg text-fg">{service.name}</p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {service.why}
                </p>
                <Link
                  href={service.href}
                  className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-accent link-underline"
                >
                  Ver {service.name}
                </Link>
              </div>
            ))}
          </div>

          <DualCtas
            whatsappMessage={waMsg}
            onWhatsApp={() => onWhatsApp('quiz', waMsg)}
            onSchedule={() => onSchedule('quiz')}
          />

          <button
            type="button"
            onClick={restart}
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint hover:text-accent"
          >
            Volver a hacer el diagnóstico
          </button>
        </div>
      )}
    </div>
  );
}
