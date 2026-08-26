'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { DualCtas } from './DualCtas';

export type MinimalLeadMeta = {
  vertical: string;
  country: string;
  landingPath: string;
};

type UtmCapture = {
  captureUtms: () => void;
  getStoredUtms: () => Record<string, string | undefined>;
  trackEvent: (name: string, payload?: Record<string, unknown>) => void;
  getCalculatorSnapshot?: () => Record<string, unknown> | null;
};

type Props = {
  meta: MinimalLeadMeta;
  whatsappMessage: string;
  tracking: UtmCapture;
  graciasPath: string;
};

const inputClass =
  'w-full border border-line bg-surface px-4 py-3 text-[15px] text-fg placeholder:text-faint transition-colors focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]';

/**
 * Formulario mínimo opcional.
 * CTAs principales (WhatsApp / agenda) están siempre visibles y no dependen del form.
 */
export function MinimalContactForm({
  meta,
  whatsappMessage,
  tracking,
  graciasPath,
}: Props) {
  const [state, setState] = useState<'idle' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    tracking.captureUtms();
  }, [tracking]);

  function onFirstInteract() {
    if (started) return;
    setStarted(true);
    tracking.trackEvent('FormStart', {
      vertical: meta.vertical,
      country: meta.country,
    });
  }

  function buildContext() {
    const utms = tracking.getStoredUtms();
    const calc = tracking.getCalculatorSnapshot?.() ?? null;
    const landing =
      typeof window !== 'undefined' ? window.location.pathname : meta.landingPath;
    return {
      vertical: meta.vertical,
      country: meta.country,
      landing,
      source: typeof window !== 'undefined' ? document.referrer || 'direct' : '',
      ...utms,
      ...(calc ? { calculator: calc } : {}),
    };
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const nombre = String(data.get('nombre') || '').trim();
    const empresa = String(data.get('empresa') || '').trim();
    const whatsapp = String(data.get('whatsapp') || '').trim();
    const email = String(data.get('email') || '').trim();
    const web = String(data.get('web') || '').trim();

    if (!nombre || !empresa || !whatsapp || !email) {
      setState('error');
      setErrorMsg('Completa nombre, empresa, WhatsApp y email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState('error');
      setErrorMsg('Ingresa un email válido.');
      return;
    }

    const context = buildContext();
    const payload = { nombre, empresa, whatsapp, email, web, ...context };

    try {
      sessionStorage.setItem(
        `cm_lead_${meta.vertical}`,
        JSON.stringify({ ...payload, at: new Date().toISOString() })
      );
    } catch {
      /* ignore */
    }

    tracking.trackEvent('Lead', {
      vertical: meta.vertical,
      country: meta.country,
      landing: meta.landingPath,
    });

    setState('success');
    window.setTimeout(() => {
      window.location.href = `${graciasPath}?pais=${meta.country}`;
    }, 500);
  }

  if (state === 'success') {
    return (
      <div className="border border-line bg-surface p-8 text-center sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center bg-accent text-accent-fg">
          <Icon name="check" size={28} strokeWidth={2.5} />
        </span>
        <h3 className="mt-5 font-display text-2xl text-fg">Datos recibidos</h3>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-muted">
          También puedes escribirnos o agendar ahora mismo.
        </p>
        <DualCtas
          className="mt-6 justify-center"
          whatsappMessage={whatsappMessage}
          onWhatsApp={() =>
            tracking.trackEvent('WhatsAppClick', {
              vertical: meta.vertical,
              country: meta.country,
              source: 'form_success',
            })
          }
          onSchedule={() =>
            tracking.trackEvent('ScheduleStart', {
              vertical: meta.vertical,
              country: meta.country,
              source: 'form_success',
            })
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="mono-label text-accent">Habla con el equipo</p>
        <p className="mt-3 max-w-xl text-[15px] text-muted">
          WhatsApp o llamada, sin cuestionario previo. La conversación comercial
          empieza ahí.
        </p>
        <DualCtas
          className="mt-6"
          whatsappMessage={whatsappMessage}
          onWhatsApp={() =>
            tracking.trackEvent('WhatsAppClick', {
              ...buildContext(),
              source: 'contact_section',
            })
          }
          onSchedule={() =>
            tracking.trackEvent('ScheduleStart', {
              ...buildContext(),
              source: 'contact_section',
            })
          }
        />
      </div>

      <div className="border-t border-line pt-8">
        <p className="text-sm text-muted">
          O déjanos tus datos y te contactamos:
        </p>
        <form
          onSubmit={handleSubmit}
          onFocus={onFirstInteract}
          className="mt-5 grid gap-4 sm:grid-cols-2"
          noValidate
        >
          {state === 'error' && (
            <div
              role="alert"
              className="border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-fg sm:col-span-2"
            >
              {errorMsg}
            </div>
          )}
          <Field label="Nombre" name="nombre" required placeholder="Tu nombre" />
          <Field label="Empresa" name="empresa" required placeholder="Nombre de la empresa" />
          <Field
            label="WhatsApp / teléfono"
            name="whatsapp"
            type="tel"
            required
            placeholder="+…"
          />
          <Field
            label="Email"
            name="email"
            type="email"
            required
            placeholder="tu@empresa.com"
          />
          <Field
            label="Website o Instagram (opcional)"
            name="web"
            placeholder="web.com o @marca"
            className="sm:col-span-2"
          />
          <div className="sm:col-span-2">
            <Button type="submit" variant="secondary" size="md">
              Enviar datos
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  placeholder,
  className = '',
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm text-muted" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className={inputClass}
        autoComplete="on"
      />
    </div>
  );
}
