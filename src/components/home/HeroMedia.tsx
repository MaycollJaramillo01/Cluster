'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';


export function HeroMedia() {
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) return;

    const enable = () => setPlayVideo(true);

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(enable, { timeout: 3000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(enable, 2000);
    return () => window.clearTimeout(timeoutId);
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
