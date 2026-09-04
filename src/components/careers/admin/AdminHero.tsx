'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { PageHero } from '@/components/blocks/PageHero';

export function AdminHero({
  title,
  subtitle,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  const t = useTranslations('CareersAdmin');
  return (
    <PageHero
      videoSrc="/assets/videos/heroes/branding.mp4"
      eyebrow={t('heroEyebrow')}
      title={title}
      subtitle={subtitle}
      hideCtas
    >
      {children}
    </PageHero>
  );
}
