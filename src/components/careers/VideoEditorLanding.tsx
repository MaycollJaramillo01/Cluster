'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Eyebrow, Section, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { CheckList } from '@/components/blocks/Blocks';
import { HeroBackgroundVideo } from '@/components/blocks/PageHero';
import { Icon } from '@/components/ui/Icon';
import { ApplyModal } from './ApplyModal';

export function VideoEditorLanding() {
  const t = useTranslations('CareersVideoEditor');
  const [open, setOpen] = useState(false);
  const openApply = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('postular') === '1') setOpen(true);
  }, []);

  const lookingFor = t.raw('lookingFor') as string[];
  const evaluateItems = t.raw('evaluateItems') as string[];
  const workItems = t.raw('workItems') as { title: string; text: string }[];

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 pt-36 pb-20 sm:pt-44 sm:pb-28">
        <HeroBackgroundVideo src="/assets/videos/heroes/redes-sociales.mp4" />
        <div className="grain absolute inset-0" aria-hidden="true" />
        <div className="container-x relative z-[1]">
          <div className="max-w-3xl">
            <Reveal>
              <Eyebrow>{t('heroEyebrow')}</Eyebrow>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-6 text-[2.4rem] font-semibold leading-[0.98] tracking-tight text-fg sm:text-5xl lg:text-6xl xl:text-7xl">
                {t('heroTitle')}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                {t('heroSubtitle')}
              </p>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-5 font-mono text-xs uppercase tracking-[0.18em] text-accent">
                {t('heroMeta')}
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

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <SectionHeading
            eyebrow={t('whyEyebrow')}
            title={t('whyTitle')}
            description={t('whyText')}
            titleClass="text-4xl text-fg sm:text-5xl"
          />
          <Reveal delay={80}>
            <p className="mono-label text-accent">{t('lookingEyebrow')}</p>
            <h3 className="mt-3 font-display text-2xl font-semibold uppercase text-ink-950">
              {t('lookingTitle')}
            </h3>
            <CheckList items={lookingFor} className="mt-6" />
            <p className="mt-8 border-l-2 border-accent pl-5 text-[15px] leading-relaxed text-ink-700">
              {t('toolsNote')}
            </p>
          </Reveal>
        </div>
      </Section>

      <Section tone="dark">
        <SectionHeading
          tone="light"
          eyebrow={t('infoEyebrow')}
          title={t('infoTitle')}
          description={t('infoText')}
          className="mb-12"
          titleClass="text-4xl text-fg sm:text-5xl"
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal className="border border-line bg-surface p-7 sm:p-8">
            <p className="mono-label text-accent">{t('evaluateEyebrow')}</p>
            <h3 className="mt-3 font-display text-xl font-semibold uppercase text-fg">
              {t('evaluateTitle')}
            </h3>
            <CheckList items={evaluateItems} className="mt-6" />
            <p className="mt-6 text-[15px] leading-relaxed text-muted">
              {t('evaluateNote')}
            </p>
          </Reveal>
          <Reveal delay={80} className="border border-line bg-surface p-7 sm:p-8">
            <p className="mono-label text-accent">{t('selectEyebrow')}</p>
            <h3 className="mt-3 font-display text-xl font-semibold uppercase text-fg">
              {t('selectTitle')}
            </h3>
            <p className="mt-5 text-[15px] leading-relaxed text-muted">
              {t('selectFormula')}
            </p>
            <p className="mt-5 text-[15px] leading-relaxed text-muted">
              {t('selectText')}
            </p>
          </Reveal>
        </div>
      </Section>

      <Section tone="soft">
        <SectionHeading
          eyebrow={t('workEyebrow')}
          title={t('workTitle')}
          description={t('workText')}
          className="mb-12"
          titleClass="text-4xl text-fg sm:text-5xl"
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workItems.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 60}
              as="li"
              className="border border-ink-950/10 bg-paper p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center bg-surface text-accent">
                <Icon
                  name={i === 0 ? 'clock' : i === 1 ? 'globe' : 'users'}
                  size={18}
                />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold uppercase text-ink-950">
                {item.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-700">{item.text}</p>
            </Reveal>
          ))}
        </ul>
        <p className="mt-10 max-w-2xl border-l-2 border-accent pl-5 text-base font-medium leading-snug text-ink-950">
          {t('workNote')}
        </p>
      </Section>

      <section className="theme-dark relative overflow-hidden bg-ink-950 py-20 text-fg sm:py-28">
        <div className="grain absolute inset-0" aria-hidden="true" />
        <div className="container-x relative z-[1] pb-16 md:pb-0">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>{t('formEyebrow')}</Eyebrow>
            <h2 className="mt-6 text-3xl font-semibold leading-[1.02] tracking-tight text-fg sm:text-4xl lg:text-5xl">
              {t('formTitle')}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {t('formText')}
            </p>
            <div className="mt-10 flex justify-center">
              <Button size="lg" iconRight="arrow-right" onClick={openApply}>
                {t('applyCta')}
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink-950/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
        <button
          type="button"
          onClick={openApply}
          className="flex w-full items-center justify-center bg-fg px-4 py-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-bg"
        >
          {t('applyCta')}
        </button>
      </div>

      <ApplyModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
