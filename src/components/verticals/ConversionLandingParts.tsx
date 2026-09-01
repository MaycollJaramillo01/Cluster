'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Eyebrow, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { site, whatsappLink } from '@/lib/site';

type TrustItem = { label: string; value: string };
type ProblemItem = { n: string; title: string; text: string };
type MethodItem = { n: string; title: string; text: string };
type OutcomeItem = { title: string; text: string };
type ProblemImage = { src: string; alt: string };

export function VerticalHero({
  eyebrow,
  title,
  subtitle,
  micro,
  trust,
  video,
  ctaWhatsapp,
  ctaSchedule,
  whatsappMessage,
  onWhatsapp,
  onSchedule,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  micro: string;
  trust: TrustItem[];
  video: ReactNode;
  ctaWhatsapp: string;
  ctaSchedule: string;
  whatsappMessage: string;
  onWhatsapp?: () => void;
  onSchedule?: () => void;
}) {
  return (
    <section className="relative overflow-hidden bg-ink-950 pt-36 pb-20 sm:pt-44 sm:pb-28">
      {video}
      <div className="grain absolute inset-0" aria-hidden="true" />

      <div className="container-x relative z-[1]">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="mt-6 text-[2.4rem] font-semibold leading-[0.98] tracking-tight text-fg sm:text-5xl lg:text-6xl xl:text-7xl">
              {title}
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              {subtitle}
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button
                href={whatsappLink(whatsappMessage)}
                external
                variant="whatsapp"
                size="lg"
                icon="whatsapp"
                onClick={onWhatsapp}
              >
                {ctaWhatsapp}
              </Button>
              <Button
                href={site.calendarUrl}
                size="lg"
                iconRight="arrow-right"
                onClick={onSchedule}
              >
                {ctaSchedule}
              </Button>
            </div>
            <p className="mt-5 text-sm text-faint">{micro}</p>
          </Reveal>
        </div>

        <Reveal delay={240} className="mt-14 border-t border-line/50 pt-8">
          <ul className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:gap-x-12 sm:gap-y-4">
            {trust.map((item) => (
              <li key={item.label} className="min-w-0">
                <p className="mono-label text-faint">{item.label}</p>
                <p className="mt-2 text-sm text-fg sm:text-[15px]">{item.value}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

export function ProblemSection({
  eyebrow,
  title,
  description,
  close,
  items,
  images = [],
}: {
  eyebrow: string;
  title: string;
  description: string;
  close: string;
  items: ProblemItem[];
  images?: ProblemImage[];
}) {
  return (
    <section className="theme-light relative overflow-hidden bg-paper py-20 text-fg sm:py-24 lg:py-28">
      <div className="container-x relative z-[1]">
        <div className="mb-12 max-w-3xl lg:mb-14">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
            titleClass="text-4xl text-fg sm:text-5xl lg:text-6xl"
          />
        </div>

        <ul className="grid gap-4 md:grid-cols-3 md:gap-5">
          {items.map((item, i) => {
            const image = images[i];
            return (
              <Reveal
                key={item.n}
                delay={i * 80}
                as="li"
                className="flex h-full flex-col overflow-hidden border border-ink-950/10 bg-paper"
              >
                {image ? (
                  <div className="relative aspect-[16/10] overflow-hidden bg-ink-950">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <span className="mono-label text-accent">{item.n}</span>
                  <h3 className="mt-3 font-display text-xl font-semibold uppercase leading-tight text-ink-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ul>

        <p className="mt-10 max-w-2xl border-l-2 border-accent pl-5 text-base font-medium leading-snug text-ink-950 sm:text-lg">
          {close}
        </p>
      </div>
    </section>
  );
}

export function MethodSection({
  id,
  eyebrow,
  title,
  description,
  items,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  items: MethodItem[];
}) {
  return (
    <section
      id={id}
      className="theme-dark relative overflow-hidden bg-ink-950 py-20 text-fg grain sm:py-24 lg:py-28"
    >
      <div className="container-x relative z-[1]">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <SectionHeading
            tone="light"
            eyebrow={eyebrow}
            title={title}
            description={description}
            titleClass="text-4xl text-fg sm:text-5xl"
          />
          <ol className="divide-y divide-line border-y border-line">
            {items.map((step, i) => (
              <Reveal
                key={step.n}
                delay={i * 70}
                as="li"
                className="grid gap-3 py-7 sm:grid-cols-[4.5rem_1fr] sm:gap-8"
              >
                <span className="font-mono text-sm text-accent">{step.n}</span>
                <div>
                  <h3 className="font-display text-lg font-semibold uppercase text-fg">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-muted">
                    {step.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function OutcomesSection({
  id,
  eyebrow,
  title,
  description,
  items,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  items: OutcomeItem[];
}) {
  return (
    <section
      id={id}
      className="theme-light relative overflow-hidden bg-paper-soft py-20 text-fg sm:py-24 lg:py-28"
    >
      <div className="container-x relative z-[1]">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-12 max-w-3xl"
          titleClass="text-4xl text-fg sm:text-5xl"
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:gap-x-12 lg:gap-y-10">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 60}>
              <p className="mono-label text-accent">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold uppercase leading-tight text-ink-950">
                {item.title}
              </h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-700">
                {item.text}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCtaSection({
  eyebrow,
  title,
  text,
  ctaWhatsapp,
  ctaSchedule,
  whatsappMessage,
}: {
  eyebrow: string;
  title: string;
  text: string;
  ctaWhatsapp: string;
  ctaSchedule: string;
  whatsappMessage: string;
}) {
  return (
    <section className="theme-dark relative overflow-hidden bg-ink-950 py-20 text-fg sm:py-28">
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div className="container-x relative z-[1]">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-6 text-3xl font-semibold leading-[1.02] tracking-tight text-fg sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {text}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button
              href={whatsappLink(whatsappMessage)}
              external
              variant="whatsapp"
              size="lg"
              icon="whatsapp"
            >
              {ctaWhatsapp}
            </Button>
            <Button href={site.calendarUrl} size="lg" iconRight="arrow-right">
              {ctaSchedule}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
