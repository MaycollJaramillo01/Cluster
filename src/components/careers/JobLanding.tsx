'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { HeroBackgroundVideo } from '@/components/blocks/PageHero';
import { ApplyModal } from './ApplyModal';
import type { JobOpening } from '@/lib/careers/types';

export function JobLanding({ job }: { job: JobOpening }) {
  const t = useTranslations('CareersJobs');
  const [open, setOpen] = useState(false);
  const openApply = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('postular') === '1') setOpen(true);
  }, []);

  const paragraphs = job.description
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 pt-36 pb-20 sm:pt-44 sm:pb-28">
        <HeroBackgroundVideo src="/assets/videos/heroes/redes-sociales.mp4" />
        <div className="grain absolute inset-0" aria-hidden="true" />
        <div className="container-x relative z-[1]">
          <div className="max-w-3xl">
            <Reveal>
              <Eyebrow>{t('roleEyebrow')}</Eyebrow>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-6 text-[2.4rem] font-semibold leading-[0.98] tracking-tight text-fg sm:text-5xl lg:text-6xl">
                {job.title}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                {job.summary}
              </p>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-5 font-mono text-xs uppercase tracking-[0.18em] text-accent">
                {job.location} · {job.employment}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button size="lg" iconRight="arrow-right" onClick={openApply}>
                  {t('applyCta')}
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {paragraphs.length > 0 ? (
        <section className="theme-light bg-paper py-16 text-fg sm:py-24">
          <div className="container-x max-w-3xl">
            {paragraphs.map((text) => (
              <p key={text.slice(0, 24)} className="mt-6 text-[17px] leading-relaxed text-ink-700 first:mt-0">
                {text}
              </p>
            ))}
            <div className="mt-10">
              <Button size="lg" iconRight="arrow-right" onClick={openApply}>
                {t('applyCta')}
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <ApplyModal open={open} onClose={() => setOpen(false)} jobSlug={job.slug} />
    </>
  );
}
