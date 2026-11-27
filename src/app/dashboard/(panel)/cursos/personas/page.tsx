import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { createPerson, updatePerson } from '@/lib/valux/actions';
import { listPeople } from '@/lib/valux/data';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Empty, Field, PageTitle, Pill, SectionTitle, btnSmall, capitalize, fieldClass } from '@/components/dashboard/StaffUi';

const roles = ['usuario', 'suscriptor', 'asociado', 'profesor', 'junta'];

export default async function PersonasPage() {
  const people = await listPeople();

  return (
    <VStack gap={8} className="mx-auto w-full max-w-6xl">
      <PageTitle eyebrow="Alumnos" title="Personas" description="Cuentas de la academia: alumnos, profesores, asociados y junta. El rol define qué puede hacer cada una." />

      <details className="academy-panel">
        <summary className="academy-focus flex min-h-12 cursor-pointer list-none items-center px-5 font-semibold text-academy-primary sm:px-6">Agregar persona</summary>
        <form action={createPerson} className="grid gap-5 border-t border-academy-line p-5 sm:p-6 md:grid-cols-2">
          <Field label="Nombre"><input className={fieldClass} name="name" required autoComplete="off" /></Field>
          <Field label="Correo"><input className={fieldClass} name="email" type="email" required autoComplete="off" /></Field>
          <Field label="Rol">
            <select className={fieldClass} name="role" defaultValue="usuario">
              {roles.map((role) => <option key={role} value={role}>{capitalize(role)}</option>)}
            </select>
          </Field>
          <Field label="Correo de PayPal" hint="Para pagarle sus ventas."><input className={fieldClass} name="paypal_email" type="email" autoComplete="off" /></Field>
          <Field label="Nicho"><input className={fieldClass} name="niche" /></Field>
          <Field label="Bio"><input className={fieldClass} name="bio" /></Field>
          <HStack className="md:col-span-2"><AcademySubmit label="Agregar persona" pending="Guardando…" /></HStack>
        </form>
      </details>

      <VStack as="section" gap={4} aria-labelledby="personas-lista">
        <SectionTitle id="personas-lista" title="Cuentas" description={`${people.length} en total.`} />
        {people.length === 0 ? <Empty title="Todavía no hay personas." /> : (
          <ul className="academy-panel divide-y divide-academy-line overflow-hidden">
            {people.map((person) => (
              <li key={person.id}>
                <form action={updatePerson} aria-label={`Cuenta de ${person.name}`} className="grid items-end gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_theme(spacing.40)_theme(spacing.56)_auto_auto]">
                  <input type="hidden" name="id" value={person.id} />
                  <VStack gap={1} className="min-w-0 self-center">
                    <HStack gap={2} align="center" wrap="wrap">
                      <p className="break-words font-semibold">{person.name}</p>
                      {!person.is_active ? <Pill tone="off">Inactiva</Pill> : null}
                    </HStack>
                    <p className="break-all text-sm text-academy-muted">{person.email}</p>
                    <p className="text-xs text-academy-muted">
                      {capitalize(person.stage)} · {person.source || 'sin fuente'}{person.utm ? ` · ${person.utm}` : ''} · Acepta WhatsApp: {person.consent_whatsapp ? 'sí' : 'no'} · Acepta correos: {person.consent_email ? 'sí' : 'no'}
                    </p>
                  </VStack>
                  <Field label="Rol">
                    <select className={fieldClass} name="role" defaultValue={person.role}>
                      {roles.map((role) => <option key={role} value={role}>{capitalize(role)}</option>)}
                    </select>
                  </Field>
                  <Field label="Correo de PayPal"><input className={fieldClass} name="paypal_email" defaultValue={person.paypal_email} placeholder="PayPal" /></Field>
                  <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
                    <input name="is_active" type="checkbox" value="no" defaultChecked={!person.is_active} className="size-4" />
                    Inactiva
                  </label>
                  <button className={`${btnSmall} min-h-11`} type="submit">Guardar<small className="sr-only"> {person.name}</small></button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </VStack>
    </VStack>
  );
}
