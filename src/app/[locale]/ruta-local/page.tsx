import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, SectionHeading, Eyebrow } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { LeadForm } from '@/components/ruta-local/LeadForm';
import { HondurasMap } from '@/components/ruta-local/HondurasMap';
import {
  JsonLd,
  serviceSchema,
  breadcrumbSchema,
} from '@/components/seo/JsonLd';
import { site, whatsappLink } from '@/lib/site';
import {
  totalReach,
  reachMetrics as reachMetricsMeta,
  newFollowers,
  municipios as municipiosMeta,
  packages as packagesMeta,
  idealFor as idealForMeta,
  benefits as benefitsMeta,
} from '@/lib/ruta-local';

type PageParams = { params: Promise<{ locale: string }> };

type LocalizedMetric = { platform: string; value: string };
type LocalizedMunicipio = {
  name: string;
  region: string;
  blurb: string;
  tags: string[];
};
type LocalizedPackage = {
  name: string;
  kicker: string;
  tagline: string;
  features: string[];
  badge?: string;
};
type LocalizedBenefit = { title: string; text: string };
type MapLegendItem = { name: string; dept: string };

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'RutaLocal' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/ruta-local' },
  };
}

export default async function RutaLocalPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('RutaLocal');
  const tc = await getTranslations('Common');

  const reachMetrics = (t.raw('reachMetrics') as LocalizedMetric[]).map(
    (metric, index) => ({
      ...metric,
      icon: reachMetricsMeta[index]?.icon ?? ('bolt' as IconName),
    }),
  );

  const municipios = (t.raw('municipios') as LocalizedMunicipio[]).map(
    (item, index) => ({
      ...item,
      image: municipiosMeta[index]?.image ?? '/assets/stock/creative.jpg',
    }),
  );

  const packages = (t.raw('packages') as LocalizedPackage[]).map(
    (item, index) => ({
      ...item,
      highlight: packagesMeta[index]?.highlight,
    }),
  );

  const idealFor = (t.raw('idealFor') as string[]).map((label, index) => ({
    label,
    icon: idealForMeta[index]?.icon ?? ('users' as IconName),
  }));

  const benefits = (t.raw('benefits') as LocalizedBenefit[]).map(
    (item, index) => ({
      ...item,
      icon: benefitsMeta[index]?.icon ?? ('sparkles' as IconName),
    }),
  );

  const mapLegend = t.raw('mapLegend') as MapLegendItem[];

  return (
    <div className="theme-ruta-local">
      <JsonLd
        data={serviceSchema({
          name: 'Ruta Local by Cluster',
          description: t('metaDescription'),
          url: `${site.url}/ruta-local`,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: t('breadcrumbName'), url: `${site.url}/ruta-local` },
        ])}
      />

      <Hero t={t} />
      <QueEsSection t={t} mapLegend={mapLegend} />
      <AlcanceSection t={t} reachMetrics={reachMetrics} />
      <CasosSection t={t} municipios={municipios} />
      <PaquetesSection t={t} packages={packages} />
      <IdealParaSection t={t} idealFor={idealFor} />
      <BeneficiosSection t={t} benefits={benefits} />
      <FormularioSection t={t} />
    </div>
  );
}

type TFn = Awaited<ReturnType<typeof getTranslations>>;

function Hero({ t }: { t: TFn }) {
  return (
    <section className="theme-dark relative overflow-hidden bg-ink-950 pt-36 pb-20 text-fg sm:pt-44 sm:pb-24">
      <div
        className="absolute inset-0 bg-grid-fade [background-size:64px_64px] opacity-40 [mask-image:radial-gradient(70%_60%_at_30%_0%,black,transparent)]"
        aria-hidden="true"
      />
      <div
        className="hn-glow absolute -left-40 -top-20 h-[32rem] w-[32rem] rounded-full blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="hn-glow-alt absolute -right-32 bottom-0 h-[24rem] w-[24rem] rounded-full blur-[120px] opacity-90"
        aria-hidden="true"
      />
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div className="hn-ribbon absolute inset-x-0 top-0 h-1.5" aria-hidden="true" />

      <div className="container-x relative z-[1]">
        <div className="grid min-w-0 grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="min-w-0">
            <Reveal>
              <div className="hn-stripe mb-4" aria-hidden="true" />
              <Eyebrow>{t('heroEyebrow')}</Eyebrow>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-6 max-w-full break-words font-semibold leading-[0.98] text-fg text-[2.4rem] sm:text-6xl lg:text-7xl">
                {t('heroTitle')}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-7 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                {t('heroSubtitle')}
              </p>
            </Reveal>

            <Reveal delay={160}>
              <div className="mt-9 inline-flex items-end gap-3 border border-[color:rgba(46,184,224,0.5)] bg-surface px-6 py-4 backdrop-blur-sm">
                <span className="font-display text-4xl font-semibold text-accent">
                  {t('totalReach') || totalReach}
                </span>
                <span className="pb-1.5 font-mono text-sm text-faint">
                  {t('viewsLabel')}
                </span>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button href="#solicitar" size="lg" iconRight="arrow-right">
                  {t('heroCtaPrimary')}
                </Button>
                <Button href="#casos" variant="ghost" size="lg">
                  {t('heroCtaSecondary')}
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={160} className="relative min-w-0">
            <div className="hn-card-bar absolute inset-x-0 top-0 z-[1]" aria-hidden="true" />
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src="/assets/stock/creative.jpg"
                  alt={t('heroImageAlt1')}
                  fill
                  priority
                  sizes="(max-width: 1024px) 45vw, 22vw"
                  className="object-cover grayscale transition duration-700 hover:grayscale-0"
                />
              </div>
              <div className="relative mt-8 aspect-[3/4] overflow-hidden">
                <Image
                  src="/assets/stock/collaboration.jpg"
                  alt={t('heroImageAlt2')}
                  fill
                  sizes="(max-width: 1024px) 45vw, 22vw"
                  className="object-cover grayscale transition duration-700 hover:grayscale-0"
                />
              </div>
            </div>
            <div
              className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[color:rgba(46,184,224,0.45)]"
              aria-hidden="true"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function QueEsSection({
  t,
  mapLegend,
}: {
  t: TFn;
  mapLegend: MapLegendItem[];
}) {
  return (
    <Section tone="light">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <SectionHeading
          eyebrow={t('whatEyebrow')}
          title={t('whatTitle')}
          description={t('whatDescription')}
        />
        <Reveal delay={120}>
          <TerritoryMap t={t} mapLegend={mapLegend} />
        </Reveal>
      </div>
    </Section>
  );
}

function TerritoryMap({
  t,
  mapLegend,
}: {
  t: TFn;
  mapLegend: MapLegendItem[];
}) {
  return (
    <div className="theme-dark relative overflow-hidden bg-ink-900 p-6 sm:p-8">
      <div
        className="absolute inset-0 bg-grid-fade [background-size:40px_40px] opacity-50"
        aria-hidden="true"
      />
      <div
        className="hn-glow pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-[80px]"
        aria-hidden="true"
      />
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div className="relative z-[1]">
        <div className="flex items-center justify-between gap-4">
          <span className="mono-label text-faint">{t('mapTitle')}</span>
          <div className="hn-stripe" aria-hidden="true" />
        </div>
        <div className="mt-4">
          <HondurasMap />
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-5">
          {mapLegend.map((l, i) => (
            <li key={l.name} className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 flex-none hn-dot-${i}`} />
              <span className="font-display text-base font-semibold uppercase text-fg">
                {l.name}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
                {l.dept}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AlcanceSection({
  t,
  reachMetrics,
}: {
  t: TFn;
  reachMetrics: { platform: string; value: string; icon: IconName }[];
}) {
  return (
    <Section tone="dark">
      <div className="mb-14 text-center">
        <SectionHeading
          eyebrow={t('reachEyebrow')}
          align="center"
          title={t('reachTitle')}
          description={t('reachDescription')}
        />
        <p className="mt-3 font-mono text-[11px] tracking-wide text-faint">
          {t('reachAverageNote')}
        </p>
      </div>
      <div className="grid gap-px overflow-hidden bg-surface-2 sm:grid-cols-2 lg:grid-cols-4">
        {reachMetrics.map((m, i) => (
          <Reveal
            key={m.platform}
            delay={i * 60}
            className="group bg-theme p-8 transition-colors duration-500 hover:bg-surface"
          >
            <span
              className={`flex h-12 w-12 items-center justify-center transition-transform duration-500 group-hover:scale-105 hn-accent-${i}`}
            >
              <Icon name={m.icon} size={24} />
            </span>
            <p className="mt-6 font-display text-5xl font-semibold text-fg">
              {m.value}
            </p>
            <p className="mt-1 font-mono text-sm uppercase tracking-wider text-muted">
              {m.platform}
            </p>
          </Reveal>
        ))}
      </div>

      <Reveal
        delay={120}
        className="hn-ribbon mt-px flex flex-col items-center justify-between gap-4 px-8 py-7 text-center text-white sm:flex-row sm:text-left"
      >
        <p className="font-display text-3xl font-semibold sm:text-4xl">
          {t('newFollowers') || newFollowers} {t('newFollowersLabel')}
        </p>
        <p className="max-w-md font-mono text-sm uppercase tracking-wider text-white/85">
          {t('newFollowersText')}
        </p>
      </Reveal>
    </Section>
  );
}

function CasosSection({
  t,
  municipios,
}: {
  t: TFn;
  municipios: {
    name: string;
    region: string;
    blurb: string;
    tags: string[];
    image: string;
  }[];
}) {
  return (
    <Section tone="light" id="casos">
      <SectionHeading
        eyebrow={t('casesEyebrow')}
        title={t('casesTitle')}
        description={t('casesDescription')}
        className="mb-12"
      />
      <div className="grid gap-6 md:grid-cols-3">
        {municipios.map((m, i) => (
          <Reveal
            key={m.name}
            delay={i * 80}
            as="article"
            className="group flex flex-col overflow-hidden bg-surface transition-colors duration-500 hover:bg-surface-2"
          >
            <div className="hn-card-bar" aria-hidden="true" />
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={m.image}
                alt={t('municipioImageAlt', { name: m.name })}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
              />
              <span
                className={`absolute left-4 top-4 flex h-11 w-11 items-center justify-center backdrop-blur-sm hn-accent-${i}`}
              >
                <Icon name="pin" size={20} />
              </span>
            </div>
            <div className="flex flex-1 flex-col p-7">
              <span className="mono-label text-faint">{m.region}</span>
              <h3 className="mt-2 font-display text-2xl font-semibold text-fg">
                {m.name}
              </h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted">
                {m.blurb}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {m.tags.map((tag) => (
                  <span
                    key={tag}
                    className="hn-tag bg-surface-2 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function PaquetesSection({
  t,
  packages,
}: {
  t: TFn;
  packages: {
    name: string;
    kicker: string;
    tagline: string;
    features: string[];
    badge?: string;
    highlight?: boolean;
  }[];
}) {
  return (
    <Section tone="dark" id="paquetes">
      <SectionHeading
        eyebrow={t('packagesEyebrow')}
        align="center"
        title={t('packagesTitle')}
        description={t('packagesDescription')}
        className="mb-14"
      />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        {packages.map((p, i) => (
          <Reveal
            key={p.name}
            delay={i * 80}
            className={`group relative flex flex-col p-8 transition-all duration-500 hover:-translate-y-1.5 ${
              p.highlight
                ? 'bg-surface-2 shadow-glow ring-1 ring-inset ring-[color:var(--accent)] lg:-mt-4 lg:pb-12'
                : 'bg-surface hover:bg-surface-2'
            }`}
          >
            <div className="hn-card-bar absolute inset-x-0 top-0" aria-hidden="true" />
            {p.badge && (
              <span className="mono-label mb-3 inline-flex w-fit bg-accent px-4 py-1.5 text-accent-fg">
                {p.badge}
              </span>
            )}
            <span className="mono-label text-faint">{p.kicker}</span>
            <h3 className="mt-2 font-display text-3xl font-semibold text-fg">
              {p.name}
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              {p.tagline}
            </p>
            <ul className="mt-6 flex-1 space-y-3 border-t border-line pt-6">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[15px] text-muted">
                  <span
                    className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center hn-accent-${i}`}
                  >
                    <Icon name="check" size={13} strokeWidth={2.5} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Button
              href="#solicitar"
              variant={p.highlight ? 'accent' : 'ghost'}
              size="lg"
              className="mt-8 w-full"
              iconRight="arrow-right"
            >
              {t('packageCta')}
            </Button>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function IdealParaSection({
  t,
  idealFor,
}: {
  t: TFn;
  idealFor: { label: string; icon: IconName }[];
}) {
  return (
    <Section tone="light">
      <SectionHeading
        eyebrow={t('idealEyebrow')}
        title={t('idealTitle')}
        description={t('idealDescription')}
        className="mb-12"
      />
      <div className="grid gap-px overflow-hidden bg-surface-2 sm:grid-cols-2 lg:grid-cols-4">
        {idealFor.map((a, i) => (
          <Reveal
            key={a.label}
            delay={i * 50}
            className="group flex items-center gap-4 bg-theme p-6 transition-colors duration-500 hover:bg-surface"
          >
            <span
              className={`flex h-11 w-11 flex-none items-center justify-center transition-transform duration-500 group-hover:scale-105 hn-accent-${i}`}
            >
              <Icon name={a.icon} size={22} />
            </span>
            <span className="font-display text-lg font-semibold uppercase text-fg">
              {a.label}
            </span>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function BeneficiosSection({
  t,
  benefits,
}: {
  t: TFn;
  benefits: { title: string; text: string; icon: IconName }[];
}) {
  return (
    <Section tone="dark">
      <SectionHeading
        eyebrow={t('benefitsEyebrow')}
        title={t('benefitsTitle')}
        className="mb-12"
      />
      <div className="grid gap-px overflow-hidden bg-surface-2 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b, i) => (
          <Reveal
            key={b.title}
            delay={i * 50}
            className="group relative bg-theme p-8 transition-colors duration-500 hover:bg-surface"
          >
            <span className={`mono-label absolute right-6 top-6 hn-num-${i % 6}`}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className={`flex h-12 w-12 items-center justify-center transition-transform duration-500 group-hover:scale-105 hn-accent-${i % 6}`}
            >
              <Icon name={b.icon} size={24} />
            </span>
            <h3 className="mt-5 font-display text-xl font-semibold text-fg">
              {b.title}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              {b.text}
            </p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function FormularioSection({ t }: { t: TFn }) {
  return (
    <Section tone="light" id="solicitar">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow={t('formEyebrow')}
            title={t('formTitle')}
            description={t('formDescription')}
          />
          <div className="mt-8 flex flex-col gap-4">
            <a
              href={`mailto:${site.email}`}
              className="flex items-center gap-3 text-muted transition-colors hover:text-fg"
            >
              <Icon name="mail" size={18} className="text-accent" />
              {site.email}
            </a>
            <Button
              href={whatsappLink(t('whatsappDefault'))}
              external
              variant="whatsapp"
              icon="whatsapp"
              size="lg"
              className="self-start"
            >
              {t('formWhatsappCta')}
            </Button>
          </div>
        </div>
        <LeadForm />
      </div>
    </Section>
  );
}
