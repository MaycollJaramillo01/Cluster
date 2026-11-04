import type { Metadata } from 'next';
import { Bebas_Neue, DM_Sans, Montserrat } from 'next/font/google';
import type { ReactNode } from 'react';

const display = Bebas_Neue({ subsets: ['latin'], variable: '--font-display', display: 'swap', weight: '400' });
const body = DM_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap', weight: ['400', '500'] });
const brand = Montserrat({ subsets: ['latin'], variable: '--font-brand', display: 'swap', weight: ['800'] });

export const metadata: Metadata = { title: 'Cluster' };

export default function PublishedLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${brand.variable}`}>
      <body className="bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
