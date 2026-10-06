'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { trackEvent } from '@/lib/analytics';
import { readLandingAttribution } from '@/lib/attribution';
import { whatsappLink } from '@/lib/site';
import type { ChatMessage, GrowthVideo, HeroVideo as HeroVideoSource } from './content';
import s from './GrowthLanding.module.css';

/** Lo único que las piezas interactivas necesitan saber de la vertical. */
export type GrowthCtx = { slug: string; campaignId: string; whatsappMessage: string };

function attribution(ctx: GrowthCtx) {
  return readLandingAttribution({
    vertical: ctx.slug,
    country: '',
    landing: `/crecimiento/${ctx.slug}`,
  });
}

// El mensaje precargado lleva la referencia de campaña: GHL etiqueta por ese texto
// y Alex no tiene que volver a preguntar de qué industria viene el prospecto.
function whatsappUrl(ctx: GrowthCtx, attr?: ReturnType<typeof attribution>) {
  const ref = [ctx.campaignId, attr?.source, attr?.utm_campaign.slice(0, 80)]
    .filter(Boolean)
    .join(' | ');
  return whatsappLink(`${ctx.whatsappMessage}\n\nRef: ${ref}`);
}

function track(ctx: GrowthCtx, name: string, extra: Record<string, string | number> = {}) {
  trackEvent(name, {
    ...attribution(ctx),
    offer: 'garantia',
    campaign_id: ctx.campaignId,
    timestamp: new Date().toISOString(),
    ...extra,
  });
}

/** Todos los CTA comerciales van al mismo destino: WhatsApp / Alex. */
export function WhatsAppCta({
  ctx,
  cta,
  className,
  children,
}: {
  ctx: GrowthCtx;
  /** Posición del botón, para saber cuál convierte. */
  cta: string;
  className?: string;
  children: ReactNode;
}) {
  const [href, setHref] = useState(() => whatsappUrl(ctx));

  useEffect(() => setHref(whatsappUrl(ctx, attribution(ctx))), [ctx]);

  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        track(ctx, 'cta_qualification_click', { cta });
        track(ctx, 'whatsapp_click', { cta });
        // Un clic a WhatsApp es un contacto, no un lead ni una venta.
        window.fbq?.('track', 'Contact', { content_name: ctx.slug });
      }}
    >
      {children}
    </a>
  );
}

/** Video de fondo del hero: decorativo, sin sonido y con control de pausa. */
export function HeroVideo({ src, poster }: HeroVideoSource) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) ref.current?.pause();
  }, []);

  return (
    <>
      <video
        ref={ref}
        className={s.heroVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        aria-hidden="true"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className={s.heroTint} aria-hidden="true" />
      <button
        type="button"
        className={s.heroMedia}
        onClick={() => {
          const video = ref.current;
          if (!video) return;
          if (video.paused) void video.play();
          else video.pause();
        }}
        aria-label={playing ? 'Pausar video de fondo' : 'Reproducir video de fondo'}
      >
        <Icon name={playing ? 'pause' : 'play'} size={13} fill="currentColor" strokeWidth={0} />
        {playing ? 'Pausar' : 'Reproducir'}
      </button>
    </>
  );
}

/** Scroll, FAQ, casos, animaciones de entrada y visibilidad del CTA fijo. No pinta nada. */
export function GrowthRuntime({ ctx }: { ctx: GrowthCtx }) {
  useEffect(() => {
    const root = document.getElementById('crecimiento');
    if (!root) return;
    root.dataset.js = '';
    window.fbq?.('track', 'ViewContent', { content_name: ctx.slug, content_category: 'garantia' });

    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const node = entry.target as HTMLElement;
          node.dataset.in = '';
          if (node.dataset.viewEvent) track(ctx, node.dataset.viewEvent);
          reveal.unobserve(node);
        }),
      { threshold: 0.12 },
    );
    root.querySelectorAll('[data-reveal]').forEach((node) => reveal.observe(node));

    // El CTA fijo se oculta mientras haya otro CTA principal (o el pie) en pantalla.
    const blockers = new Set<Element>();
    const sticky = new IntersectionObserver((entries) => {
      entries.forEach((entry) =>
        entry.isIntersecting ? blockers.add(entry.target) : blockers.delete(entry.target),
      );
      root.toggleAttribute('data-sticky', blockers.size === 0);
    });
    root.querySelectorAll('[data-hide-sticky]').forEach((node) => sticky.observe(node));

    const marks = [25, 50, 75];
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const depth = max > 0 ? (window.scrollY / max) * 100 : 0;
      while (marks.length && depth >= marks[0]) track(ctx, `scroll_${marks.shift()}`);
      if (!marks.length) window.removeEventListener('scroll', onScroll);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // `toggle` no burbujea: se escucha en captura.
    const onToggle = (event: Event) => {
      const details = event.target;
      if (details instanceof HTMLDetailsElement && details.open) {
        track(ctx, 'faq_open', { question: details.querySelector('summary')?.textContent ?? '' });
      }
    };
    root.addEventListener('toggle', onToggle, true);

    return () => {
      reveal.disconnect();
      sticky.disconnect();
      window.removeEventListener('scroll', onScroll);
      root.removeEventListener('toggle', onToggle, true);
    };
  }, [ctx]);

  return null;
}

const speaker = { prospect: 'Prospecto', alex: 'Alex', followup: 'Seguimiento' };

/** Conversación tipo WhatsApp: los mensajes entran uno a uno la primera vez que se ve. */
export function Conversation({
  title,
  subtitle,
  messages,
  outcome,
}: {
  title: string;
  subtitle: string;
  messages: ChatMessage[];
  outcome: string[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Sin JS o con movimiento reducido la conversación se muestra completa.
  const [shown, setShown] = useState(messages.length);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setShown(0);
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        let index = 0;
        const next = () => {
          index += 1;
          setShown(index);
          if (index < messages.length) timer = window.setTimeout(next, 1100);
        };
        timer = window.setTimeout(next, 350);
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [messages.length]);

  return (
    <div className={s.chatWrap}>
      <div className={s.chat} ref={ref}>
        <div className={s.chatHeader}>
          <span className={s.chatBrand}>
            <Icon name="whatsapp" size={20} fill="currentColor" strokeWidth={0} />
          </span>
          <div>
            <b>{title}</b>
            <span>{subtitle}</span>
          </div>
        </div>
        <div className={s.chatBody} role="group" aria-label="Conversación de ejemplo en WhatsApp">
          {messages.map((message, index) =>
            message.from === 'note' ? (
              <p className={s.chatNote} data-on={index < shown ? '' : undefined} key={index}>
                {message.text}
              </p>
            ) : (
              <div
                className={`${s.bubble} ${s[message.from]}`}
                data-on={index < shown ? '' : undefined}
                key={index}
              >
                <p>{message.text}</p>
                <small>{speaker[message.from]}</small>
              </div>
            ),
          )}
        </div>
      </div>
      <ol className={s.outcome} data-done={shown >= messages.length ? '' : undefined}>
        {outcome.map((step, index) => (
          <li key={step} style={{ '--i': index } as CSSProperties}>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Video bajo demanda: no descarga nada hasta que el visitante pulsa reproducir. */
export function VerticalVideo({ ctx, video }: { ctx: GrowthCtx; video: GrowthVideo }) {
  const sent = useRef(new Set<string>());
  const once = (name: string) => {
    if (sent.current.has(name)) return;
    sent.current.add(name);
    track(ctx, name, { video: video.src });
  };

  return (
    <video
      className={s.video}
      controls
      playsInline
      preload="none"
      poster={video.poster}
      aria-label={video.title}
      onPlay={() => once('video_start')}
      onTimeUpdate={(event) => {
        const { currentTime, duration } = event.currentTarget;
        if (duration && currentTime / duration >= 0.5) once('video_50');
      }}
      onEnded={() => once('video_complete')}
    >
      <source src={video.src} type="video/mp4" />
      {video.captions && (
        <track kind="captions" src={video.captions} srcLang="es" label="Español" default />
      )}
    </video>
  );
}
