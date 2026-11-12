'use client';

import { useEffect, useRef, useState } from 'react';
import { BookingWidget } from '@/components/blocks/BookingWidget';
import { Icon } from '@/components/ui/Icon';
import { trackEvent } from '@/lib/analytics';
import base from './PodcastSite.module.css';
import styles from './Participacion.module.css';

// The poster image paints first; the loop starts after load. Portrait screens get
// the vertical cut. Skipped for reduced motion / data saver; a blocked autoplay
// (iOS low power mode) simply leaves the poster.
export function HeroVideo() {
  const [src, setSrc] = useState<string | null>(null);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = () => setSrc(matchMedia('(orientation: portrait)').matches
      ? '/assets/podcast/participacion-hero-mobile.mp4'
      : '/assets/podcast/participacion-hero.mp4');
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => window.removeEventListener('load', start);
  }, []);

  useEffect(() => {
    if (src) ref.current?.play().catch(() => setSrc(null));
  }, [src]);

  if (!src) return null;
  return (
    <video
      ref={ref}
      className={styles.heroVideo}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
      onPlaying={(event) => { event.currentTarget.dataset.playing = 'true'; }}
    />
  );
}

// The GoHighLevel calendar is heavy, so it mounts after the page's load event.
// Not `loading="lazy"`: GHL's embed script parks the iframe off-screen until it
// loads, so a lazy iframe never starts.
export function DeferredBooking() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const start = () => setReady(true);
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => window.removeEventListener('load', start);
  }, []);

  return ready ? <BookingWidget /> : null;
}

// Page-level client behaviour: one delegated listener for every [data-track] link,
// and the WhatsApp float, hidden while a [data-wa-hide] element (CTA rows, the
// calendar) sits in the bottom strip where the float lives, so it never covers them.
export function PageLayer({ whatsappHref }: { whatsappHref: string }) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLElement>('[data-track]');
      if (link?.dataset.track) trackEvent(link.dataset.track, { location: link.dataset.trackLocation });
    };
    document.addEventListener('click', onClick);

    const onScreen = new Set<Element>();
    // ponytail: strip measured once; recreate on resize if rotations ever matter.
    const strip = Math.max(0, window.innerHeight - 140);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target);
        else onScreen.delete(entry.target);
      }
      setHidden(onScreen.size > 0);
    }, { rootMargin: `-${strip}px 0px 0px 0px` });
    document.querySelectorAll('[data-wa-hide]').forEach((node) => observer.observe(node));

    return () => {
      document.removeEventListener('click', onClick);
      observer.disconnect();
    };
  }, []);

  return (
    <a
      className={`${base.waFloat} ${styles.waToggle}`}
      data-hidden={hidden}
      href={whatsappHref}
      target="_blank"
      rel="noreferrer"
      aria-label="Hablar con Cluster Podcast por WhatsApp"
      data-track="participacion_whatsapp_click"
      data-track-location="flotante"
    >
      <Icon name="whatsapp" size={25} />
    </a>
  );
}
