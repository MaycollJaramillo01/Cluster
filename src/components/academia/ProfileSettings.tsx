import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Icon } from '@/components/ui/Icon';
import { AcademySubmit } from './AcademySubmit';
import { AccountNav, initials } from './AccountNav';
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
const label = 'block space-y-2 text-sm font-semibold text-academy-ink';
const hint = 'block text-xs font-normal text-academy-muted';
const section = 'grid gap-5 border-t border-academy-line px-5 py-6 sm:px-8 lg:grid-cols-[theme(spacing.56)_1fr] lg:gap-8';
const disclosure = 'academy-focus flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-academy text-sm font-semibold marker:content-none [&::-webkit-details-marker]:hidden';

function SectionHead({ id, title, detail }: { id: string; title: string; detail: string }) {
  return (
    <VStack gap={1}>
      <Heading id={id} level={2} className="text-base font-bold">{title}</Heading>
      <p className="text-sm text-academy-muted">{detail}</p>
    </VStack>
  );
}

export function ProfileSettings({ person, saved = false }: { person: Profile; saved?: boolean }) {
  const teacher = person.role === 'profesor';
  return (
    <main className="academy-page grid max-w-6xl items-start gap-6 lg:grid-cols-[theme(spacing.60)_1fr]">
      <VStack gap={4} className="min-w-0 lg:sticky lg:top-24">
        <AccountNav current="/academia/perfil" />
      </VStack>
      <VStack gap={6} className="min-w-0">
        <HStack as="header" gap={4} align="center" wrap="wrap">
          <figure aria-hidden="true" className="grid size-16 shrink-0 place-items-center rounded-academy-lg bg-academy-deep font-academy-heading text-xl font-bold text-academy-action">{initials(person.name)}</figure>
          <VStack gap={1} className="min-w-0">
            <Heading level={1} className="break-words text-3xl font-bold sm:text-4xl">{person.name || 'Mi cuenta'}</Heading>
            <p className="break-all text-sm text-academy-muted">{roles[person.role] || 'Miembro de la Academia'} · {person.email}</p>
          </VStack>
        </HStack>

        <form action={updateProfile} className="academy-panel min-w-0 overflow-hidden">
          <section aria-labelledby="perfil-datos" className={`${section} border-t-0`}>
            <SectionHead id="perfil-datos" title="Datos personales" detail="Tu nombre aparece en tus constancias." />
            <fieldset className="grid min-w-0 gap-5 sm:grid-cols-2">
              <legend className="sr-only">Datos personales</legend>
              <label className={label}>Nombre
                <input name="name" autoComplete="name" defaultValue={person.name} required className={field} />
              </label>
              <VStack gap={2} className="min-w-0 text-sm">
                <strong className="font-semibold">Correo de acceso</strong>
                <p className="flex min-h-11 items-center gap-2 break-all rounded-academy bg-academy-page px-3 text-academy-muted"><Icon name="lock" size={15} aria-hidden="true" className="shrink-0" />{person.email}</p>
                <small className={hint}>Identifica tu cuenta y no se puede cambiar aquí.</small>
              </VStack>
              <label className={`${label} sm:col-span-2`}>Área de especialidad
                <input name="niche" defaultValue={person.niche} className={field} placeholder="Ej. marketing digital" />
              </label>
              <label className={`${label} sm:col-span-2`}>Sobre ti
                <textarea name="bio" rows={4} defaultValue={person.bio} className={`${field} resize-y`} />
              </label>
            </fieldset>
          </section>

          <section aria-labelledby="perfil-enlaces" className={section}>
            <SectionHead id="perfil-enlaces" title="Enlaces profesionales" detail="Opcional. Se muestran junto a tu perfil de creador." />
            <details className="group min-w-0" open={Boolean(person.instagram_url || person.portfolio_url) || undefined}>
              <summary className={disclosure}>
                {person.instagram_url || person.portfolio_url ? 'Editar enlaces' : 'Agregar enlaces'}
                <Icon name="chevron-down" size={18} aria-hidden="true" className="shrink-0 group-open:rotate-180" />
              </summary>
              <fieldset className="grid gap-5 pt-3 sm:grid-cols-2">
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

          <section aria-labelledby="perfil-correo" className={section}>
            <SectionHead id="perfil-correo" title="Preferencias de correo" detail="Elige qué correos quieres recibir." />
            <fieldset className="min-w-0 divide-y divide-academy-line">
              <legend className="sr-only">Preferencias de correo</legend>
              <label className="flex min-h-12 cursor-pointer items-start gap-3 py-3 text-sm">
                <input name="reminders" type="checkbox" value="1" defaultChecked={!person.reminders_off} className="mt-0.5 h-5 w-5 shrink-0 accent-ink" />
                <VStack as="span" gap={0.5}>
                  <strong className="font-semibold">Recordatorios para retomar cursos</strong>
                  <small className={hint}>Cuando dejas un curso a medias.</small>
                </VStack>
              </label>
              <label className="flex min-h-12 cursor-pointer items-start gap-3 py-3 text-sm">
                <input name="consent_email" type="checkbox" value="1" defaultChecked={person.consent_email} className="mt-0.5 h-5 w-5 shrink-0 accent-ink" />
                <VStack as="span" gap={0.5}>
                  <strong className="font-semibold">Novedades y ofertas de la Academia</strong>
                  <small className={hint}>Cursos nuevos y anuncios.</small>
                </VStack>
              </label>
            </fieldset>
          </section>

          <section aria-labelledby="perfil-cobros" className={section}>
            <SectionHead id="perfil-cobros" title="Configuración de cobros" detail="Solo para creadores que reciben liquidaciones." />
            <details className="group min-w-0" open={teacher || Boolean(person.paypal_email) || undefined}>
              <summary className={disclosure}>
                Correo de PayPal
                <Icon name="chevron-down" size={18} aria-hidden="true" className="shrink-0 group-open:rotate-180" />
              </summary>
              <label className={`${label} pt-3`}>Correo de PayPal para recibir liquidaciones
                <input name="paypal_email" inputMode="email" autoComplete="off" spellCheck={false} defaultValue={person.paypal_email} className={field} />
              </label>
            </details>
          </section>

          <HStack as="footer" gap={3} align="center" justify="between" wrap="wrap" id="guardar-perfil" className="scroll-mt-24 border-t border-academy-line bg-academy-page px-5 py-4 sm:px-8">
            <p role="status" className="flex items-center gap-2 text-sm font-semibold text-academy-primary">{saved ? <><Icon name="check" size={16} aria-hidden="true" />Cambios guardados.</> : null}</p>
            <AcademySubmit pending="Guardando…" label="Guardar cambios" />
          </HStack>
        </form>
      </VStack>
    </main>
  );
}
