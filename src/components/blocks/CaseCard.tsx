import Link from 'next/link';
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
      className="card-dark group flex flex-col overflow-hidden"
    >
      {/* Encabezado con métrica grande */}
      <div className="relative flex h-44 flex-col justify-between overflow-hidden border-b border-white/10 bg-gradient-to-br from-brand/15 via-transparent to-transparent p-6">
        <div className="flex items-center justify-between">
          <span className="mono-label rounded-full bg-white/[0.06] px-3 py-1 text-paper/55">
            {study.industry}
          </span>
          <span className="font-display text-sm font-medium text-brand-300">
            {study.client}
          </span>
        </div>
        <div>
          <div className="font-display text-4xl font-semibold leading-none text-paper">
            {study.metric.value}
          </div>
          <div className="mt-1.5 text-sm text-paper/45">
            {study.metric.label}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-lg font-semibold leading-snug text-paper">
          {study.title}
        </h3>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-paper/55">
          {study.text}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {study.services.map((s) => (
            <span
              key={s}
              className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-paper/50"
            >
              {s}
            </span>
          ))}
        </div>
        <Link
          href="/casos-de-exito"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-300 transition-all group-hover:gap-3"
        >
          Ver caso
          <Icon name="arrow-right" size={16} />
        </Link>
      </div>
    </Reveal>
  );
}
