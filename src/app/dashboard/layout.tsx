import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { brand, body, display, mono } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'Cluster CRM',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${mono.variable} ${brand.variable}`}>
      <body suppressHydrationWarning className="bg-paper font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
