import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Frame } from '@/components/academia/Frame';
import { brand, body, display, mono } from '@/lib/fonts';
import { getPerson } from '@/lib/valux/data';
import { academiaPersonId } from '@/lib/valux/session';

export const metadata: Metadata = { title: 'Academia · Cluster' };

export default async function AcademiaLayout({ children }: { children: ReactNode }) {
  const person = await getPerson(await academiaPersonId());
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${mono.variable} ${brand.variable}`}>
      <body suppressHydrationWarning className="bg-paper font-sans text-ink antialiased">
        <Frame name={person ? person.name || person.email : null}>{children}</Frame>
      </body>
    </html>
  );
}
