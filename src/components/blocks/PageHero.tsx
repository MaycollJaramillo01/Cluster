import type { ReactNode } from 'react';
import Image from 'next/image';
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
  image?: { src: string; alt: string };
  visual?: ReactNode;
  children?: ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  subtitle,
  price,
  primaryCta = { label: 'Agendar llamada', href: site.calendarUrl },
  whatsappMessage,
  image,
  visual,
  children,
}: PageHeroProps) {
  const hasMedia = Boolean(image || visual);

  return (
    <section className="relative overflow-hidden bg-ink-950 pt-36 pb-20 sm:pt-44 sm:pb-24">
      {/* Rejilla + glow de fondo */}
      <div
        className="absolute inset-0 bg-grid-fade [background-size:64px_64px] opacity-40 [mask-image:radial-gradient(70%_60%_at_30%_0%,black,transparent)]"
        aria-hidden="true"
      />
      <div
        className="absolute -left-40 -top-20 h-[32rem] w-[32rem] rounded-full bg-surface blur-[130px]"
        aria-hidden="true"
      />
      <div className="grain absolute inset-0" aria-hidden="true" />

      <div className="container-x relative z-[1]">
        <div
          className={
            hasMedia
              ? 'grid min-w-0 grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16'
              : ''
          }
        >
          {/* Columna de texto */}
          <div className={hasMedia ? 'min-w-0 max-w-[21rem] sm:max-w-none' : 'max-w-4xl'}>
            {eyebrow && (
              <Reveal>
                <Eyebrow>{eyebrow}</Eyebrow>
              </Reveal>
            )}
            <Reveal delay={60}>
              <h1
                className={`mt-6 max-w-full break-words font-semibold leading-[0.98] text-fg ${
                  hasMedia
                    ? 'text-[2.05rem] sm:text-5xl lg:text-6xl'
                    : 'text-[2.75rem] sm:text-6xl lg:text-7xl'
                }`}
              >
                {title}
              </h1>
            </Reveal>
            {subtitle && (
              <Reveal delay={120}>
                <p className="mt-7 max-w-full break-words text-base leading-relaxed text-muted sm:max-w-2xl sm:text-lg">
                  {subtitle}
                </p>
              </Reveal>
            )}

            {price && (
              <Reveal delay={150}>
                <div className="mt-9 inline-flex items-end gap-3 bg-surface px-6 py-4 backdrop-blur-sm">
                  {price.before && (
                    <span className="text-lg text-faint line-through">
                      {price.before}
                    </span>
                  )}
                  <span className="font-display text-3xl font-semibold text-accent">
                    {price.now}
                  </span>
                  {price.note && (
                    <span className="pb-1 font-mono text-sm text-faint">
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

          {/* Columna visual */}
          {visual ? (
            <Reveal
              delay={160}
              className="relative aspect-[4/3] min-w-0 overflow-hidden lg:aspect-[4/5]"
            >
              {visual}
            </Reveal>
          ) : image ? (
            <Reveal
              delay={160}
              className="relative aspect-[4/3] min-w-0 overflow-hidden lg:aspect-[4/5]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover grayscale transition duration-700 hover:grayscale-0"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 ring-1 ring-inset ring-white/10"
                aria-hidden="true"
              />
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
