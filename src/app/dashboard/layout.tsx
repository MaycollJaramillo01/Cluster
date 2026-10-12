import type { Metadata } from 'next';
import { Bebas_Neue, DM_Sans, IBM_Plex_Mono, Montserrat } from 'next/font/google';
import type { ReactNode } from 'react';

const display = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: '400',
});

const body = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const brand = Montserrat({
  subsets: ['latin'],
  variable: '--font-brand',
  display: 'swap',
  weight: ['300', '800'],
});

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
