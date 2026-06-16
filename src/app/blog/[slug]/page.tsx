import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Eyebrow } from '@/components/ui/Section';
import { Icon } from '@/components/ui/Icon';
import { CTASection } from '@/components/blocks/CTASection';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { articles, site } from '@/lib/site';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return { title: 'Artículo no encontrado' };
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt,
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  const related = articles.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.excerpt,
          articleSection: article.category,
          author: { '@type': 'Organization', name: site.name },
          publisher: { '@type': 'Organization', name: site.name },
          mainEntityOfPage: `${site.url}/blog/${article.slug}`,
        }}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          { name: 'Blog', url: `${site.url}/blog` },
          { name: article.title, url: `${site.url}/blog/${article.slug}` },
        ])}
      />

      {/* Cabecera del artículo */}
      <section className="relative overflow-hidden bg-ink-950 pt-36 pb-16 sm:pt-44">
        <div
          className="absolute inset-0 bg-grid-fade [background-size:64px_64px] opacity-30 [mask-image:radial-gradient(60%_60%_at_30%_0%,black,transparent)]"
          aria-hidden="true"
        />
        <div className="container-x relative z-[1] max-w-3xl">
          <Eyebrow>{article.category}</Eyebrow>
          <h1 className="mt-6 text-3xl font-semibold leading-[1.05] tracking-tight text-paper sm:text-4xl lg:text-[2.75rem]">
            {article.title}
          </h1>
          <div className="mt-6 flex items-center gap-4 font-mono text-sm text-paper/45">
            <span>{site.name}</span>
            <span>·</span>
            <span>{article.readingTime} de lectura</span>
          </div>
        </div>
      </section>

      {/* Cuerpo del artículo (plantilla editable por el equipo de contenido) */}
      <article className="bg-ink-900 py-16 sm:py-20">
        <div className="container-x max-w-3xl">
          <div className="space-y-6 text-lg leading-relaxed text-paper/65">
            <p className="text-xl text-paper/85">{article.excerpt}</p>
            <p>
              En {site.name} ayudamos a negocios hispanos a competir en mercados
              cada vez más digitales. En este artículo abordamos cómo aplicar
              estas ideas de forma práctica en tu negocio, sin tecnicismos
              innecesarios y con un enfoque comercial.
            </p>
            <h2 className="font-display text-2xl font-semibold text-paper">
              Por qué esto importa para tu negocio
            </h2>
            <p>
              Hoy las personas buscan en Google, revisan redes, comparan
              opciones y deciden rápido. Tener una estrategia clara —y las
              herramientas correctas— marca la diferencia entre depender de
              referidos o construir un flujo constante de clientes.
            </p>
            <h2 className="font-display text-2xl font-semibold text-paper">
              Cómo te ayudamos
            </h2>
            <p>
              Combinamos branding, contenido, campañas, websites y automatización
              para que tu presencia digital trabaje por ti. Si quieres aplicar
              esto a tu caso específico, agenda una llamada y lo revisamos
              juntos.
            </p>
            <p className="rounded-2xl bg-white/[0.05] p-5 text-base text-paper/55">
              <strong className="text-paper">Nota:</strong> este es un artículo
              de plantilla listo para que el equipo de contenido complete con el
              texto SEO definitivo.
            </p>
          </div>

          <Link
            href="/blog"
            className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-brand-300"
          >
            <Icon name="arrow-right" size={16} className="rotate-180" />
            Volver al blog
          </Link>
        </div>
      </article>

      {/* Artículos relacionados */}
      <section className="border-t border-white/10 bg-ink-850 py-16">
        <div className="container-x">
          <h2 className="mb-8 font-display text-2xl font-semibold text-paper">
            Sigue leyendo
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {related.map((a) => (
              <Link
                key={a.slug}
                href={`/blog/${a.slug}`}
                className="card-dark group p-6"
              >
                <span className="mono-label text-brand-300">{a.category}</span>
                <h3 className="mt-3 font-display text-base font-semibold leading-snug text-paper">
                  {a.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection whatsappMessage="Hola, leí su blog y quiero ayuda con mi negocio." />
    </>
  );
}
