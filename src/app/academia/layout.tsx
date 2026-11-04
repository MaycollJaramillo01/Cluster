import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Frame } from '@/components/academia/Frame';
import { brand, body, display, mono } from '@/lib/fonts';

export const metadata: Metadata = { title: 'Academia · Cluster' };

export default function AcademiaLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${mono.variable} ${brand.variable}`}>
      <body suppressHydrationWarning className="bg-paper font-sans text-ink antialiased">
        <Frame>{children}</Frame>
      </body>
    </html>
  );
}
