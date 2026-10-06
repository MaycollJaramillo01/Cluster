import type { ReactNode } from 'react';
import { AnalyticsTags } from '@/components/clinicas-esteticas/AnalyticsTags';

// GTM / GA4 / Meta Pixel (NEXT_PUBLIC_GTM_ID, NEXT_PUBLIC_GA4_ID, NEXT_PUBLIC_META_PIXEL_ID).
export default function CrecimientoLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AnalyticsTags />
      {children}
    </>
  );
}
