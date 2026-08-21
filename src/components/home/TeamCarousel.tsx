'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';

const slideSrcs = [
  {
    src: '/assets/stock/equipo/01.jpg',
    altKey: 'teamMemberAlt' as const,
    width: 682,
    height: 1024,
  },
  {
    src: '/assets/stock/equipo/02.jpg',
    altKey: 'teamMemberAlt' as const,
    width: 682,
    height: 1024,
  },
  {
    src: '/assets/stock/equipo/03.jpg',
    altKey: 'teamMemberAlt' as const,
    width: 682,
    height: 1024,
  },
  {
    src: '/assets/stock/equipo/04.jpg',
    altKey: 'teamGroupAlt' as const,
    width: 1024,
    height: 682,
  },
  {
    src: '/assets/stock/equipo/05.jpg',
    altKey: 'teamStudioAlt' as const,
    width: 1024,
    height: 682,
  },
];

export function TeamCarousel() {
  const t = useTranslations('Common');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slideSrcs.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  function goTo(next: number) {
    setIndex((next + slideSrcs.length) % slideSrcs.length);
  }

  return (
    <div className="relative mx-auto mt-12 max-w-5xl">
      <div className="relative aspect-[3/2] overflow-hidden bg-ink-950/[0.04]">
        {slideSrcs.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.src}
              alt={t(slide.altKey)}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-contain object-center"
              priority={i === 0}
            />
          </div>
        ))}

        <button
          type="button"
          aria-label={t('previousPhoto')}
          onClick={() => goTo(index - 1)}
          className="absolute left-3 top-1/2 z-[1] flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-ink-950/70 text-fg transition-colors hover:bg-accent hover:text-accent-fg sm:left-5"
        >
          <Icon name="arrow-right" size={18} className="rotate-180" />
        </button>
        <button
          type="button"
          aria-label={t('nextPhoto')}
          onClick={() => goTo(index + 1)}
          className="absolute right-3 top-1/2 z-[1] flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-ink-950/70 text-fg transition-colors hover:bg-accent hover:text-accent-fg sm:right-5"
        >
          <Icon name="arrow-right" size={18} />
        </button>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        {slideSrcs.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={t('goToPhoto', { n: i + 1 })}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={`h-1.5 transition-all duration-300 ${
              i === index ? 'w-8 bg-accent' : 'w-1.5 bg-ink-950/20 hover:bg-ink-950/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
