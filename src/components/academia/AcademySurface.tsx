'use client';

import type { ReactNode } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { VStack } from '@astryxdesign/core/VStack';
import { themes } from '../../astryx-themes';

export function AcademyTheme({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <Theme theme={themes['cluster-academia']} mode="light">
      <VStack gap={0} className={`academy-theme ${className}`}>{children}</VStack>
    </Theme>
  );
}

export function AcademySurface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <VStack className={className}>{children}</VStack>;
}
