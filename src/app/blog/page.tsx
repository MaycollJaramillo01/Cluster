import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/blocks/PageHero';
import { Section } from '@/components/ui/Section';
import { CTASection } from '@/components/blocks/CTASection';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { articles, blogCategories, site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Blog | Marketing digital para negocios hispanos',
  description:
    'Artículos sobre marketing digital, Google Ads, redes sociales, branding, automatización con IA y websites para negocios hispanos.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  const [featured, ...rest] = articles;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          { name: 'Blog', url: `${site.url}/blog` },
        ])}
      />

      <PageHero
        eyebrow="Blog · Insights"
        title="Ideas para hacer crecer tu negocio digital."
        subtitle="Estrategias prácticas de marketing, campañas, branding y automatización pensadas para negocios hispanos que quieren competir mejor."
        whatsappMessage="Hola, tengo una duda sobre marketing para mi negocio."
      />

      <Section tone="light">
        {/* Categorías */}
        <div className="mb-12 flex flex-wrap gap-2.5">
          {blogCategories.map((cat) => (
            <span
              key={cat}
              className="rounded-full bg-white/[0.05] px-4 py-2 text-sm font-medium text-paper/65 transition-colors hover:border-brand/40 hover:text-brand-300"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Artículo destacado */}
        <Reveal className="group mb-12 grid overflow-hidden rounded-3xl bg-white/[0.04] lg:grid-cols-2">
          <div className="relative flex min-h-[240px] items-end overflow-hidden bg-gradient-to-br from-brand/20 via-ink-850 to-ink-900 p-8">
            <div className="grain absolute inset-0" aria-hidden="true" />
            <div className="relative z-[1]">
              <span className="mono-label rounded-full bg-brand px-3 py-1.5 text-white">
                Destacado
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold leading-snug text-paper sm:text-3xl">
                {featured.title}
              </h2>
            </div>
          </div>
          <div className="flex flex-col justify-center p-8">
            <span className="mono-label text-brand-300">{featured.category}</span>
            <p className="mt-4 text-[15px] leading-relaxed text-paper/55">
              {featured.excerpt}
            </p>
            <div className="mt-5 font-mono text-sm text-paper/40">
              {featured.readingTime} de lectura
            </div>
            <Link
              href={`/blog/${featured.slug}`}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-300 transition-all group-hover:gap-3"
            >
              Leer artículo
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>
        </Reveal>

        {/* Grid de artículos */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article, i) => (
            <Reveal
              as="article"
              key={article.slug}
              delay={i * 60}
              className="card-dark group flex flex-col p-7"
            >
              <span className="mono-label text-brand-300">{article.category}</span>
              <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-paper">
                {article.title}
              </h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-paper/55">
                {article.excerpt}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="font-mono text-sm text-paper/40">
                  {article.readingTime}
                </span>
                <Link
                  href={`/blog/${article.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-300 transition-all group-hover:gap-3"
                  aria-label={`Leer ${article.title}`}
                >
                  Leer
                  <Icon name="arrow-right" size={16} />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <CTASection
        title="¿Prefieres que lo hagamos por ti?"
        text="Leer es el primer paso. Agenda una llamada y construyamos juntos la estrategia digital de tu negocio."
        whatsappMessage="Hola, quiero ayuda con la estrategia digital de mi negocio."
      />
    </>
  );
}
