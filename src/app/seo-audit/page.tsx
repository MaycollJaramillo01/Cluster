import type { Metadata } from 'next';
import { PageHero } from '@/components/blocks/PageHero';
import { CTASection } from '@/components/blocks/CTASection';
import { JsonLd, breadcrumbSchema, serviceSchema } from '@/components/seo/JsonLd';
import { SeoAuditTool } from '@/components/seo-audit/SeoAuditTool';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'SEO Audit con IA para negocios hispanos',
  description:
    'Auditoria SEO con IA para revisar estructura tecnica, contenido, SEO local y conversion de websites de negocios hispanos.',
  alternates: { canonical: '/seo-audit' },
};

const reviewAreas: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'search',
    title: 'SEO tecnico',
    text: 'Title, meta description, encabezados, enlazado, estado de respuesta e imagenes sin alt.',
  },
  {
    icon: 'pen',
    title: 'Contenido',
    text: 'Claridad del mensaje, palabras clave, estructura comercial y oportunidades para responder mejor la busqueda.',
  },
  {
    icon: 'target',
    title: 'Conversion',
    text: 'Llamados a la accion, confianza, rutas de contacto y senales que ayudan a convertir visitas en prospectos.',
  },
];

export default function SeoAuditPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'SEO Audit con IA',
          description: metadata.description as string,
          url: `${site.url}/seo-audit`,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          { name: 'SEO Audit', url: `${site.url}/seo-audit` },
        ])}
      />

      <PageHero
        image={{ src: '/assets/stock/analytics.jpg', alt: 'Analisis SEO de un website' }}
        eyebrow="SEO Audit"
        title="Auditoria SEO con IA para encontrar oportunidades reales."
        subtitle="Revisa tu website, detecta problemas de visibilidad y recibe prioridades claras para mejorar posicionamiento, confianza y conversion."
        primaryCta={{ label: 'Auditar ahora', href: '#seo-audit-tool' }}
        whatsappMessage="Hola, quiero una auditoria SEO para mi website."
      />

      <Section id="seo-audit-tool" tone="light">
        <div className="mb-12">
          <SectionHeading
            eyebrow="Herramienta"
            title="Pega tu URL y recibe un diagnostico accionable."
            description="El auditor lee la pagina, extrae senales SEO importantes y usa IA para convertirlas en una lista de prioridades."
            titleClass="text-4xl text-fg sm:text-5xl lg:text-6xl"
          />
        </div>
        <SeoAuditTool />
      </Section>

      <Section tone="dark">
        <SectionHeading
          eyebrow="Que revisa"
          tone="light"
          title="Un primer filtro antes de invertir en SEO."
          description="La auditoria ayuda a separar problemas tecnicos, contenido flojo y friccion comercial para decidir que arreglar primero."
          titleClass="text-4xl text-fg sm:text-5xl lg:text-6xl"
          className="mb-12"
        />
        <div className="grid gap-px bg-surface-2 md:grid-cols-3">
          {reviewAreas.map((area, index) => (
            <Reveal
              key={area.title}
              delay={index * 80}
              className="bg-theme p-8"
            >
              <span className="flex h-12 w-12 items-center justify-center bg-surface text-accent">
                <Icon name={area.icon} size={24} />
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold text-fg">
                {area.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                {area.text}
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      <CTASection
        title="Convirtamos el diagnostico en mejoras reales."
        text="Si el reporte muestra oportunidades claras, podemos ayudarte a ajustar la pagina, mejorar el contenido y preparar una estrategia SEO."
        whatsappMessage="Hola, ya revise mi SEO Audit y quiero ayuda con mi website."
      />
    </>
  );
}
