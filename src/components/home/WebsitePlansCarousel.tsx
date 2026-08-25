'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import type { WebsitePlan } from '@/lib/website-plans';
import { whatsappLink } from '@/lib/site';

function planTitleIcon(slug: WebsitePlan['slug']): IconName {
  switch (slug) {
    case 'website':
      return 'globe';
    case 'website-plus':
      return 'shield';
    case 'website-leads':
      return 'target';
    case 'website-seo':
      return 'search';
    case 'website-seo-leads':
      return 'rocket';
    default:
      return 'globe';
  }
}

function featureIcon(feature: string): IconName {
  const f = feature.toLowerCase();

  if (/whatsapp|formulario|contacto|contact form|contact \+/.test(f)) {
    return 'whatsapp';
  }
  if (/página|pages|page/.test(f)) return 'globe';
  if (/responsive|diseño|design/.test(f)) return 'sparkles';
  if (/cambio|changes|ronda/.test(f)) return 'pen';
  if (/dominio|domain/.test(f)) return 'globe';
  if (/hosting|ssl|backup/.test(f)) return 'shield';
  if (/monitor|salud|health/.test(f)) return 'chart';
  if (
    /seo|keyword|artículo|article|perfil de negocio|business profile|on-page|orgánic/.test(
      f,
    )
  ) {
    return 'search';
  }
  if (/ads|campaña|campaign|pauta/.test(f)) return 'megaphone';
  if (/lead|clientes|captar|oportunidad|sales/.test(f)) return 'target';
  if (/optimiz|seguimiento|follow|mensual|monthly/.test(f)) return 'chart';
  if (/usuario|users|equipo|team/.test(f)) return 'users';

  return 'bolt';
}

function PlanCard({ plan }: { plan: WebsitePlan }) {
  const tc = useTranslations('Common');

  return (
    <article
      id={plan.slug}
      data-plan-card
      className={`relative flex h-full w-full flex-col overflow-hidden p-8 sm:p-10 ${
        plan.highlight
          ? 'bg-surface-2 shadow-[0_24px_50px_-28px_rgba(2,195,154,0.55)] ring-1 ring-inset ring-[color:var(--accent)]'
          : 'bg-surface'
      }`}
    >
      <div className="web-card-bar absolute inset-x-0 top-0" aria-hidden="true" />

      <div className="mb-3 flex min-h-[1.75rem] justify-center">
        {plan.badge ? (
          <span className="mono-label inline-flex w-fit bg-accent px-3 py-1.5 text-accent-fg">
            {plan.badge}
          </span>
        ) : (
          <span className="h-[1.75rem]" aria-hidden="true" />
        )}
      </div>

      <div className="mx-auto flex h-14 w-14 items-center justify-center bg-[color:rgba(2,195,154,0.14)] text-accent">
        <Icon name={planTitleIcon(plan.slug)} size={28} strokeWidth={1.75} />
      </div>

      {plan.kicker && (
        <span className="mono-label mt-4 block text-center text-accent">
          {plan.kicker}
        </span>
      )}
      <h3 className="mt-3 text-center font-display text-3xl font-bold uppercase leading-none text-fg sm:text-4xl">
        {plan.name}
        {plan.nameAccent ? (
          <span className="text-accent"> {plan.nameAccent}</span>
        ) : null}
      </h3>
      <p className="mx-auto mt-4 max-w-sm text-center text-base leading-relaxed text-muted">
        {plan.tagline}
      </p>

      <p className="mt-8 flex items-end justify-center gap-1">
        <span className="font-display text-lg font-semibold text-accent">$</span>
        <span className="font-display text-5xl font-bold leading-none text-fg sm:text-6xl">
          {plan.price}
        </span>
        <span className="pb-1 font-mono text-sm text-accent">{tc('perMonth')}*</span>
      </p>

      <ul className="mt-8 flex-1 space-y-4 border-t border-line pt-8">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3.5 text-[15px] text-muted sm:text-base">
            <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center bg-[color:rgba(2,195,154,0.14)] text-accent">
              <Icon name={featureIcon(f)} size={18} strokeWidth={1.9} />
            </span>
            <span className="pt-1.5 leading-snug">{f}</span>
          </li>
        ))}
      </ul>

      {plan.note && (
        <p className="mt-5 text-center font-mono text-[11px] uppercase tracking-wider text-faint">
          ⓘ {plan.note}
        </p>
      )}
      {plan.footer && (
        <p className="mt-3 text-center text-sm text-muted">{plan.footer}</p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          href={`/desarrollo-web/${plan.slug}`}
          variant={plan.highlight ? 'accent' : 'ghost'}
          size="md"
          iconRight="arrow-right"
        >
          {tc('contract')}
        </Button>
        <Button
          href={whatsappLink(plan.whatsapp)}
          external
          variant="whatsapp"
          size="md"
          icon="whatsapp"
        >
          {tc('whatsapp')}
        </Button>
      </div>
    </article>
  );
}

export function WebsitePlansCarousel({ plans }: { plans: WebsitePlan[] }) {
  const tc = useTranslations('Common');

  if (!plans.length) return null;

  return (
    <div className="relative">
      <ul
        className={`mx-auto grid gap-6 ${
          plans.length === 1
            ? 'max-w-lg'
            : plans.length === 2
              ? 'max-w-5xl md:grid-cols-2'
              : 'max-w-7xl md:grid-cols-2 xl:grid-cols-3'
        }`}
      >
        {plans.map((plan) => (
          <li key={plan.slug} className="scroll-mt-28">
            <PlanCard plan={plan} />
          </li>
        ))}
      </ul>

      <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-wider text-faint">
        {tc('financingNote')}
      </p>
    </div>
  );
}
