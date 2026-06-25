'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { whatsappLink } from '@/lib/site';
import { promoteOptions, packageOptions } from '@/lib/ruta-local';

const inputClass =
  'w-full bg-surface px-4 py-3 text-[15px] text-fg placeholder:text-faint transition-colors focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]';

const labelClass = 'mb-1.5 block text-sm font-medium text-muted';

export function LeadForm() {
  const [sent, setSent] = useState(false);

  // Estrategia de envío:
  //  1. Intentamos POST a /api/ruta-local (reenvía el lead al webhook de GoHighLevel
  //     si GHL_RUTA_LOCAL_WEBHOOK_URL está configurado).
  //  2. Pase lo que pase, abrimos WhatsApp con el resumen como respaldo y mostramos
  //     la pantalla de agradecimiento.
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    try {
      await fetch('/api/ruta-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Silencioso: el respaldo por WhatsApp asegura que el lead no se pierda.
    }

    const message =
      `Nuevo lead de Ruta Local:%0A` +
      `Nombre: ${data.get('nombre')}%0A` +
      `Cargo: ${data.get('cargo')}%0A` +
      `Municipio / Organización: ${data.get('municipio')}%0A` +
      `Teléfono: ${data.get('telefono')}%0A` +
      `Email: ${data.get('email')}%0A` +
      `Redes / Website: ${data.get('redes')}%0A` +
      `Desea promover: ${data.get('promover')}%0A` +
      `Paquete de interés: ${data.get('paquete')}%0A` +
      `Mensaje: ${data.get('mensaje')}`;

    setSent(true);
    window.open(whatsappLink(decodeURIComponent(message)), '_blank');
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center bg-surface p-10 text-center sm:p-14">
        <span className="flex h-16 w-16 items-center justify-center bg-accent text-accent-fg">
          <Icon name="check" size={32} strokeWidth={2.5} />
        </span>
        <h3 className="mt-6 font-display text-2xl font-semibold uppercase text-fg sm:text-3xl">
          ¡Gracias por su interés!
        </h3>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
          Nuestro equipo revisará su solicitud y le contactará pronto para
          conversar sobre cómo llevar Ruta Local a su municipio.
        </p>
        <Button
          href={whatsappLink('Hola, acabo de solicitar una propuesta de Ruta Local.')}
          external
          variant="whatsapp"
          icon="whatsapp"
          size="lg"
          className="mt-7"
        >
          Escribir por WhatsApp
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface p-7 sm:p-9">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo" name="nombre" placeholder="Tu nombre" required />
        <Field label="Cargo" name="cargo" placeholder="Ej. Alcalde, director de turismo" />
        <Field
          label="Municipio / Organización"
          name="municipio"
          placeholder="Ej. Alcaldía de Santa Rosa"
          required
        />
        <Field label="Teléfono" name="telefono" type="tel" placeholder="+504 ..." required />
        <Field
          label="Correo electrónico"
          name="email"
          type="email"
          placeholder="tu@email.com"
          required
        />
        <Field
          label="Redes sociales / website"
          name="redes"
          placeholder="@usuario o tudominio.com"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <SelectField
          label="¿Qué desea promover?"
          name="promover"
          placeholder="Selecciona una opción"
          options={promoteOptions}
        />
        <SelectField
          label="¿Qué paquete le interesa?"
          name="paquete"
          placeholder="Selecciona un paquete"
          options={packageOptions}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="mensaje" className={labelClass}>
          Mensaje adicional
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={4}
          placeholder="Cuéntanos sobre tu municipio, evento o iniciativa..."
          className={inputClass}
        />
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full" iconRight="arrow-right">
        Solicitar propuesta
      </Button>
      <p className="mt-3 text-center text-xs text-faint">
        Al enviar aceptas que Cluster te contacte sobre tu solicitud.
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
      <label htmlFor={name} className={labelClass}>
        {label}
        {required && <span className="text-accent"> *</span>}
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

function SelectField({
  label,
  name,
  placeholder,
  options,
}: {
  label: string;
  name: string;
  placeholder: string;
  options: string[];
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        className={`${inputClass} [&>option]:bg-ink-850`}
        defaultValue=""
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
