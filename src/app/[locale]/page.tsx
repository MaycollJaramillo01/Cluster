import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import dynamic from 'next/dynamic';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { HomeHero } from '@/components/home/HomeHero';
import { SolutionCard, type SolutionVideo } from '@/components/home/SolutionCard';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { ServicesBento } from '@/components/home/ServicesBento';
import { TeamSection } from '@/components/home/TeamSection';
import { CaseCard } from '@/components/blocks/CaseCard';
import { LogoWall } from '@/components/blocks/LogoWall';
import { getLocalizedCaseStudies } from '@/lib/localized-content';
import { site, whatsappLink } from '@/lib/site';

const EcosystemDiagram = dynamic(
  () =>
    import('@/components/home/EcosystemDiagram').then((m) => m.EcosystemDiagram),
  { ssr: true },
);
const PricingPlans = dynamic(
  () => import('@/components/home/PricingPlans').then((m) => m.PricingPlans),
  { ssr: true },
);
const LeadQuiz = dynamic(
  () => import('@/components/forms/LeadQuiz').then((m) => m.LeadQuiz),
  { ssr: true },
);

const solutionHrefs = [
  '/branding',
  '/websites-seo',
  '/redes-sociales',
  '/automatizaciones-ia',
] as const;

const solutionVideos: (SolutionVideo | undefined)[] = [
  {
    mp4: '/assets/videos/services/marca-profesional.mp4',
    webm: '/assets/videos/services/marca-profesional.webm',
    poster: '/assets/videos/services/marca-profesional-poster.jpg',
  },
  {
    mp4: '/assets/videos/services/presencia-digital.mp4',
    poster: '/assets/videos/services/presencia-digital-poster.jpg',
  },
  {
    mp4: '/assets/videos/services/generacion-clientes.mp4',
    webm: '/assets/videos/services/generacion-clientes.webm',
    poster: '/assets/videos/services/generacion-clientes-poster.jpg',
  },
  {
    mp4: '/assets/videos/services/automatizacion.mp4',
    poster: '/assets/videos/services/automatizacion-poster.jpg',
  },
];

const problemIcons: IconName[] = [
  'megaphone',
  'globe',
  'target',
  'bolt',
  'shield',
  'users',
];

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });

  return {
    title: t('titleDefault'),
    description: t('description'),
    alternates: { canonical: locale === 'en' ? '/en' : '/' },
  };
}

export default async function HomePage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');
  const tc = await getTranslations('Common');
  const messages = await getMessages();
  const caseStudies = getLocalizedCaseStudies(messages);

  const solutions = (t.raw('solutions') as { title: string; text: string }[]).map(
    (solution, index) => ({
      ...solution,
      href: solutionHrefs[index],
      video: solutionVideos[index],
    }),
  );

  const problems = (t.raw('problems') as { title: string; text: string }[]).map(
    (problem, index) => ({
      ...problem,
      icon: problemIcons[index] ?? 'bolt',
    }),
  );

  return (
    <>
      <HomeHero />

      <div className="border-y border-line bg-ink-950 py-14">
        <div className="container-x">
          <p className="mono-label mb-10 text-center text-faint">{t('clientsEyebrow')}</p>
          <LogoWall />
        </div>
      </div>

      <Section tone="dark">
        <SectionHeading
          eyebrow={t('solutionEyebrow')}
          tone="light"
          title={t('solutionTitle')}
          description={t('solutionDescription')}
          titleClass="text-fg text-3xl sm:text-4xl lg:text-4xl xl:text-5xl"
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {solutions.map((s, i) => (
            <SolutionCard
              key={s.title}
              title={s.title}
              text={s.text}
              href={s.href}
              video={s.video}
              index={i}
            />
          ))}
        </div>
      </Section>

      <Section tone="light" className="paper-grain py-16 sm:py-18 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-12">
          <Reveal>
            <span className="mono-label inline-flex items-center gap-3 text-accent">
              <span className="h-px w-8 bg-accent" />
              {t('problemEyebrow')}
            </span>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-bold uppercase leading-[0.98] text-ink-950 sm:text-4xl lg:text-5xl">
              {t('problemTitle')}
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-700 sm:text-lg">
              {t('problemDescription')}
            </p>
            <div className="mt-6 border-l-2 border-accent pl-4">
              <p className="font-display text-lg font-semibold uppercase leading-tight text-ink-950">
                {t('problemCalloutTitle')}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-600 sm:text-[15px]">
                {t('problemCalloutText')}
              </p>
            </div>
            <Link
              href="/contacto"
              className="mt-6 inline-flex min-h-11 items-center gap-3 bg-ink-950 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:bg-accent hover:text-ink-950"
            >
              {tc('reviewMySystem')}
              <Icon name="arrow-right" size={16} />
            </Link>
          </Reveal>

          <Reveal delay={90}>
            <div>
              <div className="grid gap-2 bg-ink-950 px-4 py-4 text-white sm:grid-cols-[auto_1fr] sm:gap-4 sm:px-5">
                <span className="mono-label text-accent">{t('diagnosticEyebrow')}</span>
                <p className="text-sm leading-relaxed text-white/70">{t('diagnosticText')}</p>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {problems.map((problem, i) => (
                  <article
                    key={problem.title}
                    className="group border border-ink-950/10 bg-paper px-4 py-4 transition-colors duration-300 hover:bg-paper-soft"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center border ${
                          i === 0
                            ? 'border-accent bg-accent text-ink-950'
                            : 'border-ink-950/15 bg-paper-soft text-ink-950'
                        }`}
                      >
                        <Icon name={problem.icon} size={18} />
                      </span>
                      <div className="min-w-0">
                        <span className="mono-label text-accent/70">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <h3 className="mt-2 font-display text-lg font-semibold uppercase leading-tight text-ink-950">
                          {problem.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink-600">
                          {problem.text}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section tone="dark">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow={t('servicesEyebrow')}
            tone="light"
            title={t('servicesTitle')}
            description={t('servicesDescription')}
          />
          <Button href="/servicios" variant="ghost" iconRight="arrow-right">
            {tc('seeAllServices')}
          </Button>
        </div>
        <ServicesBento />
      </Section>

      <Section tone="soft">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:items-center">
          <div className="flex flex-col items-start gap-8">
            <SectionHeading
              eyebrow={t('casesEyebrow')}
              title={t('casesTitle')}
              description={t('casesDescription')}
            />
            <Button href="/casos-de-exito" variant="ghost" iconRight="arrow-right">
              {tc('seeAllCases')}
            </Button>
          </div>

          <ul className="columns-2 gap-3 md:hidden">
            {caseStudies.map((study, i) => (
              <li key={study.slug} className="mb-3 break-inside-avoid">
                <CaseCard study={study} index={i} />
              </li>
            ))}
          </ul>

          <div className="hidden snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:flex">
            {caseStudies.map((study, i) => (
              <div
                key={study.slug}
                className="w-[55%] shrink-0 snap-start lg:w-[45%]"
              >
                <CaseCard study={study} index={i} />
              </div>
            ))}
          </div>
        </div>
      </Section>

      <TeamSection />

      <Section tone="brand">
        <SectionHeading
          align="center"
          eyebrow={t('ecosystemEyebrow')}
          tone="light"
          title={
            <>
              {t('ecosystemTitleBefore')}{' '}
              <span className="text-accent">{t('ecosystemTitleHighlight')}</span>
              {t('ecosystemTitleAfter')}
            </>
          }
          description={t('ecosystemDescription')}
          titleClass="text-fg text-3xl sm:text-4xl lg:text-5xl"
        />
        <EcosystemDiagram />
      </Section>

      <Section id="planes" tone="light" className="paper-grain">
        <SectionHeading
          align="center"
          eyebrow={t('plansEyebrow')}
          title={t('plansTitle')}
          description={t('plansDescription')}
          titleClass="text-4xl text-fg sm:text-5xl lg:text-6xl"
        />
        <PricingPlans />
        <Reveal className="mt-12 text-center">
          <Link
            href="#diagnostico"
            className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.16em] text-accent"
          >
            <span className="link-underline">{t('diagnosticLink')}</span>
            <Icon name="arrow-right" size={16} />
          </Link>
        </Reveal>
      </Section>

      <section
        id="diagnostico"
        className="theme-dark relative overflow-hidden bg-ink-950 py-24 text-fg sm:py-32"
      >
        <div className="grain absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -left-40 top-1/2 h-[44rem] w-[44rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(2,195,154,0.16),transparent_70%)] blur-[90px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-grid-fade [background-size:64px_64px] opacity-25 [mask-image:radial-gradient(55%_55%_at_50%_50%,black,transparent)]"
          aria-hidden="true"
        />

        <div className="container-x relative z-[1] grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <span className="mono-label inline-flex items-center gap-3 text-accent">
              <span className="inline-block h-px w-8 bg-accent" />
              {t('diagnosticFreeEyebrow')}
            </span>
            <h2 className="mt-5 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-fg sm:text-5xl lg:text-6xl">
              {t('diagnosticFreeTitle')}
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
              {t('diagnosticFreeText')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={site.calendarUrl} size="lg" iconRight="arrow-right">
                {tc('scheduleCall')}
              </Button>
              <Button
                href={whatsappLink(t('diagnosticWhatsapp'))}
                external
                variant="whatsapp"
                size="lg"
                icon="whatsapp"
              >
                {tc('whatsapp')}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={120} className="flex justify-center lg:justify-end">
            <LeadQuiz />
          </Reveal>
        </div>
      </section>
    </>
  );
}
