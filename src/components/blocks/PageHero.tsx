import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { whatsappLink, site } from '@/lib/site';

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  price?: { now: string; before?: string; note?: string };
  primaryCta?: { label: string; href: string };
  whatsappMessage?: string;
  children?: ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  subtitle,
  price,
  primaryCta = { label: 'Agendar llamada', href: site.calendarUrl },
  whatsappMessage,
  children,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-ink-950 pt-36 pb-20 sm:pt-44 sm:pb-24">
      {/* Rejilla + glow de fondo */}
      <div
        className="absolute inset-0 bg-grid-fade [background-size:64px_64px] opacity-40 [mask-image:radial-gradient(70%_60%_at_30%_0%,black,transparent)]"
        aria-hidden="true"
      />
      <div
        className="absolute -left-40 -top-20 h-[32rem] w-[32rem] rounded-full bg-brand/15 blur-[130px]"
        aria-hidden="true"
      />
      <div className="grain absolute inset-0" aria-hidden="true" />

      <div className="container-x relative z-[1]">
        <div className="max-w-4xl">
          {eyebrow && (
            <Reveal>
              <Eyebrow>{eyebrow}</Eyebrow>
            </Reveal>
          )}
          <Reveal delay={60}>
            <h1 className="mt-6 text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.03em] text-paper sm:text-6xl lg:text-7xl">
              {title}
            </h1>
          </Reveal>
          {subtitle && (
            <Reveal delay={120}>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-paper/60">
                {subtitle}
              </p>
            </Reveal>
          )}

          {price && (
            <Reveal delay={150}>
              <div className="mt-9 inline-flex items-end gap-3 rounded-2xl bg-white/[0.05] px-6 py-4 backdrop-blur-sm">
                {price.before && (
                  <span className="text-lg text-paper/35 line-through">
                    {price.before}
                  </span>
                )}
                <span className="font-display text-3xl font-semibold text-brand-300">
                  {price.now}
                </span>
                {price.note && (
                  <span className="pb-1 font-mono text-sm text-paper/45">
                    {price.note}
                  </span>
                )}
              </div>
            </Reveal>
          )}

          <Reveal delay={200}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button
                href={primaryCta.href}
                external={primaryCta.href.startsWith('http')}
                size="lg"
                iconRight="arrow-right"
              >
                {primaryCta.label}
              </Button>
              <Button
                href={whatsappLink(whatsappMessage)}
                external
                variant="ghost"
                size="lg"
                icon="whatsapp"
              >
                Escribir por WhatsApp
              </Button>
            </div>
          </Reveal>

          {children}
        </div>
      </div>
    </section>
  );
}
