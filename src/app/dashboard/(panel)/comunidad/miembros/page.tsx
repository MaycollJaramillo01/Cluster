import { addCircleMember } from '@/lib/crm/actions';
import { formatDate } from '@/lib/crm/format';
import { listCircleMembers, listCircles, listContacts } from '@/lib/crm/queries';
import { Empty, Field, PageTitle, Table, btn, fieldClass } from '@/components/dashboard/ui';

export default async function CommunityMembersPage() {
  const [members, circles, contacts] = await Promise.all([listCircleMembers(), listCircles(), listContacts({})]);

  return (
    <div className="space-y-6">
      <PageTitle title="Miembros" />
      <form action={addCircleMember} className="grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-4">
        <Field label="Círculo">
          <select className={fieldClass} name="circle_id" required>
            {circles.map((circle) => <option key={circle.id} value={circle.id}>{circle.name}</option>)}
          </select>
        </Field>
        <Field label="Contacto">
          <select className={fieldClass} name="contact_id" required>
            {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}
          </select>
        </Field>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input name="paid" type="checkbox" />
          Pago
        </label>
        <div className="flex items-end">
          <button className={btn} type="submit" disabled={circles.length === 0}>Sumar</button>
        </div>
      </form>
      {members.length === 0 ? <Empty title="Sin miembros" /> : (
        <Table head={['Persona', 'Círculo', 'Estado', 'Pago', 'Desde']}>
          {members.map((member) => (
            <tr key={member.id} className="border-b border-black/5 last:border-0">
              <td className="px-4 py-3">
                <p className="font-medium">{member.contact_name}</p>
                <p className="text-xs text-black/45">{member.email}</p>
              </td>
              <td className="px-4 py-3">{member.circle_name}</td>
              <td className="px-4 py-3 capitalize">{member.status}</td>
              <td className="px-4 py-3">{member.paid ? 'Sí' : 'No'}</td>
              <td className="px-4 py-3 text-black/45">{formatDate(member.created_at)}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
