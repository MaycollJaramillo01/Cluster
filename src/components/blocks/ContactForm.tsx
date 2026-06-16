'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { whatsappLink } from '@/lib/site';

const serviceOptions = [
  'Paquete Digital Inicial',
  'Branding',
  'Redes Sociales',
  'Google Ads',
  'IA / Automatizaciones',
  'Websites / SEO',
  'No estoy seguro',
];

const inputClass =
  'w-full rounded-xl bg-white/[0.06] px-4 py-3 text-[15px] text-paper placeholder:text-paper/35 transition-colors focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-brand/50';

export function ContactForm() {
  const [sent, setSent] = useState(false);

  // En producción, conectar a CRM/GoHighLevel o un endpoint /api/contact.
  // Aquí enviamos un resumen por WhatsApp como fallback funcional.
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const message =
      `Nuevo contacto desde el website:%0A` +
      `Nombre: ${data.get('nombre')}%0A` +
      `Empresa: ${data.get('empresa')}%0A` +
      `País/Ciudad: ${data.get('pais')} / ${data.get('ciudad')}%0A` +
      `Email: ${data.get('email')}%0A` +
      `Teléfono: ${data.get('telefono')}%0A` +
      `Servicio: ${data.get('servicio')}%0A` +
      `Mensaje: ${data.get('mensaje')}`;
    setSent(true);
    window.open(whatsappLink(decodeURIComponent(message)), '_blank');
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl bg-brand/15 p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white">
          <Icon name="check" size={28} strokeWidth={2.5} />
        </span>
        <h3 className="mt-5 font-display text-xl font-semibold text-paper">
          ¡Gracias por escribirnos!
        </h3>
        <p className="mt-2 max-w-sm text-[15px] text-paper/55">
          Hemos preparado tu mensaje. Si no se abrió WhatsApp automáticamente,
          escríbenos directamente y te responderemos lo antes posible.
        </p>
        <Button
          href={whatsappLink('Hola, acabo de llenar el formulario en su website.')}
          external
          variant="whatsapp"
          icon="whatsapp"
          className="mt-6"
        >
          Abrir WhatsApp
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-white/[0.04] p-7 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" name="nombre" placeholder="Tu nombre" required />
        <Field label="Empresa" name="empresa" placeholder="Nombre del negocio" />
        <Field label="País" name="pais" placeholder="Ej. Estados Unidos" required />
        <Field label="Ciudad" name="ciudad" placeholder="Ej. Miami" />
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          required
        />
        <Field label="Teléfono" name="telefono" type="tel" placeholder="+1 ..." />
      </div>

      <div className="mt-4">
        <label
          htmlFor="servicio"
          className="mb-1.5 block text-sm font-medium text-paper/70"
        >
          Servicio de interés
        </label>
        <select
          id="servicio"
          name="servicio"
          className={`${inputClass} [&>option]:bg-ink-850`}
          defaultValue=""
        >
          <option value="" disabled>
            Selecciona un servicio
          </option>
          {serviceOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label
          htmlFor="mensaje"
          className="mb-1.5 block text-sm font-medium text-paper/70"
        >
          Mensaje
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={4}
          placeholder="Cuéntanos sobre tu negocio y qué necesitas..."
          className={inputClass}
        />
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full" iconRight="arrow-right">
        Enviar mensaje
      </Button>
      <p className="mt-3 text-center text-xs text-paper/40">
        Al enviar aceptas que Cluster Media te contacte sobre tu solicitud.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-paper/70">
        {label}
        {required && <span className="text-brand-300"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />
    </div>
  );
}
