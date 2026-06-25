import type { Metadata } from 'next';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CheckList } from '@/components/blocks/Blocks';
import { CTASection } from '@/components/blocks/CTASection';
import { Reveal } from '@/components/ui/Reveal';
import { Icon, type IconName } from '@/components/ui/Icon';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Sobre Cluster Media | Agencia digital para negocios hispanos',
  description:
    'Conoce a Cluster Media, agencia de comunicación digital que construye marcas, contenido y sistemas para conectar con audiencias reales.',
  alternates: { canonical: '/sobre-cluster' },
};

const beliefs = [
  'La relevancia ya no se compra: se gana contando historias relevantes.',
  'El contenido debe sentirse cercano, real y distinto.',
  'Una marca debe conectar antes de intentar vender.',
  'Las campañas funcionan mejor cuando parten de una historia clara.',
  'La tecnología debe ayudar a responder, ordenar y vender mejor.',
  'Cada pieza digital debe salir del molde corporativo.',
];

const values: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'users',
    title: 'Conexión real',
    text: 'Creamos comunicación cercana y humana para que tu marca conecte de verdad con las personas.',
  },
  {
    icon: 'megaphone',
    title: 'Contenido que rompe el molde',
    text: 'Lo que funciona hoy no es gritar más, sino crear piezas que la audiencia quiera ver y recordar.',
  },
  {
    icon: 'globe',
    title: 'Cercanía digital',
    text: 'Unimos estrategia, redes, campañas, websites y automatización para que tu marca se sienta presente.',
  },
];

export default function SobrePage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          { name: 'Sobre Cluster', url: `${site.url}/sobre-cluster` },
        ])}
      />

      <PageHero
        image={{ src: "/assets/stock/team.jpg", alt: "Equipo de Cluster Media" }}
        eyebrow="Sobre Cluster"
        title="Somos Cluster: comunicación digital que sí conecta con tu audiencia."
        subtitle="Construimos marcas, contenido y sistemas digitales para negocios que quieren salirse del molde corporativo y conectar de forma real."
        whatsappMessage="Hola, quiero conocer más sobre Cluster Media."
      />

      <Section tone="light">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            align="center"
            eyebrow="Conexión real, cercanía digital"
            title="Conexión real, cercanía digital."
            description="Hoy un contenido auténtico puede mover más que una producción costosa sin alma. Las reglas cambiaron: ahora gana la marca que cuenta historias relevantes, conecta de verdad y se siente cercana."
          />
        </div>
      </Section>

      <Section tone="soft">
        <div className="grid gap-5 md:grid-cols-3">
          {values.map((v, i) => (
            <Reveal
              key={v.title}
              delay={i * 80}
              className="card-dark p-8"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-accent">
                <Icon name={v.icon} size={24} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-fg">
                {v.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                {v.text}
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="dark">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            tone="light"
            eyebrow="Qué creemos"
            title="La relevancia se gana contando historias relevantes."
            description="No creemos en piezas sueltas ni en contenido que nadie recuerda. Creamos comunicación digital con intención, estrategia y cercanía."
          />
          <Reveal delay={120} className="flex items-center">
            <CheckList items={beliefs} tone="light" className="gap-4" />
          </Reveal>
        </div>
      </Section>

      <Section tone="light">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            align="center"
            eyebrow="Equipo"
            title="Un equipo para construir algo grande con tu marca."
            description="Estrategia, diseño, edición audiovisual, contenido, campañas, CRM, automatización y websites trabajando juntos para que tu negocio conecte mejor y crezca."
          />
        </div>
      </Section>

      <CTASection
        title="Hagamos crecer tu negocio juntos."
        whatsappMessage="Hola, quiero trabajar con Cluster Media."
      />
    </>
  );
}
