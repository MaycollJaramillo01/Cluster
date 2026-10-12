import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addNote, deleteContact, deleteNote, updateContact } from '@/lib/crm/actions';
import { formatDateTime } from '@/lib/crm/format';
import { getContact, listMembershipNames, listNotes } from '@/lib/crm/queries';
import { Field, Notice, PageTitle, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const [contact, notes, memberships] = await Promise.all([getContact(id), listNotes(id), listMembershipNames()]);
  if (!contact) notFound();

  return (
    <div className="space-y-6">
      <PageTitle title={contact.name} action={<Link className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45" href="/dashboard/contactos">Volver</Link>} />
      {query.error === 'correo' ? <Notice>Ese correo ya pertenece a otro contacto.</Notice> : null}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <form action={updateContact} className="grid gap-3 border border-black/10 bg-white p-5 sm:grid-cols-2">
          <input type="hidden" name="id" value={contact.id} />
          <Field label="Nombre"><input className={fieldClass} name="name" defaultValue={contact.name} required /></Field>
          <Field label="Correo"><input className={fieldClass} name="email" type="email" defaultValue={contact.email} required /></Field>
          <Field label="Teléfono"><input className={fieldClass} name="phone" defaultValue={contact.phone || ''} /></Field>
          <Field label="País"><input className={fieldClass} name="country" defaultValue={contact.country || ''} /></Field>
          <Field label="Dirección"><input className={fieldClass} name="address" defaultValue={contact.address || ''} /></Field>
          <Field label="Ciudad"><input className={fieldClass} name="city" defaultValue={contact.city || ''} /></Field>
          <Field label="Provincia"><input className={fieldClass} name="state" defaultValue={contact.state || ''} /></Field>
          <Field label="Código postal"><input className={fieldClass} name="postal_code" defaultValue={contact.postal_code || ''} /></Field>
          <Field label="Membresía">
            <select className={fieldClass} name="membership" defaultValue={contact.membership || ''}>
              <option value="">Sin membresía</option>
              {memberships.map((name) => <option key={name}>{name}</option>)}
            </select>
          </Field>
          <Field label="Experiencia en ventas"><input className={fieldClass} name="sales_experience" defaultValue={contact.sales_experience || ''} /></Field>
          <div className="flex items-center gap-3 sm:col-span-2">
            <button className={btn} type="submit">Guardar</button>
            <p className="text-xs text-black/45">{contact.tags.join(' · ') || 'Sin etiquetas'} · {contact.source}</p>
          </div>
        </form>
        <div className="space-y-4">
          <form action={addNote} className="space-y-3 border border-black/10 bg-white p-4">
            <input type="hidden" name="contact_id" value={contact.id} />
            <Field label="Nota"><textarea className={fieldClass} name="body" rows={3} required /></Field>
            <button className={btn} type="submit">Añadir nota</button>
          </form>
          <ul className="space-y-2">
            {notes.map((note) => (
              <li key={note.id} className="border border-black/10 bg-white p-3">
                <p className="text-sm leading-relaxed">{note.body}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/40">{formatDateTime(note.created_at)}</p>
                  <form action={deleteNote}>
                    <input type="hidden" name="id" value={note.id} />
                    <button className={btnTiny} type="submit">Quitar</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
          <form action={deleteContact}>
            <input type="hidden" name="id" value={contact.id} />
            <button className={btnTiny} type="submit">Eliminar contacto</button>
          </form>
        </div>
      </div>
    </div>
  );
}
