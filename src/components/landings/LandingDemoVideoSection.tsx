'use client';

import { useEffect, useRef } from 'react';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { useLandingVideoSync } from './LandingVideoSync';

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  videoSrc: string;
  posterSrc: string;
};

export function LandingDemoVideoSection({
  eyebrow,
  title,
  description,
  videoSrc,
  posterSrc,
}: Props) {
  const sync = useLandingVideoSync();
  const localRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const video = localRef.current;
    const section = sectionRef.current;
    if (video) sync?.registerVideo('demo', video);
    if (section) sync?.registerSection('demo', section);
    return () => {
      sync?.registerVideo('demo', null);
      sync?.registerSection('demo', null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoSrc]);

  return (
    <Section tone="dark" id="demo" density="compact">
      <div ref={sectionRef}>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="center"
          titleClass="text-4xl sm:text-5xl lg:text-6xl"
        />
        <Reveal className="mt-8 overflow-hidden border border-line bg-ink-950 shadow-panel">
          <div className="relative aspect-video w-full">
            <video
              ref={localRef}
              controls
              playsInline
              preload="auto"
              muted
              poster={posterSrc}
              className="h-full w-full object-cover"
              onPlay={(e) => {
                if (e.isTrusted) sync?.onUserPlay('demo');
              }}
              onPause={(e) => {
                if (e.isTrusted) sync?.onUserPause('demo');
              }}
              onVolumeChange={() => {
                if (localRef.current && !localRef.current.muted) {
                  sync?.unlockSound();
                }
              }}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
