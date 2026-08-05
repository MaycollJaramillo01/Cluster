import type { Metadata } from 'next';
import { Section, Eyebrow } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { BookingWidget } from '@/components/blocks/BookingWidget';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { site, whatsappLink } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Agendar llamada | Cluster Media',
  description:
    'Agenda una llamada de diagnóstico con Cluster Media. Elige el día y la hora que mejor te funcionen.',
  alternates: { canonical: '/agendar' },
};

export default function AgendarPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          { name: 'Agendar llamada', url: `${site.url}/agendar` },
        ])}
      />

      <section className="relative overflow-hidden bg-ink-950 pt-36 pb-12 sm:pt-44 sm:pb-16">
        <div
          className="absolute inset-0 bg-grid-fade [background-size:64px_64px] opacity-40 [mask-image:radial-gradient(60%_60%_at_30%_0%,black,transparent)]"
          aria-hidden="true"
        />
        <div
          className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-surface blur-[120px]"
          aria-hidden="true"
        />
        <div className="container-x relative z-[1] mx-auto max-w-3xl text-center">
          <Reveal>
            <Eyebrow>Agenda</Eyebrow>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="mt-6 font-display text-4xl font-bold uppercase leading-[0.98] text-fg sm:text-5xl lg:text-6xl">
              Elige el día y la hora
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Reserva tu llamada de diagnóstico. Sin compromiso: revisamos tu
              negocio y te proponemos la mejor ruta.
            </p>
          </Reveal>
        </div>
      </section>

      <Section tone="light" className="pt-10 sm:pt-12">
        <Reveal className="mx-auto max-w-3xl overflow-hidden bg-surface">
          <BookingWidget />
        </Reveal>
      </Section>
    </>
  );
}
