'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * Poster as LCP on all viewports. Video only on desktop after idle so
 * mobile doesn't download 2–4 MB before the first paint settles.
 */
export function HeroMedia() {
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(
      '(min-width: 768px) and (prefers-reduced-motion: no-preference)'
    );

    const enable = () => {
      if (mq.matches) setPlayVideo(true);
    };

    let idleId: number | undefined;
    let timeoutId: number | undefined;

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(enable, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(enable, 1200);
    }

    const onChange = () => {
      if (!mq.matches) setPlayVideo(false);
      else enable();
    };
    mq.addEventListener('change', onChange);

    return () => {
      mq.removeEventListener('change', onChange);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
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
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/assets/hero-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        >
          <source src="/assets/hero.webm" type="video/webm" />
          <source src="/assets/hero.mp4" type="video/mp4" />
        </video>
      ) : null}
    </>
  );
}
