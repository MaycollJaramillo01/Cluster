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
    'Conoce a Cluster Media, agencia digital internacional que ayuda a negocios hispanos a crecer con contenido, campañas, branding, websites y automatizaciones.',
  alternates: { canonical: '/sobre-cluster' },
};

const beliefs = [
  'La relevancia se gana.',
  'El contenido debe conectar.',
  'La marca debe generar confianza.',
  'Las campañas deben tener estrategia.',
  'La tecnología debe facilitar ventas.',
  'La automatización debe ayudar a no perder oportunidades.',
];

const values: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'users',
    title: 'Conexión real',
    text: 'Comunicación cercana, en tu idioma y enfocada en tus objetivos comerciales.',
  },
  {
    icon: 'chart',
    title: 'Enfoque en resultados',
    text: 'No medimos likes: medimos prospectos, oportunidades y crecimiento real.',
  },
  {
    icon: 'globe',
    title: 'Visión internacional',
    text: 'Atendemos negocios hispanos en EE. UU., Latinoamérica y España.',
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
        title="Somos Cluster Media: comunicación digital que conecta y genera crecimiento."
        subtitle="Ayudamos a negocios hispanos a construir marcas más fuertes, atraer más clientes y adaptarse a un mercado cada vez más digital."
        whatsappMessage="Hola, quiero conocer más sobre Cluster Media."
      />

      <Section tone="light">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            align="center"
            eyebrow="Nuestra filosofía"
            title="Conexión real, cercanía digital."
            description="Las reglas del marketing cambiaron. Las marcas ya no ganan solo por gastar más, sino por conectar mejor, comunicar con claridad y crear sistemas digitales que generen confianza."
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
            title="Principios que guían cada proyecto."
            description="No trabajamos por inercia. Cada decisión parte de una idea clara de cómo se construye crecimiento digital sostenible."
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
            title="Un equipo que entiende negocios, no solo redes."
            description="Estrategas, diseñadores, creadores de contenido y especialistas en performance y automatización, trabajando juntos para que tu negocio crezca. Más que proveedores, queremos ser tu socio digital."
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
