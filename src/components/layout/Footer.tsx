'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/ui/Logo';
import { Icon, type IconName } from '@/components/ui/Icon';
import { site, whatsappLink } from '@/lib/site';

const socials: { name: IconName; href: string; label: string }[] = [
  { name: 'instagram', href: site.social.instagram, label: 'Instagram' },
  { name: 'facebook', href: site.social.facebook, label: 'Facebook' },
  { name: 'linkedin', href: site.social.linkedin, label: 'LinkedIn' },
  { name: 'youtube', href: site.social.youtube, label: 'YouTube' },
];

export function Footer() {
  const t = useTranslations('Footer');
  const tn = useTranslations('Nav');
  const tc = useTranslations('Common');

  const columns = [
    {
      title: t('servicesTitle'),
      links: [
        { label: tn('branding'), href: '/branding' },
        { label: t('monthlyPlans'), href: '/#planes' },
        { label: tn('social'), href: '/redes-sociales' },
        { label: tn('googleAds'), href: '/google-ads' },
        { label: tn('automation'), href: '/automatizaciones-ia' },
        { label: tn('websitesSeo'), href: '/websites-seo' },
        { label: tn('seoAudit'), href: '/seo-audit' },
      ],
    },
    {
      title: tn('solutions'),
      links: [
        { label: tn('rutaLocal'), href: '/ruta-local' },
        { label: tn('clinicasDentales'), href: '/clinicas-dentales' },
        { label: tn('clinicasEsteticas'), href: '/clinicas-esteticas' },
        { label: tn('inmobiliarias'), href: '/inmobiliarias' },
        { label: tn('remodelaciones'), href: '/remodelaciones' },
      ],
    },
    {
      title: t('companyTitle'),
      links: [
        { label: tn('about'), href: '/sobre-cluster' },
        { label: tn('cases'), href: '/casos-de-exito' },
        { label: tn('blog'), href: '/blog' },
        { label: tn('contact'), href: '/contacto' },
        { label: tn('careers'), href: '/carreras' },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink-950 text-white">
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        aria-hidden="true"
      />
      <div className="container-x relative">
        <div className="grid gap-12 py-16 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-3">
            <Logo variant="light" />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/55">
              {t('tagline')}
            </p>
            <div className="mt-6 flex gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center border-0 bg-surface text-muted transition-colors hover:bg-accent hover:text-accent-fg"
                >
                  <Icon name={s.name} size={18} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[15px] text-white/65 transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              {t('contactTitle')}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={site.calendarUrl}
                  className="inline-flex items-center gap-2.5 text-[15px] text-white/65 transition-colors hover:text-accent"
                >
                  <Icon
                    name="calendar"
                    size={17}
                    className="shrink-0 text-accent"
                  />
                  {tc('scheduleCall')}
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-[15px] text-white/65 transition-colors hover:text-accent"
                >
                  <Icon
                    name="whatsapp"
                    size={17}
                    className="shrink-0 text-accent"
                  />
                  {tc('whatsapp')}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-2.5 text-[15px] text-white/65 transition-colors hover:text-accent"
                >
                  <Icon name="mail" size={17} className="shrink-0 text-accent" />
                  {site.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-[15px] text-white/65">
                <Icon
                  name="pin"
                  size={17}
                  className="mt-0.5 shrink-0 text-accent"
                />
                <span className="leading-snug">
                  {t('addressLine1')}
                  <br />
                  {t('addressLine2')}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative flex flex-col items-center gap-4 border-t border-line py-7">
          <div className="flex gap-6 sm:absolute sm:left-0 sm:top-1/2 sm:-translate-y-1/2">
            <Link
              href="/privacidad"
              className="text-sm text-white/45 transition-colors hover:text-white/80"
            >
              {tc('privacyPolicy')}
            </Link>
            <Link
              href="/terminos"
              className="text-sm text-white/45 transition-colors hover:text-white/80"
            >
              {tc('termsConditions')}
            </Link>
          </div>
          <p className="text-center text-sm text-white/45">
            © {new Date().getFullYear()} {site.name}. {tc('allRights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
