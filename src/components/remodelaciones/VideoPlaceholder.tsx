'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';

type VideoPlaceholderProps = {
  src?: string | null;
};

export function VideoPlaceholder({ src }: VideoPlaceholderProps) {
  const t = useTranslations('Remodelaciones');

  return (
    <div className="relative aspect-video overflow-hidden border border-line bg-ink-950">
      {src ? (
        <video
          controls
          preload="none"
          playsInline
          className="h-full w-full object-cover"
          poster=""
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(70%_60%_at_50%_0%,rgba(2,195,154,0.16),transparent_55%),linear-gradient(160deg,#141414,#0E0E0E)] p-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center border border-accent/40 bg-accent/10 text-accent">
            <Icon name="arrow-right" size={28} />
          </span>
          <p className="mono-label mt-6 text-accent">{t('videoSoon')}</p>
          <p className="mt-3 max-w-md text-sm text-muted">{t('videoSoonText')}</p>
        </div>
      )}
    </div>
  );
}
