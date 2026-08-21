'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';

const reelAssets = [
  {
    src: '/assets/videos/redes-sociales/reel-01.mp4',
    poster: '/assets/videos/redes-sociales/reel-01-poster.jpg',
  },
  {
    src: '/assets/videos/redes-sociales/reel-02.mp4',
    poster: '/assets/videos/redes-sociales/reel-02-poster.jpg',
  },
  {
    src: '/assets/videos/redes-sociales/reel-03.mp4',
    poster: '/assets/videos/redes-sociales/reel-03-poster.jpg',
  },
  {
    src: '/assets/videos/redes-sociales/reel-04.mp4',
    poster: '/assets/videos/redes-sociales/reel-04-poster.jpg',
  },
  {
    src: '/assets/videos/redes-sociales/reel-05.mp4',
    poster: '/assets/videos/redes-sociales/reel-05-poster.jpg',
  },
  {
    src: '/assets/videos/redes-sociales/reel-06.mp4',
    poster: '/assets/videos/redes-sociales/reel-06-poster.jpg',
  },
  {
    src: '/assets/videos/redes-sociales/reel-07.mp4',
    poster: '/assets/videos/redes-sociales/reel-07-poster.jpg',
  },
  {
    src: '/assets/videos/redes-sociales/reel-08.mp4',
    poster: '/assets/videos/redes-sociales/reel-08-poster.jpg',
  },
] as const;

const MASONRY_ASPECTS = [
  'aspect-[9/16]',
  'aspect-[3/4]',
  'aspect-[9/14]',
  'aspect-[4/5]',
] as const;

function ReelCard({
  item,
  active,
  onActivate,
  playLabel,
  className = '',
  aspectClass = 'aspect-[9/16]',
}: {
  item: { src: string; poster: string; label: string };
  active: boolean;
  onActivate: () => void;
  playLabel: string;
  className?: string;
  aspectClass?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;

    async function sync() {
      if (!video) return;
      if (!active) {
        video.pause();
        setPlaying(false);
        return;
      }

      video.muted = true;
      try {
        await video.play();
        if (!cancelled) setPlaying(true);
      } catch {
        if (!cancelled) setPlaying(false);
      }
    }

    sync();
    return () => {
      cancelled = true;
    };
  }, [active]);

  return (
    <article
      data-reel-card
      className={`relative overflow-hidden bg-ink-950 ${className}`}
    >
      <div className={`relative overflow-hidden bg-[#111] ${aspectClass}`}>
        <Image
          src={item.poster}
          alt=""
          fill
          sizes="(max-width: 768px) 50vw, 288px"
          className={`object-cover transition-opacity duration-300 ${
            playing ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <video
          ref={videoRef}
          src={item.src}
          poster={item.poster}
          muted
          loop
          playsInline
          preload={active ? 'auto' : 'metadata'}
          className="absolute inset-0 h-full w-full object-cover [transform:translateZ(0)]"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onClick={onActivate}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] bg-gradient-to-b from-ink-950/70 to-transparent p-3 pb-8 sm:p-4 sm:pb-10">
          <p className="mono-label text-accent">{item.label}</p>
        </div>

        {!playing && (
          <button
            type="button"
            aria-label={playLabel}
            onClick={() => {
              onActivate();
              const video = videoRef.current;
              if (!video) return;
              video.muted = true;
              video.play().catch(() => undefined);
            }}
            className="absolute inset-0 z-[2] flex items-center justify-center bg-ink-950/25 transition-colors hover:bg-ink-950/10"
          >
            <span className="flex h-12 w-12 items-center justify-center bg-accent text-accent-fg sm:h-14 sm:w-14">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </article>
  );
}

export function SocialVideosCarousel() {
  const t = useTranslations('SocialReels');
  const tc = useTranslations('Common');
  const socialReels = reelAssets.map((asset, index) => ({
    ...asset,
    label: (t.raw('reels') as { label: string }[])[index]?.label ?? `Reel ${index + 1}`,
  }));

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function goTo(index: number) {
    const next = (index + socialReels.length) % socialReels.length;
    setActive(next);
    const node = scrollerRef.current;
    const card = node?.querySelectorAll<HTMLElement>('[data-reel-card]')[next];
    card?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;

    function onScroll() {
      const cards = Array.from(node!.querySelectorAll<HTMLElement>('[data-reel-card]'));
      if (!cards.length) return;
      const center = node!.scrollLeft + node!.clientWidth / 2;
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      cards.forEach((card, i) => {
        const mid = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(mid - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActive(best);
    }

    node.addEventListener('scroll', onScroll, { passive: true });
    return () => node.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative">
      {/* Mobile masonry */}
      <ul className="columns-2 gap-3 md:hidden">
        {socialReels.map((item, index) => (
          <li key={item.src} className="mb-3 break-inside-avoid">
            <ReelCard
              item={item}
              active={active === index}
              onActivate={() => setActive(index)}
              playLabel={tc('playVideo', { label: item.label })}
              aspectClass={MASONRY_ASPECTS[index % MASONRY_ASPECTS.length]}
            />
          </li>
        ))}
      </ul>

      {/* Desktop horizontal carousel */}
      <div className="relative hidden md:block">
        <div className="mb-6 flex items-center justify-end gap-2">
          <button
            type="button"
            aria-label={tc('previousVideo')}
            onClick={() => goTo(active - 1)}
            className="flex h-11 w-11 items-center justify-center bg-surface text-fg transition-colors hover:bg-accent hover:text-accent-fg"
          >
            <Icon name="arrow-right" size={18} className="rotate-180" />
          </button>
          <button
            type="button"
            aria-label={tc('nextVideo')}
            onClick={() => goTo(active + 1)}
            className="flex h-11 w-11 items-center justify-center bg-surface text-fg transition-colors hover:bg-accent hover:text-accent-fg"
          >
            <Icon name="arrow-right" size={18} />
          </button>
        </div>

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {socialReels.map((item, index) => (
            <ReelCard
              key={item.src}
              item={item}
              active={active === index}
              onActivate={() => goTo(index)}
              playLabel={tc('playVideo', { label: item.label })}
              className="w-[18rem] shrink-0 snap-center"
            />
          ))}
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          {socialReels.map((item, i) => (
            <button
              key={item.src}
              type="button"
              aria-label={tc('goToVideo', { label: item.label })}
              aria-current={i === active}
              onClick={() => goTo(i)}
              className={`h-1.5 transition-all duration-300 ${
                i === active ? 'w-8 bg-accent' : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
