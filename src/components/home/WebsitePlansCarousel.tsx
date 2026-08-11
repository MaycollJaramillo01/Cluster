'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { websitePlans } from '@/lib/website-plans';

export function WebsitePlansCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: -1 | 1) {
    const node = scrollerRef.current;
    if (!node) return;
    const card = node.querySelector<HTMLElement>('[data-plan-card]');
    const amount = (card?.offsetWidth ?? 320) + 24;
    node.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      <div className="mb-6 flex items-center justify-end gap-2">
        <button
          type="button"
          aria-label="Plan anterior"
          onClick={() => scrollByCard(-1)}
          className="flex h-11 w-11 items-center justify-center bg-surface text-fg transition-colors hover:bg-accent hover:text-accent-fg"
        >
          <Icon name="arrow-right" size={18} className="rotate-180" />
        </button>
        <button
          type="button"
          aria-label="Plan siguiente"
          onClick={() => scrollByCard(1)}
          className="flex h-11 w-11 items-center justify-center bg-surface text-fg transition-colors hover:bg-accent hover:text-accent-fg"
        >
          <Icon name="arrow-right" size={18} />
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pb-4 pt-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {websitePlans.map((plan) => (
          <article
            key={plan.slug}
            id={plan.slug}
            data-plan-card
            className={`relative flex w-[min(100%,22rem)] shrink-0 snap-start flex-col scroll-mt-28 p-7 sm:w-[24rem] sm:p-8 ${
              plan.highlight
                ? 'bg-surface-2 ring-1 ring-inset ring-[color:var(--accent)]'
                : 'bg-surface'
            }`}
          >
            {plan.badge && (
              <span className="mono-label mb-3 inline-flex w-fit bg-accent px-3 py-1.5 text-accent-fg">
                {plan.badge}
              </span>
            )}
            {plan.kicker && (
              <span className="mono-label text-accent">{plan.kicker}</span>
            )}
            <h3 className="mt-2 font-display text-3xl font-bold uppercase leading-none text-fg">
              {plan.name}
              {plan.nameAccent ? (
                <span className="text-accent"> {plan.nameAccent}</span>
              ) : null}
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              {plan.tagline}
            </p>

            <p className="mt-6 flex items-end gap-1">
              <span className="font-display text-lg font-semibold text-accent">
                $
              </span>
              <span className="font-display text-5xl font-bold leading-none text-fg">
                {plan.price}
              </span>
              <span className="pb-1 font-mono text-sm text-accent">/mes</span>
            </p>

            <ul className="mt-6 flex-1 space-y-3 border-t border-line pt-6">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-3 text-[15px] text-muted"
                >
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center bg-surface-2 text-accent">
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
            {plan.footer && (
              <p className="mt-3 text-sm text-muted">{plan.footer}</p>
            )}

            <Button
              href={`/desarrollo-web/${plan.slug}`}
              variant={plan.highlight ? 'accent' : 'ghost'}
              size="lg"
              className="mt-7 w-full"
              iconRight="arrow-right"
            >
              Contratar plan
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
