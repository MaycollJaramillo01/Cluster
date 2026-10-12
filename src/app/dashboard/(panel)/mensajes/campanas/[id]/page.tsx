import Link from 'next/link';
import { notFound } from 'next/navigation';
import { saveCampaign } from '@/lib/crm/actions';
import { getBrand, getCampaign, subscriberCount } from '@/lib/crm/queries';
import { Field, PageTitle, btn, fieldClass } from '@/components/dashboard/ui';

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [campaign, brand, subscribers] = await Promise.all([getCampaign(id), getBrand(), subscriberCount()]);
  if (!campaign) notFound();

  return (
    <div className="space-y-6">
      <PageTitle title={campaign.name} action={<Link className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45" href="/dashboard/mensajes/campanas">Volver</Link>} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form action={saveCampaign} className="space-y-3 border border-black/10 bg-white p-5">
          <input type="hidden" name="id" value={campaign.id} />
          <Field label="Nombre"><input className={fieldClass} name="name" defaultValue={campaign.name} required /></Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Canal">
              <select className={fieldClass} name="channel" defaultValue={campaign.channel}>
                <option value="email">Correo</option>
                <option value="mensaje">SMS / WhatsApp / voz</option>
              </select>
            </Field>
            <Field label="Tipo">
              <select className={fieldClass} name="kind" defaultValue={campaign.kind}>
                <option value="regular">Regular</option>
                <option value="ab">Prueba A/B</option>
              </select>
            </Field>
            <Field label="Estado">
              <select className={fieldClass} name="status" defaultValue={campaign.status}>
                <option value="borrador">Borrador</option>
                <option value="enviada">Marcar enviada</option>
              </select>
            </Field>
          </div>
          <Field label="Asunto"><input className={fieldClass} name="subject" defaultValue={campaign.subject || ''} /></Field>
          <Field label="Mensaje"><textarea className={fieldClass} name="body" rows={6} defaultValue={campaign.body || ''} /></Field>
          <p className="text-xs text-black/45">
            Marcar enviada toma los {subscribers} suscriptores activos como audiencia. El despacho real queda pendiente de un dominio verificado.
          </p>
          <button className={btn} type="submit">Guardar</button>
        </form>
        <article className="border border-black/10 bg-white">
          <div className="border-b border-black/10 bg-ink px-6 py-5 text-white">
            <p className="font-brand text-xs font-extrabold uppercase tracking-[0.2em]">Cluster</p>
            <p className="mt-2 text-xs text-white/60">{brand.sender_name}</p>
          </div>
          <div className="space-y-4 px-6 py-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">{campaign.subject || 'Sin asunto'}</p>
            <h2 className="font-display text-5xl leading-none tracking-wide">{campaign.name}</h2>
            <p className="max-w-md text-sm leading-relaxed text-black/70">{campaign.body || 'El mensaje aparece aquí.'}</p>
            <p className="inline-block bg-brand px-4 py-2 text-sm font-medium">Abrir</p>
            <p className="pt-8 text-xs text-black/40">{brand.company_name} · {brand.address}</p>
          </div>
        </article>
      </div>
    </div>
  );
}
