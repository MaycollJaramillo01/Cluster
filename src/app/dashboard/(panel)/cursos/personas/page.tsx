import { createPerson, updatePerson } from '@/lib/valux/actions';
import { listPeople } from '@/lib/valux/data';
import { Field, PageTitle, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

const roles = ['usuario', 'suscriptor', 'asociado', 'profesor', 'junta'];

export default async function PersonasPage() {
  const people = await listPeople();

  return (
    <div className="space-y-6">
      <PageTitle title="Personas" />
      <form action={createPerson} className="grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-2">
        <Field label="Nombre"><input className={fieldClass} name="name" required /></Field>
        <Field label="Correo"><input className={fieldClass} name="email" type="email" required /></Field>
        <Field label="Rol">
          <select className={fieldClass} name="role" defaultValue="usuario">
            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
        </Field>
        <Field label="PayPal"><input className={fieldClass} name="paypal_email" type="email" /></Field>
        <Field label="Nicho"><input className={fieldClass} name="niche" /></Field>
        <Field label="Bio"><input className={fieldClass} name="bio" /></Field>
        <button className={btn} type="submit">Agregar</button>
      </form>
      <div className="space-y-2">
        {people.map((person) => (
          <form key={person.id} action={updatePerson} className="grid items-end gap-2 border border-black/10 bg-white p-4 md:grid-cols-[1fr_160px_1fr_auto_auto]">
            <input type="hidden" name="id" value={person.id} />
            <div>
              <p className="font-medium">{person.name}</p>
              <p className="text-xs text-black/45">{person.email}</p>
            </div>
            <select className={fieldClass} name="role" defaultValue={person.role}>
              {roles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <input className={fieldClass} name="paypal_email" defaultValue={person.paypal_email} placeholder="PayPal" />
            <label className="flex items-center gap-2 text-sm">
              <input name="is_active" type="checkbox" value="no" defaultChecked={!person.is_active} />
              Inactiva
            </label>
            <button className={btnTiny} type="submit">Guardar</button>
          </form>
        ))}
      </div>
    </div>
  );
}
