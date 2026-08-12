import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CheckList, PillList } from '@/components/blocks/Blocks';
import { CTASection } from '@/components/blocks/CTASection';
import { FAQ } from '@/components/blocks/FAQ';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import {
  JsonLd,
  serviceSchema,
  faqSchema,
  breadcrumbSchema,
} from '@/components/seo/JsonLd';
import { site, whatsappLink } from '@/lib/site';
import {
  getWebsitePlanBySlug,
  websitePlanDisplayName,
  websitePlanSlugs,
  websitePlans,
  type WebsitePlanSlug,
} from '@/lib/website-plans';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return websitePlanSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const plan = getWebsitePlanBySlug(slug);
  if (!plan) return { title: 'Plan no encontrado' };

  const displayName = websitePlanDisplayName(plan);

  return {
    title: `Plan ${displayName} | $${plan.price}/mes`,
    description: plan.tagline,
    alternates: { canonical: `/desarrollo-web/${plan.slug}` },
    openGraph: {
      title: `Plan ${displayName} | Cluster Media`,
      description: plan.tagline,
    },
  };
}

export default async function WebsitePlanLandingPage({ params }: Params) {
  const { slug } = await params;
  const plan = getWebsitePlanBySlug(slug);
  if (!plan) notFound();

  const displayName = websitePlanDisplayName(plan);
  const otherPlans = websitePlans.filter((p) => p.slug !== plan.slug);
  const pageUrl = `${site.url}/desarrollo-web/${plan.slug}`;
  const hireHref = plan.stripeUrl || site.calendarUrl;
  const hireLabel = plan.stripeUrl ? 'Contratar ahora' : 'Agendar llamada';

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: `Plan ${displayName}`,
          description: plan.tagline,
          url: pageUrl,
          price: String(plan.price),
        })}
      />
      <JsonLd data={faqSchema(plan.faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          { name: 'Desarrollo web', url: `${site.url}/desarrollo-web` },
          { name: displayName, url: pageUrl },
        ])}
      />

      <PageHero
        image={{
          src: '/assets/stock/laptop.jpg',
          alt: `Plan ${displayName}`,
          aspectClassName: 'aspect-[4/3]',
          imageClassName: 'object-cover object-center grayscale',
        }}
        eyebrow={plan.kicker ?? `Plan ${displayName}`}
        title={plan.headline}
        subtitle={plan.tagline}
        price={{
          now: `$${plan.price}`,
          note: '/mes',
        }}
        primaryCta={{
          label: hireLabel,
          href: hireHref,
        }}
        whatsappMessage={plan.whatsapp}
      >
        {plan.badge && (
          <Reveal delay={240}>
            <span className="mono-label mt-6 inline-flex items-center gap-2 text-accent">
              <span className="h-px w-6 bg-accent" />
              {plan.badge}
            </span>
          </Reveal>
        )}
      </PageHero>

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow="Qué incluye"
            title={`Todo lo que viene con ${displayName}.`}
            description={plan.note ?? plan.footer}
          />
          <Reveal
            delay={120}
            className="flex flex-col justify-center bg-surface p-8"
          >
            <CheckList items={plan.features} columns={1} className="gap-4" />
            {plan.note && (
              <p className="mt-6 font-mono text-[11px] uppercase tracking-wider text-faint">
                ⓘ {plan.note}
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <Button
                href={hireHref}
                external={hireHref.startsWith('http')}
                size="sm"
                iconRight="arrow-right"
              >
                {hireLabel}
              </Button>
              <Button
                href={whatsappLink(plan.whatsapp)}
                external
                variant="whatsapp"
                size="sm"
                icon="whatsapp"
              >
                WhatsApp
              </Button>
              <Button href="#faq" variant="ghost" size="sm">
                Ver preguntas
              </Button>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section tone="dark">
        <SectionHeading
          eyebrow="Para quién es"
          tone="light"
          title={`${displayName} encaja si tu negocio está en esta etapa.`}
          description="Si te reconoces en alguno de estos perfiles, este plan es un buen punto de partida."
          titleClass="text-fg text-3xl sm:text-4xl"
        />
        <Reveal delay={100} className="mt-10">
          <PillList items={plan.idealFor} />
        </Reveal>
      </Section>

      <Section tone="soft">
        <SectionHeading
          eyebrow="Otros planes web"
          title="Compara y elige el nivel correcto."
          description="Si necesitas más o menos alcance, revisa las otras opciones de desarrollo y mantenimiento."
          className="mb-10"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otherPlans.map((other, i) => {
            const otherName = websitePlanDisplayName(other);
            return (
              <Reveal
                key={other.slug}
                delay={i * 60}
                className="border border-ink-950/10 bg-paper p-6 transition-colors hover:bg-paper-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {other.kicker && (
                      <p className="mono-label text-accent">{other.kicker}</p>
                    )}
                    <h3 className="mt-2 font-display text-2xl font-bold uppercase text-ink-950">
                      {otherName}
                    </h3>
                  </div>
                  {other.badge && (
                    <span className="mono-label text-[10px] text-accent">
                      {other.badge}
                    </span>
                  )}
                </div>
                <p className="mt-3 font-display text-3xl font-bold text-ink-950">
                  ${other.price}
                  <span className="ml-1 font-mono text-xs font-medium uppercase tracking-wider text-ink-600">
                    /mes
                  </span>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-600">
                  {other.tagline}
                </p>
                <Link
                  href={`/desarrollo-web/${other.slug as WebsitePlanSlug}`}
                  className="mt-6 inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ink-950 transition-colors hover:text-accent"
                >
                  Ver plan {otherName}
                  <span aria-hidden="true">→</span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section id="faq" tone="light">
        <SectionHeading
          eyebrow="Preguntas frecuentes"
          align="center"
          title={`Dudas sobre el plan ${displayName}`}
          className="mb-12"
        />
        <FAQ items={plan.faqs} />
      </Section>

      <CTASection
        title={`Empecemos con el plan ${displayName}.`}
        text={`Agenda una llamada para contratar ${displayName} o escríbenos por WhatsApp si tienes dudas. Te confirmamos el siguiente paso.`}
        whatsappMessage={plan.whatsapp}
        primaryCta={{
          label: hireLabel,
          href: hireHref,
        }}
      />
    </>
  );
}
