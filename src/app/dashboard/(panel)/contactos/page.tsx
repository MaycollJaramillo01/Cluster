import { createContact, importContacts } from '@/lib/crm/actions';
import { formatDate } from '@/lib/crm/format';
import { listContacts, listMembershipNames } from '@/lib/crm/queries';
import { ContactTable } from '@/components/dashboard/ContactTable';
import { Empty, Field, Notice, PageTitle, btn, btnGhost, fieldClass } from '@/components/dashboard/ui';

const errors: Record<string, string> = {
  datos: 'Falta el nombre o el correo.',
  correo: 'Ese correo ya está en el CRM.',
  csv: 'El archivo no trae filas con nombre y correo.',
};

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; segment?: string; membership?: string; error?: string; importados?: string; tope?: string }>;
}) {
  const params = await searchParams;
  const [contacts, memberships] = await Promise.all([
    listContacts({ q: params.q, segment: params.segment, membership: params.membership }),
    listMembershipNames(),
  ]);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Personas"
        action={<a className={btnGhost} href="/dashboard/contactos/exportar">Exportar CSV</a>}
      />
      {params.error ? <Notice>{errors[params.error] || 'No se pudo guardar.'}</Notice> : null}
      {params.importados ? (
        <Notice>
          Entraron {params.importados} contactos nuevos. Los correos repetidos se saltaron.
          {params.tope ? ' El archivo traía más de 5000 filas; el resto quedó afuera.' : ''}
        </Notice>
      ) : null}
      <form className="flex flex-wrap gap-2" action="/dashboard/contactos">
        {params.segment ? <input type="hidden" name="segment" value={params.segment} /> : null}
        {params.membership ? <input type="hidden" name="membership" value={params.membership} /> : null}
        <input className={`${fieldClass} max-w-sm`} name="q" defaultValue={params.q || ''} placeholder="Buscar nombre, correo o teléfono" />
        <button className={btnGhost} type="submit">Buscar</button>
      </form>
      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-4">
          <form action={createContact} className="space-y-3 border border-black/10 bg-white p-4">
            <Field label="Nombre"><input className={fieldClass} name="name" required /></Field>
            <Field label="Correo"><input className={fieldClass} name="email" type="email" required /></Field>
            <Field label="Teléfono"><input className={fieldClass} name="phone" /></Field>
            <Field label="País"><input className={fieldClass} name="country" placeholder="HN" /></Field>
            <Field label="Membresía">
              <select className={fieldClass} name="membership" defaultValue="">
                <option value="">Sin membresía</option>
                {memberships.map((name) => <option key={name}>{name}</option>)}
              </select>
            </Field>
            <Field label="Etiqueta"><input className={fieldClass} name="tag" placeholder="Prospectos de ventas" /></Field>
            <button className={btn} type="submit">Agregar contacto</button>
          </form>
          <form action={importContacts} className="space-y-3 border border-black/10 bg-white p-4">
            <Field label="Importar CSV">
              <input className={fieldClass} type="file" name="file" accept=".csv,text/csv" />
            </Field>
            <p className="text-xs leading-relaxed text-black/50">
              La primera fila puede ser el encabezado: nombre, email, telefono, pais, etiqueta.
            </p>
            <button className={btnGhost} type="submit">Importar CSV</button>
          </form>
        </div>
        {contacts.length === 0 ? <Empty title="Sin contactos" /> : (
          <ContactTable
            rows={contacts.map((contact) => ({
              id: contact.id,
              name: contact.name,
              email: contact.email,
              phone: contact.phone || '',
              tags: contact.tags.join(', '),
              when: formatDate(contact.created_at),
            }))}
          />
        )}
      </div>
    </div>
  );
}
