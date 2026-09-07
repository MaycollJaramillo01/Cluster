'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type LandingVideoSlot = 'hero' | 'demo';

type SlotState = {
  video: HTMLVideoElement | null;
  section: HTMLElement | null;
  userPaused: boolean;
};

type SyncContextValue = {
  enabled: boolean;
  soundBlocked: boolean;
  unlockSound: () => void;
  registerVideo: (slot: LandingVideoSlot, el: HTMLVideoElement | null) => void;
  registerSection: (slot: LandingVideoSlot, el: HTMLElement | null) => void;
  onUserPlay: (slot: LandingVideoSlot) => void;
  onUserPause: (slot: LandingVideoSlot) => void;
};

const LandingVideoSyncContext = createContext<SyncContextValue | null>(null);

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function visibilityScore(el: HTMLElement | null) {
  if (!el) return 0;
  const rect = el.getBoundingClientRect();
  if (rect.height <= 0) return 0;
  const vh = window.innerHeight || 1;
  const center = rect.top + rect.height / 2;
  const dist = Math.abs(center - vh * 0.42);
  return clamp01(1 - dist / (vh * 0.85));
}

type ProviderProps = {
  children: ReactNode;
  enabled?: boolean;
};

export function LandingVideoSyncProvider({
  children,
  enabled = true,
}: ProviderProps) {
  const slots = useRef<Record<LandingVideoSlot, SlotState>>({
    hero: { video: null, section: null, userPaused: false },
    demo: { video: null, section: null, userPaused: false },
  });
  const soundUnlocked = useRef(false);
  const [soundBlocked, setSoundBlocked] = useState(true);
  const raf = useRef(0);
  const applying = useRef(false);

  const unlockSound = useCallback(() => {
    soundUnlocked.current = true;
    setSoundBlocked(false);
    for (const slot of ['hero', 'demo'] as const) {
      const video = slots.current[slot].video;
      if (!video) continue;
      video.muted = false;
      if (video.volume < 0.05) video.volume = slot === 'hero' ? 1 : video.volume;
    }
  }, []);

  const ensurePlaying = useCallback(async (video: HTMLVideoElement) => {
    if (!video.paused || video.ended) return true;
    // Autoplay fiable: siempre muted primero
    if (!soundUnlocked.current) {
      video.muted = true;
    }
    try {
      await video.play();
      return true;
    } catch {
      video.muted = true;
      try {
        await video.play();
        return true;
      } catch {
        return false;
      }
    }
  }, []);

  const syncVolumes = useCallback(() => {
    if (!enabled || applying.current) return;
    applying.current = true;

    const hero = slots.current.hero;
    const demo = slots.current.demo;
    const heroScore = visibilityScore(hero.section);
    const demoScore = visibilityScore(demo.section);

    const cross = clamp01((demoScore - 0.12) / 0.55);
    const heroVol = clamp01(1 - cross);
    const demoVol = clamp01(cross);

    if (hero.video && !hero.userPaused && !hero.video.ended) {
      hero.video.volume = heroVol;
      if (!soundUnlocked.current) {
        hero.video.muted = true;
      } else {
        hero.video.muted = heroVol < 0.02;
      }
      if (heroVol > 0.08) {
        void ensurePlaying(hero.video);
      }
    }

    if (demo.video && !demo.userPaused && !demo.video.ended) {
      demo.video.volume = Math.max(demoVol, 0.01);
      if (!soundUnlocked.current) {
        demo.video.muted = true;
      } else {
        demo.video.muted = demoVol < 0.05;
      }
      if (demoVol > 0.15) {
        void ensurePlaying(demo.video);
      } else if (demoVol < 0.05 && !demo.video.paused) {
        demo.video.pause();
      }
    }

    applying.current = false;
  }, [enabled, ensurePlaying]);

  const scheduleSync = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(syncVolumes);
  }, [syncVolumes]);

  useEffect(() => {
    if (!enabled) return;
    const onScroll = () => scheduleSync();
    const onResize = () => scheduleSync();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    scheduleSync();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf.current);
    };
  }, [enabled, scheduleSync]);

  // Primer gesto del usuario desbloquea audio (política de browsers)
  useEffect(() => {
    if (!enabled) return;
    const unlock = () => unlockSound();
    window.addEventListener('pointerdown', unlock, { once: true, passive: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [enabled, unlockSound]);

  const registerVideo = useCallback(
    (slot: LandingVideoSlot, el: HTMLVideoElement | null) => {
      slots.current[slot].video = el;
      if (!el || !enabled) return;

      el.playsInline = true;
      el.loop = false;
      el.setAttribute('playsinline', '');
      el.setAttribute('webkit-playsinline', '');

      if (slot === 'hero') {
        // Autoplay garantizado: muted → visible siempre; sonido al primer toque
        el.muted = true;
        el.defaultMuted = true;
        el.volume = 1;
        void el.play().then(
          () => {
            setSoundBlocked(true);
            scheduleSync();
          },
          () => {
            // Reintento tras canplay
            const retry = () => {
              el.muted = true;
              void el.play().finally(scheduleSync);
            };
            el.addEventListener('canplay', retry, { once: true });
            el.load();
          }
        );
      }

      scheduleSync();
    },
    [enabled, scheduleSync]
  );

  const registerSection = useCallback(
    (slot: LandingVideoSlot, el: HTMLElement | null) => {
      slots.current[slot].section = el;
      if (el) scheduleSync();
    },
    [scheduleSync]
  );

  const onUserPlay = useCallback(
    (slot: LandingVideoSlot) => {
      slots.current[slot].userPaused = false;
      unlockSound();
      if (slot === 'demo') {
        const hero = slots.current.hero.video;
        if (hero && !hero.paused) {
          hero.pause();
          slots.current.hero.userPaused = true;
        }
        const demo = slots.current.demo.video;
        if (demo) {
          demo.muted = false;
          demo.volume = 1;
        }
      }
      if (slot === 'hero') {
        const demo = slots.current.demo.video;
        if (demo && !demo.paused) {
          demo.pause();
          slots.current.demo.userPaused = true;
        }
        const hero = slots.current.hero.video;
        if (hero) {
          hero.muted = false;
          hero.volume = 1;
        }
      }
      scheduleSync();
    },
    [scheduleSync, unlockSound]
  );

  const onUserPause = useCallback(
    (slot: LandingVideoSlot) => {
      if (applying.current) return;
      const video = slots.current[slot].video;
      if (video && video.paused && !video.ended) {
        slots.current[slot].userPaused = true;
      }
      scheduleSync();
    },
    [scheduleSync]
  );

  const value = useMemo<SyncContextValue>(
    () => ({
      enabled,
      soundBlocked,
      unlockSound,
      registerVideo,
      registerSection,
      onUserPlay,
      onUserPause,
    }),
    [
      enabled,
      soundBlocked,
      unlockSound,
      registerVideo,
      registerSection,
      onUserPlay,
      onUserPause,
    ]
  );

  return (
    <LandingVideoSyncContext.Provider value={value}>
      {children}
    </LandingVideoSyncContext.Provider>
  );
}

export function useLandingVideoSync() {
  return useContext(LandingVideoSyncContext);
}

export function LandingSoundUnlockBanner() {
  const sync = useLandingVideoSync();
  if (!sync?.enabled || !sync.soundBlocked) return null;

  return (
    <button
      type="button"
      onClick={sync.unlockSound}
      className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 border border-accent/40 bg-accent px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-fg shadow-panel md:bottom-8"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
      </svg>
      Activar sonido
    </button>
  );
}
