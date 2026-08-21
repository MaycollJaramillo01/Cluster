'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { site, whatsappLink } from '@/lib/site';

type CTASectionProps = {
  title?: string;
  text?: string;
  whatsappMessage?: string;
  primaryCta?: { label: string; href: string };
};

export function CTASection({
  title,
  text,
  whatsappMessage,
  primaryCta,
}: CTASectionProps) {
  const t = useTranslations('CTASection');
  const tc = useTranslations('Common');

  const resolvedTitle = title ?? t('defaultTitle');
  const resolvedText = text ?? t('defaultText');
  const resolvedPrimaryCta = primaryCta ?? {
    label: t('primaryCta'),
    href: site.calendarUrl,
  };

  return (
    <section className="theme-dark relative overflow-hidden bg-ink-950 py-24 text-fg sm:py-32">
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div
        className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-grid-fade [background-size:64px_64px] opacity-30 [mask-image:radial-gradient(50%_50%_at_50%_50%,black,transparent)]"
        aria-hidden="true"
      />

      <div className="container-x relative z-[1]">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-semibold leading-[1.02] tracking-[-0.03em] text-fg sm:text-5xl lg:text-6xl">
            {resolvedTitle}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {resolvedText}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button
              href={resolvedPrimaryCta.href}
              external={resolvedPrimaryCta.href.startsWith('http')}
              size="lg"
              iconRight="arrow-right"
            >
              {resolvedPrimaryCta.label}
            </Button>
            <Button
              href={whatsappLink(whatsappMessage)}
              external
              variant="whatsapp"
              size="lg"
              icon="whatsapp"
            >
              {tc('whatsapp')}
            </Button>
            <Button href="/contacto" variant="ghost" size="lg">
              {tc('requestInfo')}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
