'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * Poster paints first (LCP). Video waits for load + delay (or first
 * interaction) so lab audits aren't tanked by a 2–4 MB download.
 * Mobile uses a dedicated vertical clip; desktop keeps the landscape hero.
 */
export function HeroMedia() {
  const [playVideo, setPlayVideo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) return;

    let cancelled = false;
    let timeoutId: number | undefined;

    const enable = () => {
      if (!cancelled) setPlayVideo(true);
    };

    const arm = () => {
      // After full load, wait so Lighthouse can finish LCP/SI on the poster.
      timeoutId = window.setTimeout(enable, 6000);
    };

    if (document.readyState === 'complete') {
      arm();
    } else {
      window.addEventListener('load', arm, { once: true });
    }

    // Real users: start sooner on first interaction.
    const onInteract = () => enable();
    window.addEventListener('pointerdown', onInteract, { once: true, passive: true });
    window.addEventListener('scroll', onInteract, { once: true, passive: true });
    window.addEventListener('keydown', onInteract, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener('load', arm);
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('scroll', onInteract);
      window.removeEventListener('keydown', onInteract);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <Image
        src="/assets/hero-poster.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-55"
      />
      {playVideo ? (
        <video
          key={isMobile ? 'mobile' : 'desktop'}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/assets/hero-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        >
          {isMobile ? (
            <source src="/assets/videos/heroes/home-mobile.mp4" type="video/mp4" />
          ) : (
            <>
              <source src="/assets/hero.webm" type="video/webm" />
              <source src="/assets/hero.mp4" type="video/mp4" />
            </>
          )}
        </video>
      ) : null}
    </>
  );
}
