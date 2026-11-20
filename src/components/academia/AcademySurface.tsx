'use client';

import type { ReactNode } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { VStack } from '@astryxdesign/core/VStack';
import { themes, defaultThemeSlug } from '../../astryx-themes';

export function AcademySurface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <Theme theme={themes[defaultThemeSlug]} mode="light"><VStack className={`font-brand text-ink ${className}`}>{children}</VStack></Theme>;
}
