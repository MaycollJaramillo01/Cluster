import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import type { CaseStudy } from '@/lib/site';

export function CaseCard({
  study,
  index = 0,
}: {
  study: CaseStudy;
  index?: number;
}) {
  return (
    <Reveal 
      as="article"
      delay={index * 80}
      className="group flex h-full flex-col overflow-hidden border border-ink-900/10 bg-paper shadow-glow-sm transition duration-300 hover:-translate-y-1 hover:border-ink-900/25 hover:bg-white"
    >
      <div className="relative h-56 overflow-hidden bg-ink-950">
        <Image
          src={study.image}
          alt={`${study.client} - ${study.industry}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover opacity-70 grayscale transition duration-700 group-hover:scale-105 group-hover:opacity-85 group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,15,19,0.82)_0%,rgba(6,15,19,0.24)_42%,rgba(6,15,19,0.92)_100%)]" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5">
          <span className="mono-label bg-white px-2.5 py-1 text-ink-950">
            {study.industry}
          </span>
          <span className="max-w-[48%] text-right font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85">
            {study.client}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-5">
          <div>
            <div className="font-display text-5xl font-bold uppercase leading-none text-white">
              {study.metric.value}
            </div>
            <div className="mono-label mt-1.5 max-w-40 text-white/70">
              {study.metric.label}
            </div>
          </div>
          <span className="h-px min-w-12 flex-1 bg-white/35" aria-hidden="true" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="font-display text-xl font-bold leading-tight text-ink-950">
          {study.title}
        </h3>
        <p className="mt-3 flex-1 text-[16px] leading-relaxed text-ink-900/75">
          {study.text}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {study.services.map((service) => (
            <span
              key={service}
              className="bg-ink-950/[0.06] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-900/65"
            >
              {service}
            </span>
          ))}
        </div>
        <Link
          href="/casos-de-exito"
          className="mt-6 inline-flex items-center gap-2 self-start border-b border-ink-950 pb-1 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink-950 transition-all group-hover:gap-3"
        >
          Ver caso
          <Icon name="arrow-right" size={16} />
        </Link>
      </div>
    </Reveal>
  );
}
