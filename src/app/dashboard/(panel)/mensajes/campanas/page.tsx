import Link from 'next/link';
import { createCampaign, deleteCampaign } from '@/lib/crm/actions';
import { formatDate } from '@/lib/crm/format';
import { listCampaigns } from '@/lib/crm/queries';
import { Field, PageTitle, Rate, Table, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function CampaignsPage() {
  const campaigns = await listCampaigns();

  return (
    <div className="space-y-6">
      <PageTitle title="Todas" />
      <form action={createCampaign} className="grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-4">
        <Field label="Nombre"><input className={fieldClass} name="name" placeholder="Nombre de la campaña" required /></Field>
        <Field label="Canal">
          <select className={fieldClass} name="channel" defaultValue="email">
            <option value="email">Correo</option>
            <option value="mensaje">SMS / WhatsApp / voz</option>
          </select>
        </Field>
        <Field label="Tipo">
          <select className={fieldClass} name="kind" defaultValue="regular">
            <option value="regular">Regular</option>
            <option value="ab">Prueba A/B</option>
          </select>
        </Field>
        <div className="flex items-end"><button className={btn} type="submit">Crear borrador</button></div>
      </form>
      <Table head={['Nombre', 'Canal', 'Audiencia', 'Abiertos', 'Clics', 'Estado', '']}>
        {campaigns.map((campaign) => (
          <tr key={campaign.id} className="border-b border-black/5 last:border-0">
            <td className="px-4 py-3">
              <Link href={`/dashboard/mensajes/campanas/${campaign.id}`} className="font-medium hover:text-brand">{campaign.name}</Link>
              <p className="text-xs text-black/40">{campaign.sent_at ? formatDate(campaign.sent_at) : 'Sin envío'}</p>
            </td>
            <td className="px-4 py-3 capitalize">{campaign.channel === 'mensaje' ? 'Mensaje' : 'Correo'} · {campaign.kind === 'ab' ? 'A/B' : 'Regular'}</td>
            <td className="px-4 py-3">{campaign.audience}</td>
            <td className="px-4 py-3"><Rate value={campaign.opened_rate} /></td>
            <td className="px-4 py-3"><Rate value={campaign.clicked_rate} /></td>
            <td className="px-4 py-3 capitalize">{campaign.status}</td>
            <td className="px-4 py-3">
              <form action={deleteCampaign}>
                <input type="hidden" name="id" value={campaign.id} />
                <button className={btnTiny} type="submit">Eliminar</button>
              </form>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
