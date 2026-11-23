import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { AcademySubmit } from './AcademySubmit';
import { updateProfile } from '@/lib/valux/actions';
import type { ValuxPerson } from '@/lib/valux/data';

type Profile = Pick<ValuxPerson, 'name' | 'email' | 'role' | 'niche' | 'bio' | 'instagram_url' | 'portfolio_url' | 'paypal_email' | 'reminders_off' | 'consent_email'>;

const roles: Record<string, string> = {
  usuario: 'Alumno',
  suscriptor: 'Suscriptor',
  asociado: 'Asociado',
  profesor: 'Profesor',
  junta: 'Junta',
};

const field = 'academy-field block w-full';
const label = 'block space-y-2 text-sm font-medium text-ink';
const disclosure = 'flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-2 font-semibold marker:content-none [&::-webkit-details-marker]:hidden';

export function ProfileSettings({ person, saved = false }: { person: Profile; saved?: boolean }) {
  return (
    <main className="academy-page max-w-5xl">
      <Heading level={1} className="academy-title mb-6">Mi perfil</Heading>
      <section aria-label="Configuración de perfil" className="grid min-w-0 items-start gap-5 md:grid-cols-3 md:gap-8">
        <aside aria-label="Datos de cuenta" className="academy-hero min-w-0 rounded-academy-lg p-5 text-white sm:p-6">
          <VStack gap={4}>
            <HStack as="header" gap={3} align="center">
              <figure aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-academy bg-white/10 text-white"><Icon name="user" size={24} /></figure>
              <VStack gap={1} className="min-w-0">
                <p className="text-sm font-medium text-white/80">{roles[person.role] || 'Miembro de la Academia'}</p>
                <Heading level={2} className="break-words text-xl font-bold text-white">{person.name || 'Mi cuenta'}</Heading>
              </VStack>
            </HStack>
            <dl className="border-t border-white/20 pt-4">
              <dt className="text-sm text-white/75">Correo de acceso</dt>
              <dd className="mt-1 break-all text-sm">{person.email}</dd>
            </dl>
            <Link href="/academia/mis-cursos" className="academy-action academy-action-on-dark w-fit">Mis cursos <Icon name="arrow-right" size={16} /></Link>
          </VStack>
        </aside>

        <form action={updateProfile} className="academy-panel min-w-0 overflow-hidden md:col-span-2">
          <section aria-labelledby="profile-details" className="space-y-5 p-5 sm:p-7">
            <h2 id="profile-details" className="font-brand text-xl font-semibold normal-case">Datos personales</h2>
            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="sr-only">Información personal</legend>
              <label className={label}>Nombre
                <input name="name" autoComplete="name" defaultValue={person.name} required className={field} />
              </label>
              <label className={label}>Área de especialidad
                <input name="niche" defaultValue={person.niche} className={field} placeholder="Ej. marketing digital" />
              </label>
              <label className={`${label} sm:col-span-2`}>Sobre ti
                <textarea name="bio" rows={3} defaultValue={person.bio} className={`${field} block resize-y`} />
              </label>
            </fieldset>
            <details className="group border-t border-black/10" open={Boolean(person.instagram_url || person.portfolio_url) || undefined}>
              <summary className={disclosure}>
                Enlaces profesionales
                <Icon name="chevron-down" size={18} aria-hidden="true" className="shrink-0 group-open:rotate-180" />
              </summary>
              <fieldset className="grid gap-4 pt-2 sm:grid-cols-2">
                <legend className="sr-only">Enlaces profesionales</legend>
                <label className={label}>Instagram
                  <input name="instagram_url" inputMode="url" spellCheck={false} defaultValue={person.instagram_url} className={field} />
                </label>
                <label className={label}>Portafolio
                  <input name="portfolio_url" inputMode="url" spellCheck={false} defaultValue={person.portfolio_url} className={field} />
                </label>
              </fieldset>
            </details>
          </section>

          <fieldset className="space-y-2 border-t border-black/10">
            <legend className="sr-only">Preferencias de correo</legend>
            <VStack gap={2} className="px-5 py-5 sm:px-7">
              <Heading level={2} className="mb-2 text-xl font-bold">Preferencias de correo</Heading>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 border-b border-black/10 pb-2 text-sm">
                <input name="reminders" type="checkbox" value="1" defaultChecked={!person.reminders_off} className="h-5 w-5 shrink-0 accent-ink" />
                Recordatorios para retomar cursos
              </label>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                <input name="consent_email" type="checkbox" value="1" defaultChecked={person.consent_email} className="h-5 w-5 shrink-0 accent-ink" />
                Novedades y ofertas de la Academia
              </label>
            </VStack>
          </fieldset>

          <details className="group border-t border-black/10 px-5 py-2 sm:px-7" open={person.role === 'profesor' || Boolean(person.paypal_email) || undefined}>
            <summary className={disclosure}>
              Configuración de cobros
              <Icon name="chevron-down" size={18} aria-hidden="true" className="shrink-0 group-open:rotate-180" />
            </summary>
            <label className={`${label} pb-4 pt-2`}>Correo de PayPal para recibir liquidaciones
              <input name="paypal_email" inputMode="email" autoComplete="off" spellCheck={false} defaultValue={person.paypal_email} className={field} />
            </label>
          </details>

          <HStack as="footer" gap={3} align="center" justify="between" wrap="wrap" id="guardar-perfil" className="scroll-mt-24 border-t border-academy-line bg-academy-page px-5 py-4 sm:px-7">
            <p role="status" className="text-sm font-medium text-ink">{saved ? 'Cambios guardados.' : ''}</p>
            <AcademySubmit pending="Guardando…" label="Guardar cambios" />
          </HStack>
        </form>
      </section>
    </main>
  );
}
