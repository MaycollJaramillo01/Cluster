'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';

const caseAssets = [
  {
    url: 'https://www.luxoboutique.com/',
    image: '/assets/stock/desarrollo-web/luxo.png',
  },
  {
    url: 'http://inkexpresshn.com/',
    image: '/assets/stock/desarrollo-web/ink-express.png',
  },
  {
    url: 'https://beecoolandheat.com/',
    image: '/assets/stock/desarrollo-web/bee-cool.png',
  },
  {
    url: 'https://familiatowing.com/',
    image: '/assets/stock/desarrollo-web/familia-towing.png',
  },
  {
    url: 'https://www.alphapro.llc/',
    image: '/assets/stock/desarrollo-web/alpha-pro.png',
  },
] as const;

const MASONRY_ASPECTS = [
  'aspect-[16/10]',
  'aspect-[4/5]',
  'aspect-[16/11]',
  'aspect-[3/4]',
  'aspect-[16/10]',
] as const;

function CaseCard({
  item,
  duplicate = false,
  aspectClass = 'aspect-[16/10]',
  className = '',
}: {
  item: { name: string; category: string; url: string; image: string };
  duplicate?: boolean;
  aspectClass?: string;
  className?: string;
}) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block overflow-hidden border border-line bg-surface transition-colors hover:border-accent/40 ${className}`}
      aria-hidden={duplicate || undefined}
      tabIndex={duplicate ? -1 : undefined}
    >
      <div className={`relative overflow-hidden bg-ink-950 ${aspectClass}`}>
        <Image
          src={item.image}
          alt={duplicate ? '' : item.name}
          fill
          sizes="(max-width: 768px) 50vw, 320px"
          className="object-cover object-top transition duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex items-center justify-between gap-3 p-3 sm:p-4">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold uppercase text-fg sm:text-base">
            {item.name}
          </p>
          <p className="mono-label mt-1 text-faint">{item.category}</p>
        </div>
        <Icon
          name="arrow-right"
          size={16}
          className="shrink-0 text-accent transition-transform group-hover:translate-x-1"
        />
      </div>
    </a>
  );
}

function CaseStrip({
  cases,
  duplicate = false,
}: {
  cases: { name: string; category: string; url: string; image: string }[];
  duplicate?: boolean;
}) {
  return (
    <ul className="flex shrink-0 gap-5 pr-5" aria-hidden={duplicate}>
      {cases.map((item) => (
        <li key={`${duplicate ? 'dup-' : ''}${item.name}`} className="w-[280px] shrink-0 sm:w-[320px]">
          <CaseCard item={item} duplicate={duplicate} />
        </li>
      ))}
    </ul>
  );
}

export function WebsiteCasesCarousel() {
  const t = useTranslations('WebsiteCases');
  const cases = (t.raw('cases') as { name: string; category: string }[]).map(
    (item, index) => ({
      ...item,
      ...caseAssets[index],
    }),
  );

  return (
    <div role="region">
      <ul className="columns-2 gap-3 md:hidden">
        {cases.map((item, index) => (
          <li key={item.name} className="mb-3 break-inside-avoid">
            <CaseCard
              item={item}
              aspectClass={MASONRY_ASPECTS[index % MASONRY_ASPECTS.length]}
            />
          </li>
        ))}
      </ul>

      <div className="relative hidden overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)] md:block">
        <div className="flex w-max animate-marquee [--marquee-duration:45s] hover:[animation-play-state:paused] motion-reduce:animate-none">
          <CaseStrip cases={cases} />
          <div className="motion-reduce:hidden">
            <CaseStrip cases={cases} duplicate />
          </div>
        </div>
      </div>
    </div>
  );
}
