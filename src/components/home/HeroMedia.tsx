'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * Poster paints first (LCP). Video mounts after idle on all viewports
 * so the heavy download doesn't block the initial paint.
 */
export function HeroMedia() {
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) return;

    const enable = () => setPlayVideo(true);

    let idleId: number | undefined;
    let timeoutId: number | undefined;

    // Delay so LCP can settle on the poster before fetching 2–4 MB of video.
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(enable, { timeout: 3000 });
    } else {
      timeoutId = window.setTimeout(enable, 2000);
    }

    return () => {
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
