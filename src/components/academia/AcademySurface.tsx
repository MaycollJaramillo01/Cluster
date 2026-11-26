'use client';

import type { ReactNode } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { VStack } from '@astryxdesign/core/VStack';
import { themes } from '../../astryx-themes';
import { academyBody, academyHeading } from '@/lib/academia-fonts';

export function AcademyTheme({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <VStack gap={0} className={`${academyBody.variable} ${academyHeading.variable} w-full`}>
      <Theme theme={themes['cluster-academia']} mode="light">
        <VStack gap={0} className={`academy-theme ${className}`}>{children}</VStack>
      </Theme>
    </VStack>
  );
}

export function AcademySurface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <VStack className={className}>{children}</VStack>;
}
