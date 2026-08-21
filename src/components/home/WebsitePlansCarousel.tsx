'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type { WebsitePlan } from '@/lib/website-plans';
import { whatsappLink } from '@/lib/site';

function PlanCard({ plan }: { plan: WebsitePlan }) {
  const tc = useTranslations('Common');

  return (
    <article
      id={plan.slug}
      data-plan-card
      className={`relative flex w-full flex-col overflow-hidden p-7 sm:p-8 ${
        plan.highlight
          ? 'bg-surface-2 shadow-[0_24px_50px_-28px_rgba(2,195,154,0.55)] ring-1 ring-inset ring-[color:var(--accent)]'
          : 'bg-surface'
      }`}
    >
      <div className="web-card-bar absolute inset-x-0 top-0" aria-hidden="true" />

      <div className="mb-3 min-h-[1.75rem]">
        {plan.badge ? (
          <span className="mono-label inline-flex w-fit bg-accent px-3 py-1.5 text-accent-fg">
            {plan.badge}
          </span>
        ) : null}
      </div>
      {plan.kicker && <span className="mono-label text-accent">{plan.kicker}</span>}
      <h3 className="mt-2 min-h-[2.5rem] font-display text-3xl font-bold uppercase leading-none text-fg sm:min-h-[3rem]">
        {plan.name}
        {plan.nameAccent ? <span className="text-accent"> {plan.nameAccent}</span> : null}
      </h3>
      <p className="mt-3 min-h-[4.5rem] text-[15px] leading-relaxed text-muted">
        {plan.tagline}
      </p>

      <p className="mt-6 flex items-end gap-1">
        <span className="font-display text-lg font-semibold text-accent">$</span>
        <span className="font-display text-5xl font-bold leading-none text-fg">
          {plan.price}
        </span>
        <span className="pb-1 font-mono text-sm text-accent">{tc('perMonth')}*</span>
      </p>

      <ul className="mt-6 flex-1 space-y-3 border-t border-line pt-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-[15px] text-muted">
            <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center bg-[color:rgba(2,195,154,0.18)] text-accent">
              <Icon name="check" size={13} strokeWidth={2.5} />
            </span>
            {f}
          </li>
        ))}
      </ul>

      {plan.note && (
        <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-faint">
          ⓘ {plan.note}
        </p>
      )}
      {plan.footer && <p className="mt-3 text-sm text-muted">{plan.footer}</p>}

      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        <Button
          href={`/desarrollo-web/${plan.slug}`}
          variant={plan.highlight ? 'accent' : 'ghost'}
          size="sm"
          iconRight="arrow-right"
        >
          {tc('contract')}
        </Button>
        <Button
          href={whatsappLink(plan.whatsapp)}
          external
          variant="whatsapp"
          size="sm"
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
      <ul className="grid gap-4 md:hidden">
        {plans.map((plan) => (
          <li key={plan.slug} className="scroll-mt-28">
            <PlanCard plan={plan} />
          </li>
        ))}
      </ul>

      <div className="relative hidden md:block">
        <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pb-4 pt-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className="w-[min(100%,22rem)] shrink-0 snap-start scroll-mt-28 sm:w-[24rem]"
            >
              <PlanCard plan={plan} />
            </div>
          ))}
        </div>
      </div>

      <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-faint">
        {tc('financingNote')}
      </p>
    </div>
  );
}
