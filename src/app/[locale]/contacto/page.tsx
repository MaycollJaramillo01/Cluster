import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, Eyebrow } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { ContactForm } from '@/components/blocks/ContactForm';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { site, whatsappLink } from '@/lib/site';

type PageParams = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Contact' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/contacto' },
  };
}

export default async function ContactoPage({ params, searchParams }: PageParams) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('Contact');
  const tc = await getTranslations('Common');
  const tn = await getTranslations('Nav');
  const tForm = await getTranslations('ContactForm');

  const servicio = firstParam(query.servicio);
  const origen = firstParam(query.origen) || 'contacto';
  const auditUrl = firstParam(query.url);
  const auditScore = firstParam(query.score);

  const defaultMessage =
    origen === 'seo-audit'
      ? tForm('seoAuditPrefill', {
          score: auditScore || '—',
          url: auditUrl || '—',
        })
      : '';

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: tn('contact'), url: `${site.url}/contacto` },
        ])}
      />

      <section className="relative overflow-hidden bg-ink-950 pt-36 pb-16 sm:pt-44">
        <div className="hero-accent-fade absolute inset-0" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-grid-fade [background-size:64px_64px] opacity-40 [mask-image:radial-gradient(60%_60%_at_30%_0%,black,transparent)]"
          aria-hidden="true"
        />
        <div
          className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-surface blur-[120px]"
          aria-hidden="true"
        />
        <div className="container-x relative z-[1] max-w-3xl">
          <Reveal>
            <Eyebrow>
              {origen === 'seo-audit' ? t('seoAuditEyebrow') : tc('contactTalk')}
            </Eyebrow>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.02] tracking-[-0.03em] text-fg sm:text-6xl">
              {origen === 'seo-audit' ? t('seoAuditTitle') : t('title')}
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-6 text-lg text-muted">
              {origen === 'seo-audit' ? t('seoAuditSubtitle') : t('subtitle')}
            </p>
          </Reveal>
        </div>
      </section>

      <Section tone="light">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <Reveal className="rounded-3xl bg-surface p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-surface text-accent">
                    <Icon name="calendar" size={24} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-fg">
                      {t('scheduleTitle')}
                    </h3>
                    <p className="mt-1.5 text-[15px] text-muted">{t('scheduleText')}</p>
                    <Button
                      href={site.calendarUrl}
                      size="sm"
                      className="mt-4"
                      icon="calendar"
                    >
                      {tc('viewCalendar')}
                    </Button>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={80} className="rounded-3xl bg-surface p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-[#25D366]/10 text-[#25D366]">
                    <Icon name="whatsapp" size={24} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-fg">
                      {t('whatsappTitle')}
                    </h3>
                    <p className="mt-1.5 text-[15px] text-muted">{t('whatsappText')}</p>
                    <Button
                      href={whatsappLink(t('whatsappMessage'))}
                      external
                      variant="whatsapp"
                      size="sm"
                      className="mt-4"
                      icon="whatsapp"
                    >
                      {tc('whatsapp')}
                    </Button>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={160} className="rounded-3xl bg-surface p-6">
                <div className="space-y-4">
                  <a
                    href={`mailto:${site.email}`}
                    className="flex items-center gap-4 text-muted transition-colors hover:text-accent"
                  >
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-surface text-accent">
                      <Icon name="mail" size={22} />
                    </span>
                    <div>
                      <div className="font-mono text-xs uppercase tracking-wider text-faint">
                        {tc('email')}
                      </div>
                      <div className="font-medium">{site.email}</div>
                    </div>
                  </a>
                  <div className="flex items-start gap-4 text-muted">
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-surface text-accent">
                      <Icon name="pin" size={22} />
                    </span>
                    <div>
                      <div className="font-mono text-xs uppercase tracking-wider text-faint">
                        {tc('location')}
                      </div>
                      <div className="font-medium leading-snug">
                        2 S Biscayne Boulevard Suite 3200 - 6719
                        <br />
                        Miami, Florida 33131, United States
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-3">
            <Reveal delay={100}>
              <ContactForm
                defaultService={servicio}
                defaultMessage={defaultMessage}
                source={origen}
                auditUrl={auditUrl}
                auditScore={auditScore}
              />
            </Reveal>
          </div>
        </div>
      </Section>
    </>
  );
}
