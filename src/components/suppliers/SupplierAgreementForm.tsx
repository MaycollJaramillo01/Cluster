'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';

type Decision = 'si' | 'no';
type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

const fields = [
  {
    name: 'fullName',
    label: 'Nombre completo',
    type: 'text',
    autoComplete: 'name',
    placeholder: 'Nombre y apellidos',
    minLength: 3,
    maxLength: 120,
  },
  {
    name: 'idNumber',
    label: 'Número de identidad',
    type: 'text',
    autoComplete: 'off',
    placeholder: 'DNI, cédula o pasaporte',
    minLength: 5,
    maxLength: 40,
  },
  {
    name: 'email',
    label: 'Correo electrónico',
    type: 'email',
    autoComplete: 'email',
    placeholder: 'nombre@correo.com',
    maxLength: 254,
  },
  {
    name: 'phone',
    label: 'Teléfono',
    type: 'tel',
    autoComplete: 'tel',
    placeholder: '+504 0000-0000',
    minLength: 7,
    maxLength: 25,
  },
] as const;

const eyebrowClass = 'font-mono text-xs font-semibold uppercase tracking-[0.18em]';
const headingClass =
  'text-3xl font-display font-normal uppercase leading-none text-ink-900 sm:text-4xl';
const errorClass = 'mt-4 border-l-2 border-red-700 pl-4 text-sm leading-relaxed text-red-800';
const linkClass =
  'mt-5 inline-block text-sm font-bold uppercase tracking-[0.12em] text-accent underline-offset-4 hover:underline';

function buttonClass(enabled: boolean) {
  return `inline-flex min-h-14 w-full items-center justify-center px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink-900 ${
    enabled
      ? 'bg-accent text-accent-fg hover:-translate-y-0.5 active:translate-y-0'
      : 'cursor-not-allowed bg-ink-900/10 text-ink-900/50'
  }`;
}

function Notice({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border border-ink-900 bg-ink-900 px-6 py-8 text-paper sm:px-8" role="status">
      <p className={`${eyebrowClass} text-accent`}>{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-normal text-paper">{title}</h2>
      <div className="mt-4 max-w-xl text-base leading-relaxed text-paper/70">{children}</div>
    </div>
  );
}

export function SupplierAgreementForm({
  supplier,
  statement,
}: {
  supplier?: string;
  statement: string;
}) {
  const [decision, setDecision] = useState<Decision | ''>('');
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [email, setEmail] = useState('');
  const sent = submissionState === 'success';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!decision || submissionState === 'submitting') return;

    const data = Object.fromEntries(new FormData(event.currentTarget));
    setSubmissionState('submitting');

    try {
      const response = await fetch('/api/supplier-agreement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, supplier }),
      });

      const result = (await response.json()) as { ok?: boolean };
      if (!response.ok || !result.ok) throw new Error('submission_failed');

      setEmail(String(data.email));
      setSubmissionState('success');
    } catch {
      setSubmissionState('error');
    }
  }

  return (
    <>
      {sent ? (
        <Notice eyebrow="Falta un paso" title="Revisa tu correo">
          <p>
            Enviamos un enlace de confirmación a{' '}
            <strong className="break-words font-semibold text-paper">{email}</strong>. Tu respuesta
            quedará registrada cuando abras ese enlace. Si no lo ves en unos minutos, revisa la
            carpeta de spam.
          </p>
          <button type="button" onClick={() => setSubmissionState('idle')} className={linkClass}>
            Corregir mis datos
          </button>
        </Notice>
      ) : null}

      {/* Oculto, no desmontado: al corregir, los datos escritos siguen ahí. */}
      <form
        onSubmit={handleSubmit}
        hidden={sent}
        className="border border-ink-900 bg-white p-6 sm:p-8"
      >
        <fieldset>
          <legend className={headingClass}>Aceptación del acuerdo</legend>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-900/65">{statement}</p>

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

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {fields.map(({ label, ...input }) => (
            <label key={input.name} className="block">
              <span className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-ink-900/65">
                {label}
              </span>
              <input
                {...input}
                required
                className="mt-2 w-full border border-ink-900/20 bg-paper px-4 py-3 text-base text-ink-900 transition-colors placeholder:text-ink-900/40 hover:border-ink-900/55 focus:border-ink-900 focus:outline-none focus:ring-1 focus:ring-ink-900"
              />
            </label>
          ))}
        </div>

        <p className="mt-5 text-sm leading-relaxed text-ink-900/65">
          Te enviaremos un correo para confirmar tu respuesta. Como constancia registramos estos
          datos junto con la fecha, la hora, tu dirección IP y tu navegador.
        </p>

        <button
          type="submit"
          disabled={!decision || submissionState === 'submitting'}
          className={`mt-5 ${buttonClass(Boolean(decision) && submissionState !== 'submitting')}`}
        >
          {submissionState === 'submitting' ? 'Enviando respuesta' : 'Aceptar'}
        </button>

        {submissionState === 'error' ? (
          <p className={errorClass} role="alert">
            No pudimos enviar el correo de confirmación. Revisa tus datos e inténtalo nuevamente.
          </p>
        ) : null}
      </form>
    </>
  );
}

export function SupplierAgreementConfirm({
  token,
  response,
}: {
  token: string;
  response: {
    fullName: string;
    idNumber: string;
    email: string;
    phone: string;
    decision: Decision;
  } | null;
}) {
  // Con un enlace válido arranca en "confirmando": el botón no llega a verse
  // antes de que el efecto confirme.
  const [submissionState, setSubmissionState] = useState<SubmissionState>(
    response ? 'submitting' : 'idle',
  );
  const started = useRef(false);
  const confirming = submissionState === 'submitting';

  async function handleConfirm() {
    setSubmissionState('submitting');

    try {
      const result = await fetch('/api/supplier-agreement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const body = (await result.json()) as { ok?: boolean };
      if (!result.ok || !body.ok) throw new Error('confirmation_failed');

      window.location.replace('/acuerdo-proveedores/gracias');
    } catch {
      setSubmissionState('error');
    }
  }

  useEffect(() => {
    if (!response || started.current) return;
    started.current = true;

    // Abrir el enlace del correo confirma la respuesta. Hace falta un navegador
    // real con la página a la vista: los filtros de correo que solo descargan
    // o precargan la página no confirman.
    // ponytail: un filtro que ejecute la página como un navegador normal sí
    // confirmaría; la constancia guarda IP y navegador para distinguirlo.
    if (navigator.webdriver) {
      setSubmissionState('idle');
      return;
    }

    // Si la pestaña se abrió en segundo plano, confirma cuando la persona la mire.
    const confirmWhenVisible = () => {
      if (document.visibilityState !== 'visible') return;
      document.removeEventListener('visibilitychange', confirmWhenVisible);
      void handleConfirm();
    };
    document.addEventListener('visibilitychange', confirmWhenVisible);
    confirmWhenVisible();
  }, []);

  if (!response) {
    return (
      <Notice eyebrow="Enlace no válido" title="Este enlace venció o ya no es válido">
        <p>
          Completa nuevamente el formulario al final de esta página y te enviaremos un enlace
          nuevo.
        </p>
        <a href="#aceptacion" className={linkClass}>
          Ir al formulario
        </a>
      </Notice>
    );
  }

  return (
    <div className="border border-ink-900 bg-white p-6 sm:p-8">
      <p className={`${eyebrowClass} text-ink-900/55`}>Último paso</p>
      <h2 className={`mt-4 ${headingClass}`}>
        {confirming ? 'Confirmando tu respuesta' : 'Confirma tu respuesta'}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-900/65">
        {confirming
          ? 'Un momento: estamos registrando tu respuesta.'
          : 'Revisa tus datos. Al confirmar, enviaremos una copia del acuerdo y de tu respuesta a tu correo y al equipo de Cluster Media.'}
      </p>

      <dl className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {[
          ['Nombre completo', response.fullName],
          ['Número de identidad', response.idNumber],
          ['Correo electrónico', response.email],
          ['Teléfono', response.phone],
          ['Respuesta', response.decision === 'si' ? 'Sí, acepto el acuerdo' : 'No acepto el acuerdo'],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-ink-900/65">
              {label}
            </dt>
            <dd className="mt-1 break-words text-lg font-semibold text-ink-900">{value}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={confirming}
        className={`mt-7 ${buttonClass(!confirming)}`}
      >
        {confirming ? 'Confirmando' : 'Confirmar'}
      </button>

      {submissionState === 'error' ? (
        <p className={errorClass} role="alert">
          No pudimos confirmar tu respuesta. Inténtalo nuevamente; si el problema continúa, vuelve
          a completar el formulario.
        </p>
      ) : null}
    </div>
  );
}
