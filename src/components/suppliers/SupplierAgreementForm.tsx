'use client';

import { useState, type FormEvent } from 'react';

type Decision = 'si' | 'no';
type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

export function SupplierAgreementForm({ supplier }: { supplier?: string }) {
  const [decision, setDecision] = useState<Decision | ''>('');
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!decision || submissionState === 'submitting') return;

    setSubmissionState('submitting');

    try {
      const response = await fetch('/api/supplier-agreement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, supplier }),
      });

      const result = (await response.json()) as { ok?: boolean };
      if (!response.ok || !result.ok) throw new Error('submission_failed');

      setSubmissionState('success');
    } catch {
      setSubmissionState('error');
    }
  }

  if (submissionState === 'success') {
    return (
      <div
        className="border border-ink-900 bg-ink-900 px-6 py-8 text-paper sm:px-8"
        role="status"
      >
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Respuesta registrada
        </p>
        <h2 className="mt-4 text-3xl font-normal text-paper">
          Gracias por completar el acuerdo
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-paper/70">
          Tu respuesta fue enviada correctamente al equipo de Cluster Media.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-ink-900 bg-white p-6 sm:p-8">
      <fieldset>
        <legend className="text-3xl font-display font-normal uppercase leading-none text-ink-900 sm:text-4xl">
          Aceptación del acuerdo
        </legend>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-900/65">
          He leído y comprendo estos lineamientos y acepto trabajar bajo estas buenas
          prácticas cuando preste servicios para Cluster Media.
        </p>

        {supplier ? (
          <p className="mt-5 font-mono text-xs font-medium uppercase tracking-[0.12em] text-ink-900/55">
            Proveedor: {supplier}
          </p>
        ) : null}

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {([
            { value: 'si', label: 'Sí' },
            { value: 'no', label: 'No' },
          ] as const).map((option) => {
            const selected = decision === option.value;

            return (
              <label
                key={option.value}
                className={`flex min-h-16 cursor-pointer items-center gap-4 border px-5 py-4 text-lg font-semibold transition-colors ${
                  selected
                    ? 'border-ink-900 bg-ink-900 text-paper'
                    : 'border-ink-900/20 bg-paper text-ink-900 hover:border-ink-900/55'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value={option.value}
                  checked={selected}
                  onChange={() => {
                    setDecision(option.value);
                    setSubmissionState('idle');
                  }}
                  className="h-5 w-5 shrink-0 accent-[#02C39A]"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={!decision || submissionState === 'submitting'}
        className={`mt-5 inline-flex min-h-14 w-full items-center justify-center px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink-900 ${
          decision && submissionState !== 'submitting'
            ? 'bg-accent text-accent-fg hover:-translate-y-0.5 active:translate-y-0'
            : 'cursor-not-allowed bg-ink-900/10 text-ink-900/50'
        }`}
      >
        {submissionState === 'submitting' ? 'Enviando respuesta' : 'Aceptar'}
      </button>

      {submissionState === 'error' ? (
        <p
          className="mt-4 border-l-2 border-red-700 pl-4 text-sm leading-relaxed text-red-800"
          role="alert"
        >
          No pudimos registrar tu respuesta. Por favor, inténtalo nuevamente.
        </p>
      ) : null}
    </form>
  );
}
