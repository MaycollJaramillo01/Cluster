import Link from 'next/link';
import { toggleSystemEmail } from '@/lib/crm/actions';
import { listSystemEmails } from '@/lib/crm/queries';
import { PageTitle, btnTiny } from '@/components/dashboard/ui';

export default async function SystemEmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ audiencia?: string }>;
}) {
  const params = await searchParams;
  const audience = params.audiencia === 'admin' ? 'admin' : 'cliente';
  const emails = await listSystemEmails(audience);

  return (
    <div className="space-y-6">
      <PageTitle title="Correos del sistema" />
      <div className="flex gap-2">
        <Link href="/dashboard/mensajes/sistema?audiencia=cliente" className={`px-3 py-2 text-sm ${audience === 'cliente' ? 'bg-brand text-ink' : 'border border-black/10 bg-white'}`}>Para clientes</Link>
        <Link href="/dashboard/mensajes/sistema?audiencia=admin" className={`px-3 py-2 text-sm ${audience === 'admin' ? 'bg-brand text-ink' : 'border border-black/10 bg-white'}`}>Para el equipo</Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {emails.map((email) => (
          <article key={email.id} className="border border-black/10 bg-white p-4">
            <div className="mb-4 border border-black/10 bg-paper p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/35">Cluster</p>
              <p className="mt-3 text-sm font-medium">{email.subject}</p>
              <p className="mt-2 text-xs leading-relaxed text-black/55">{email.body}</p>
            </div>
            <p className="font-medium">{email.name}</p>
            <form action={toggleSystemEmail} className="mt-3">
              <input type="hidden" name="id" value={email.id} />
              <button className={btnTiny} type="submit">{email.enabled ? 'Activo' : 'Apagado'}</button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
