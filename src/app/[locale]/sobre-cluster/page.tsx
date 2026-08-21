import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CheckList } from '@/components/blocks/Blocks';
import { CTASection } from '@/components/blocks/CTASection';
import { Reveal } from '@/components/ui/Reveal';
import { Icon, type IconName } from '@/components/ui/Icon';
import { TeamCarousel } from '@/components/home/TeamCarousel';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { site } from '@/lib/site';

type PageParams = { params: Promise<{ locale: string }> };

const valueIcons: IconName[] = ['shield', 'target', 'bolt'];

const capabilityMeta: { icon: IconName; href: string }[] = [
  { icon: 'sparkles', href: '/branding' },
  { icon: 'globe', href: '/websites-seo' },
  { icon: 'megaphone', href: '/redes-sociales' },
  { icon: 'target', href: '/google-ads' },
  { icon: 'bolt', href: '/automatizaciones-ia' },
  { icon: 'search', href: '/seo-audit' },
];

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'About' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/sobre-cluster' },
  };
}

export default async function SobrePage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('About');
  const tc = await getTranslations('Common');
  const tn = await getTranslations('Nav');

  const values = (t.raw('values') as { title: string; text: string }[]).map(
    (value, index) => ({
      ...value,
      icon: valueIcons[index] ?? 'shield',
    }),
  );
  const capabilities = (t.raw('capabilities') as { title: string; text: string }[]).map(
    (capability, index) => ({
      ...capability,
      ...capabilityMeta[index],
    }),
  );
  const beliefs = t.raw('beliefs') as string[];

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: tn('about'), url: `${site.url}/sobre-cluster` },
        ])}
      />

      <PageHero
        image={{
          src: '/assets/stock/team.jpg',
          alt: t('heroImageAlt'),
          aspectClassName: 'aspect-[3/2]',
          imageClassName: 'object-cover object-center grayscale',
        }}
        eyebrow={t('heroEyebrow')}
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
        whatsappMessage={t('heroWhatsapp')}
      />

      <Section tone="light">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            align="center"
            eyebrow={t('systemEyebrow')}
            title={t('systemTitle')}
            description={t('systemDescription')}
          />
        </div>
      </Section>

      <Section tone="soft">
        <div className="grid gap-5 md:grid-cols-3">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 80} className="card-dark p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-accent">
                <Icon name={v.icon} size={24} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-fg">{v.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{v.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="dark">
        <SectionHeading
          tone="light"
          eyebrow={t('capabilitiesEyebrow')}
          title={t('capabilitiesTitle')}
          description={t('capabilitiesDescription')}
          className="mb-12"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <Reveal key={c.title} delay={i * 60}>
              <Link
                href={c.href}
                className="group flex h-full flex-col bg-surface p-7 transition-colors duration-300 hover:bg-surface-2"
              >
                <span className="flex h-11 w-11 items-center justify-center bg-surface-2 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-fg">
                  <Icon name={c.icon} size={22} />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-fg">{c.title}</h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{c.text}</p>
                <span className="mono-label mt-5 inline-flex items-center gap-2 text-accent">
                  {tc('seeService')}
                  <Icon name="arrow-right" size={14} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow={t('beliefsEyebrow')}
            title={t('beliefsTitle')}
            description={t('beliefsDescription')}
          />
          <Reveal delay={120} className="flex items-center">
            <CheckList items={beliefs} className="gap-4" />
          </Reveal>
        </div>
      </Section>

      <Section tone="soft">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            align="center"
            eyebrow={t('teamEyebrow')}
            title={t('teamTitle')}
            description={t('teamDescription')}
          />
        </div>
        <Reveal delay={120}>
          <TeamCarousel />
        </Reveal>
      </Section>

      <CTASection title={t('ctaTitle')} whatsappMessage={t('ctaWhatsapp')} />
    </>
  );
}
