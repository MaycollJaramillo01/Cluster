'use client';

import { useActionState } from 'react';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { subscribeNewsletter } from '@/lib/valux/actions';
import { Icon } from '@/components/ui/Icon';
import { AcademySubmit } from './AcademySubmit';

export function NewsletterForm() {
  const [state, action] = useActionState(subscribeNewsletter, { status: '', email: '' });
  return (
    <VStack as="aside" gap={4} aria-labelledby="boletin-titulo" className="academy-panel bg-academy-tint p-5 sm:p-6">
      <Heading level={2} id="boletin-titulo" className="text-xl font-bold">Boletín de Academia</Heading>
      <p className="text-sm text-academy-muted">Recibe en tu correo las notas nuevas del blog.</p>
      {state.status === 'ok' ? (
        <p role="status" className="flex items-start gap-2 text-sm font-semibold text-academy-primary"><Icon name="check" size={16} className="mt-0.5 shrink-0" />Listo, te avisaremos de las nuevas notas.</p>
      ) : (
        <form action={action} className="space-y-4">
          <label className="block space-y-2 text-sm font-semibold">Correo para el boletín
            <input name="email" type="email" autoComplete="email" spellCheck={false} required defaultValue={state.email} aria-invalid={state.status === 'error' || undefined} className="academy-field block w-full" />
          </label>
          {state.status === 'error' ? <p role="alert" className="text-sm text-red-800">Escribe un correo válido.</p> : null}
          <AcademySubmit label="Suscribirme" pending="Enviando…" fullWidth />
        </form>
      )}
    </VStack>
  );
}
