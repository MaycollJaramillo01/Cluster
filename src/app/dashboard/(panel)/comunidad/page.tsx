import Link from 'next/link';
import { setupProgress } from '@/lib/crm/queries';
import { PageTitle, btn } from '@/components/dashboard/ui';

const steps = [
  { key: 'circles' as const, title: 'Crea el primer círculo', text: 'Un curso, un grupo o el estudio.', href: '/dashboard/comunidad/circulos' },
  { key: 'contacts' as const, title: 'Ten contactos para invitar', text: 'Los miembros salen de la lista de contactos.', href: '/dashboard/contactos' },
  { key: 'events' as const, title: 'Publica un evento', text: 'Para que la comunidad pueda reservar.', href: '/dashboard/citas' },
  { key: 'domains' as const, title: 'Marca un dominio de envío', text: 'Hace falta para los correos de la comunidad.', href: '/dashboard/mensajes/ajustes' },
  { key: 'campaigns' as const, title: 'Deja una campaña lista', text: 'El aviso de bienvenida vive en mensajes.', href: '/dashboard/mensajes/campanas' },
];

export default async function CommunityStartPage() {
  const progress = await setupProgress();
  const done = steps.filter((step) => progress[step.key]).length;

  return (
    <div className="space-y-8">
      <PageTitle title="Empieza el círculo" />
      <p className="max-w-xl text-sm leading-relaxed text-black/60">
        {done} de {steps.length} listos. Un círculo junta el curso, la conversación y a quién le cobras.
      </p>
      <ol className="space-y-3">
        {steps.map((step, index) => {
          const ready = progress[step.key];
          return (
            <li key={step.key} className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white px-5 py-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">{ready ? 'Listo' : `Paso ${index + 1}`}</p>
                <p className="mt-1 font-medium">{step.title}</p>
                <p className="text-sm text-black/50">{step.text}</p>
              </div>
              <Link className={ready ? 'font-mono text-[10px] uppercase tracking-[0.14em] text-black/40' : btn} href={step.href}>
                {ready ? 'Ver' : 'Hacer'}
              </Link>
            </li>
          );
        })}
      </ol>
      <Link className={btn} href="/dashboard/comunidad/circulos">Crear el primer círculo</Link>
    </div>
  );
}
