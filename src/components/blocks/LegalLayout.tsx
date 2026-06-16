import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/Section';

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 pt-36 pb-16 sm:pt-44">
        <div
          className="absolute inset-0 bg-grid-fade [background-size:64px_64px] opacity-30 [mask-image:radial-gradient(60%_60%_at_30%_0%,black,transparent)]"
          aria-hidden="true"
        />
        <div className="container-x relative z-[1] max-w-3xl">
          <Eyebrow>Legal</Eyebrow>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 font-mono text-sm text-faint">
            Última actualización: {updated}
          </p>
        </div>
      </section>

      <section className="bg-ink-900 py-16 sm:py-20">
        <div className="container-x max-w-3xl">
          <div className="space-y-8 text-[15px] leading-relaxed text-muted [&_a]:text-accent [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-fg [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
            {children}
          </div>
        </div>
      </section>
    </>
  );
}
