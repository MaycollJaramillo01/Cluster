'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';

export type SolutionVideo = {
  mp4: string;
  webm?: string;
  poster?: string;
};

type SolutionCardProps = {
  title: string;
  text: string;
  href: string;
  video?: SolutionVideo;
  index?: number;
};

export function SolutionCard({
  title,
  text,
  href,
  video,
  index = 0,
}: SolutionCardProps) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    if (!video) return;
    const node = mediaRef.current;
    if (!node) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) return;

    // Only mount/fetch video once the card is near the viewport.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlayVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px 0px', threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [video]);

  return (
    <Reveal
      delay={index * 70}
      className="group overflow-hidden bg-surface transition-all duration-300 hover:bg-surface-2"
    >
      <Link href={href} className="block h-full">
        <div
          ref={mediaRef}
          className="relative aspect-square overflow-hidden bg-ink-950"
        >
          {video?.poster ? (
            <Image
              src={video.poster}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="grain absolute inset-0" aria-hidden="true" />
          )}
          {video && playVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              poster={video.poster}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            >
              {video.webm && <source src={video.webm} type="video/webm" />}
              <source src={video.mp4} type="video/mp4" />
            </video>
          ) : null}
        </div>

        <div className="p-7">
          <h3 className="font-display text-lg font-semibold text-white">
            {title}
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-white/60">
            {text}
          </p>
        </div>
      </Link>
    </Reveal>
  );
}
