import { createMembership, createProperty, createTag } from '@/lib/crm/actions';
import { listMembershipNames, listPropertyDefs, listTags } from '@/lib/crm/queries';
import { Field, PageTitle, Table, btn, fieldClass } from '@/components/dashboard/ui';

export default async function ContactSettingsPage() {
  const [properties, tags, memberships] = await Promise.all([listPropertyDefs(), listTags(), listMembershipNames()]);

  return (
    <div className="space-y-8">
      <PageTitle title="Ajustes" />
      <section className="space-y-3">
        <h2 className="font-display text-3xl tracking-wide">Propiedades</h2>
        <form action={createProperty} className="flex flex-wrap items-end gap-2">
          <Field label="Nombre"><input className={fieldClass} name="name" required /></Field>
          <Field label="Formato">
            <select className={fieldClass} name="format">
              <option>Texto</option>
              <option>Email</option>
              <option>Número</option>
              <option>Fecha</option>
            </select>
          </Field>
          <button className={btn} type="submit">Crear propiedad</button>
        </form>
        <Table head={['Propiedad', 'Formato', 'Origen']}>
          {properties.map((property) => (
            <tr key={property.id} className="border-b border-black/5 last:border-0">
              <td className="px-4 py-3">{property.name}</td>
              <td className="px-4 py-3">{property.format}</td>
              <td className="px-4 py-3 text-black/45">{property.built_in ? 'De serie' : 'Creada'}</td>
            </tr>
          ))}
        </Table>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3 border border-black/10 bg-white p-4">
          <h2 className="font-display text-3xl tracking-wide">Etiquetas</h2>
          <form action={createTag} className="flex gap-2">
            <input className={fieldClass} name="name" required />
            <button className={btn} type="submit">Crear</button>
          </form>
          <ul className="space-y-2 text-sm">
            {tags.map((tag) => <li key={tag.id}>{tag.name}</li>)}
          </ul>
        </section>
        <section className="space-y-3 border border-black/10 bg-white p-4">
          <h2 className="font-display text-3xl tracking-wide">Membresías</h2>
          <form action={createMembership} className="flex gap-2">
            <input className={fieldClass} name="name" required />
            <button className={btn} type="submit">Crear</button>
          </form>
          <ul className="space-y-2 text-sm">
            {memberships.map((name) => <li key={name}>{name}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
