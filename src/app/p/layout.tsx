import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { brand, body, display } from '@/lib/fonts';

export const metadata: Metadata = { title: 'Cluster' };

export default function PublishedLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${brand.variable}`}>
      <body className="bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
