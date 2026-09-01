'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Eyebrow } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';
import { DualCtas } from './DualCtas';
import { useLandingVideoSync } from './LandingVideoSync';
import type { LandingHeroContent } from '@/lib/landings/types';

type Props = LandingHeroContent & {
  /** Imagen de fondo del hero (prioridad sobre video) */
  backgroundSrc?: string;
  /** Oscurece un poco más el fondo (p. ej. inmobiliarias) */
  backgroundDim?: boolean;
  /** Video de fondo ambiental (si no hay backgroundSrc) */
  videoSrc?: string;
  posterSrc: string;
  /** Video del panel derecho (reemplaza la imagen estática) */
  sideVideoSrc?: string;
  sidePosterSrc?: string;
  whatsappMessage: string;
  onWhatsApp: () => void;
  onSchedule: () => void;
};

function withHighlight(text: string, highlight?: string) {
  if (!highlight || !text.includes(highlight)) return text;
  const [before, ...rest] = text.split(highlight);
  const after = rest.join(highlight);
  return (
    <>
      {before}
      <span className="text-accent">{highlight}</span>
      {after}
    </>
  );
}

function impactMetric(stat: string) {
  const match = stat.match(/(\d+)\s*%/);
  return match ? `+${match[1]}%` : null;
}

export function LandingHeroVideo({
  eyebrow,
  headline,
  headlineHighlight,
  subheadline,
  impactStat,
  impactStatHighlight,
  calculatorLinkLabel,
  sideCaption,
  backgroundSrc,
  backgroundDim = false,
  posterSrc,
  videoSrc,
  sideVideoSrc,
  sidePosterSrc,
  whatsappMessage,
  onWhatsApp,
  onSchedule,
}: Props) {
  const sidePoster = sidePosterSrc ?? posterSrc;
  const localRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const sync = useLandingVideoSync();
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const metric = impactMetric(impactStat);

  useEffect(() => {
    const section = sectionRef.current;
    const el = localRef.current;
    if (section) sync?.registerSection('hero', section);
    if (!sideVideoSrc || !el) return;

    sync?.registerVideo('hero', el);

    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;
    el.autoplay = true;

    const play = () => {
      void el.play().then(
        () => setPlaying(true),
        () => undefined
      );
    };
    if (el.readyState >= 2) play();
    else {
      el.addEventListener('loadeddata', play, { once: true });
      el.load();
    }

    return () => {
      sync?.registerVideo('hero', null);
      sync?.registerSection('hero', null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sideVideoSrc]);

  function startFromBeginning() {
    const el = localRef.current;
    if (!el) return;
    el.muted = false;
    el.volume = 1;
    el.currentTime = 0;
    setEnded(false);
    setPlaying(true);
    sync?.unlockSound();
    sync?.onUserPlay('hero');
    el.play().catch(() => setPlaying(false));
  }

  return (
    <section
      ref={sectionRef}
      className="theme-dark relative overflow-hidden bg-ink-950 text-fg grain lg:min-h-[88vh]"
    >
      <div className="absolute inset-0">
        {backgroundSrc ? (
          <Image
            src={backgroundSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            className={
              backgroundDim
                ? 'object-cover object-[center_35%] brightness-[0.62] contrast-[1.05] saturate-[0.95] sm:object-[center_40%] lg:object-[center_45%]'
                : 'object-cover object-[center_28%] brightness-[0.96] contrast-[1.08] saturate-[1.12] sm:object-[center_35%] lg:object-[center_42%]'
            }
          />
        ) : videoSrc ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={posterSrc}
            className="h-full w-full object-cover opacity-75"
            aria-hidden="true"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={posterSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-75"
          />
        )}

        <div
          className={
            backgroundDim
              ? 'absolute inset-0 bg-[linear-gradient(105deg,rgba(17,17,17,0.96)_0%,rgba(17,17,17,0.82)_40%,rgba(17,17,17,0.55)_70%,rgba(17,17,17,0.35)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(17,17,17,0.9)_0%,rgba(17,17,17,0.72)_42%,rgba(17,17,17,0.92)_100%)]'
              : 'absolute inset-0 bg-[linear-gradient(105deg,rgba(17,17,17,0.94)_0%,rgba(17,17,17,0.72)_38%,rgba(17,17,17,0.28)_68%,rgba(17,17,17,0.08)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(17,17,17,0.82)_0%,rgba(17,17,17,0.58)_42%,rgba(17,17,17,0.88)_100%)]'
          }
          aria-hidden="true"
        />
        <div
          className={
            backgroundDim
              ? 'absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/20 to-ink-950/35 max-lg:from-ink-950/92'
              : 'absolute inset-0 bg-gradient-to-t from-ink-950/75 via-transparent to-ink-950/15 max-lg:from-ink-950/90'
          }
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_38%,rgba(2,195,154,0.1),transparent_52%)]"
          aria-hidden="true"
        />
      </div>

      <div className="pointer-events-none absolute right-5 top-1/2 z-[1] hidden -translate-y-1/2 rotate-90 lg:block">
        <span className="mono-label text-faint">{eyebrow}</span>
      </div>

      <div className="container-x relative z-[1] grid gap-y-6 gap-x-14 py-10 pb-16 [grid-template-areas:'intro''media''rest'] sm:gap-y-8 sm:py-14 sm:pb-20 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center lg:py-20 lg:pb-20 lg:[grid-template-areas:'intro_media''rest_media']">
        <Reveal className="[grid-area:intro] flex flex-col justify-end border-l-2 border-accent/70 pl-4 sm:pl-6 lg:justify-center lg:pl-10">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-4 max-w-2xl text-[1.75rem] leading-[1.06] drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)] sm:mt-5 sm:text-4xl sm:leading-[1.04] lg:text-[3.35rem]">
            {withHighlight(headline, headlineHighlight)}
          </h1>
        </Reveal>

        <Reveal
          delay={120}
          className="[grid-area:media] flex justify-center px-1 sm:px-0 lg:self-center"
        >
          <div className="relative mx-auto w-full max-w-[320px] sm:max-w-[360px] lg:w-fit lg:max-w-none">
            <div
              className="pointer-events-none absolute -inset-4 bg-[radial-gradient(ellipse_at_center,rgba(2,195,154,0.18),transparent_68%)] blur-2xl lg:-inset-6"
              aria-hidden="true"
            />
            <div className="relative">
              <span
                className="pointer-events-none absolute -left-1.5 -top-1.5 z-[1] h-8 w-8 border-l-2 border-t-2 border-accent sm:-left-2 sm:-top-2 sm:h-10 sm:w-10"
                aria-hidden="true"
              />
              <span
                className="pointer-events-none absolute -bottom-1.5 -right-1.5 z-[1] h-8 w-8 border-b-2 border-r-2 border-accent sm:-bottom-2 sm:-right-2 sm:h-10 sm:w-10"
                aria-hidden="true"
              />

              <div className="relative mx-auto aspect-[9/16] w-full overflow-hidden border border-white/10 bg-ink-950 shadow-panel lg:h-[min(68vh,640px)] lg:w-auto">
                {sideVideoSrc ? (
                  <>
                    <video
                      ref={localRef}
                      autoPlay
                      muted
                      playsInline
                      preload="auto"
                      poster={sidePoster}
                      controls
                      controlsList="nodownload"
                      className="h-full w-full object-contain"
                      aria-label={sideCaption ?? 'Testimonio'}
                      onEnded={() => {
                        setPlaying(false);
                        setEnded(true);
                      }}
                      onPlay={(e) => {
                        setPlaying(true);
                        setEnded(false);
                        if (e.isTrusted) sync?.onUserPlay('hero');
                      }}
                      onPause={(e) => {
                        setPlaying(false);
                        if (e.isTrusted) sync?.onUserPause('hero');
                      }}
                      onVolumeChange={() => {
                        if (localRef.current && !localRef.current.muted) {
                          sync?.unlockSound();
                        }
                      }}
                    >
                      <source src={sideVideoSrc} type="video/mp4" />
                    </video>

                    {ended && (
                      <button
                        type="button"
                        onClick={startFromBeginning}
                        className="absolute inset-x-0 bottom-0 z-[2] flex justify-center bg-gradient-to-t from-ink-950/90 to-transparent p-5 pt-16"
                      >
                        <span className="border border-white/15 bg-white/10 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                          Volver a ver
                        </span>
                      </button>
                    )}

                    {sync?.soundBlocked ? (
                      <button
                        type="button"
                        onClick={() => {
                          sync.unlockSound();
                          const el = localRef.current;
                          if (el) {
                            el.muted = false;
                            el.volume = 1;
                            void el.play();
                            setPlaying(true);
                          }
                        }}
                        className="absolute inset-x-0 bottom-0 z-[2] flex justify-center bg-gradient-to-t from-ink-950/80 to-transparent p-4 pt-14"
                      >
                        <span className="bg-accent px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent-fg">
                          Activar sonido
                        </span>
                      </button>
                    ) : null}
                  </>
                ) : (
                  <Image
                    src={sidePoster}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 1024px) 80vw, 380px"
                    className="object-contain"
                  />
                )}
              </div>
            </div>

            {sideCaption ? (
              <p className="mono-label mt-4 text-center text-faint">{sideCaption}</p>
            ) : null}
          </div>
        </Reveal>

        <Reveal className="[grid-area:rest] flex flex-col justify-start border-l-2 border-accent/70 pl-4 sm:pl-6 lg:pl-10">
          {metric ? (
            <div className="flex flex-col gap-3 border-t border-line/80 pt-5 sm:flex-row sm:items-end sm:gap-8 sm:pt-6">
              <div className="shrink-0">
                <p className="font-display text-4xl font-bold leading-none text-accent sm:text-5xl lg:text-6xl">
                  {metric}
                  {impactStatHighlight ? (
                    <>
                      {' '}
                      <span className="uppercase">{impactStatHighlight}</span>
                    </>
                  ) : null}
                </p>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-white/70 sm:text-[15px] sm:text-white/65">
                {withHighlight(impactStat, impactStatHighlight)}
              </p>
            </div>
          ) : (
            <p className="max-w-lg border-t border-line/80 pt-5 text-sm leading-relaxed text-white/70 sm:pt-6 sm:text-[15px]">
              {withHighlight(impactStat, impactStatHighlight)}
            </p>
          )}

          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:mt-6 sm:text-lg sm:text-white/75">
            {subheadline}
          </p>

          <div className="mt-6 sm:mt-8">
            <DualCtas
              whatsappMessage={whatsappMessage}
              onWhatsApp={onWhatsApp}
              onSchedule={onSchedule}
            />
          </div>

          <p className="mt-4 sm:mt-5">
            <a
              href="#calculadora"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent link-underline hover:text-white"
            >
              {calculatorLinkLabel}
              <Icon name="arrow-right" size={14} />
            </a>
          </p>
        </Reveal>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 z-[1] flex -translate-x-1/2 items-center gap-2 pb-[env(safe-area-inset-bottom)] text-faint sm:bottom-6">
        <Icon name="chevron-down" size={16} className="animate-bounce" />
        <span className="mono-label">Explorar</span>
      </div>
    </section>
  );
}
