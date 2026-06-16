import type { Metadata } from 'next';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CTASection } from '@/components/blocks/CTASection';
import { FAQ } from '@/components/blocks/FAQ';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';
import {
  JsonLd,
  serviceSchema,
  faqSchema,
  breadcrumbSchema,
} from '@/components/seo/JsonLd';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Automatización de WhatsApp e IA para negocios',
  description:
    'Automatiza WhatsApp, Messenger, Instagram Inbox y el seguimiento de leads con agentes IA, CRM y workflows para negocios hispanos.',
  alternates: { canonical: '/automatizaciones-ia' },
};

const problems = [
  'Muchos mensajes sin responder',
  'Leads que se enfrían',
  'Clientes preguntando lo mismo',
  'Falta de seguimiento',
  'Citas mal coordinadas',
  'Vendedores desordenados',
  'Pérdida de oportunidades',
];

const solutions = [
  'Agentes IA',
  'WhatsApp automatizado',
  'CRM',
  'Workflows',
  'Calendario de citas',
  'Respuestas automáticas',
  'Nurturing',
  'Seguimiento comercial',
];

const faqs = [
  {
    q: '¿La IA reemplaza a mi equipo de ventas?',
    a: 'No. La IA filtra, orienta, agenda y da seguimiento para que ningún lead se pierda antes de hablar con una persona. El objetivo es potenciar la venta humana, no reemplazarla.',
  },
  {
    q: '¿Con qué canales funciona?',
    a: 'Automatizamos WhatsApp, Messenger e Instagram Inbox, conectados a un CRM central para que toda la conversación quede ordenada en un solo lugar.',
  },
  {
    q: '¿Qué es GoHighLevel / CRM?',
    a: 'Es la plataforma donde centralizamos tus contactos, conversaciones, workflows y seguimiento. Te permite ver el estado de cada lead y automatizar tareas repetitivas.',
  },
];

export default function AutomatizacionesPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Automatización con IA y CRM',
          description: metadata.description as string,
          url: `${site.url}/automatizaciones-ia`,
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          { name: 'IA / Automatizaciones', url: `${site.url}/automatizaciones-ia` },
        ])}
      />

      <PageHero
        image={{ src: "/assets/stock/workspace.jpg", alt: "Automatización y flujos de trabajo con IA" }}
        eyebrow="IA / Automatizaciones"
        title="Deja de perder clientes por responder tarde."
        subtitle="Automatizamos WhatsApp, Messenger, Instagram Inbox y el seguimiento de tus leads para que tu negocio responda más rápido y venda mejor."
        whatsappMessage="Hola, quiero automatizar la atención de mi negocio con IA."
      />

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="mono-label text-faint">El reto</p>
            <ul className="mt-7 border-t border-line">
              {problems.map((p, i) => (
                <li
                  key={p}
                  className="group flex items-baseline gap-6 border-b border-line py-4"
                >
                  <span className="font-mono text-xs text-faint">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display text-base font-medium uppercase tracking-tight text-muted transition-colors duration-300 group-hover:text-fg sm:text-lg">
                    {p}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120}>
            <p className="mono-label text-accent">La solución</p>
            <ul className="mt-7 border-t border-line">
              {solutions.map((s, i) => (
                <li
                  key={s}
                  className="flex items-baseline gap-6 border-b border-line py-4"
                >
                  <span className="font-mono text-xs text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display text-base font-medium uppercase tracking-tight text-fg sm:text-lg">
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <Section tone="dark">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-accent">
            <Icon name="bot" size={28} />
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold text-white sm:text-4xl">
            No es solo inteligencia artificial. Es atención comercial
            automatizada.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/70">
            La IA debe ayudar a responder, filtrar, orientar, agendar y dar
            seguimiento. El objetivo no es reemplazar la venta humana, sino
            evitar que los leads se pierdan antes de hablar con una persona.
          </p>
        </div>
      </Section>

      <Section tone="soft">
        <SectionHeading
          eyebrow="Preguntas frecuentes"
          align="center"
          title="Dudas sobre IA y automatización"
          className="mb-12"
        />
        <FAQ items={faqs} />
      </Section>

      <CTASection
        title="Automatiza tu atención y deja de perder leads."
        whatsappMessage="Hola, quiero automatizar WhatsApp y el seguimiento de mis leads."
      />
    </>
  );
}
