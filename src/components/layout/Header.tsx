'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { site, whatsappLink } from '@/lib/site';

type NavChild = { labelKey: string; href: string };
type NavItem = {
  labelKey: string;
  href: string;
  children?: NavChild[];
  /** Para secciones que solo existen en un idioma: el enlace siempre lleva a ese. */
  locale?: 'es';
  /** Solo cabe en el menú de escritorio desde 1600 px; en el menú móvil aparece siempre. */
  wideOnly?: boolean;
};

const navItems: NavItem[] = [
  { labelKey: 'home', href: '/', wideOnly: true },
  {
    labelKey: 'services',
    href: '/servicios',
    children: [
      { labelKey: 'branding', href: '/branding' },
      { labelKey: 'social', href: '/redes-sociales' },
      { labelKey: 'googleAds', href: '/google-ads' },
      { labelKey: 'automation', href: '/agentes-ia' },
      { labelKey: 'websitesSeo', href: '/websites-seo' },
      { labelKey: 'webDev', href: '/desarrollo-web' },
      { labelKey: 'seoAudit', href: '/seo-audit' },
    ],
  },
  {
    labelKey: 'solutions',
    href: '/clinicas-esteticas',
    children: [
      { labelKey: 'rutaLocal', href: '/ruta-local' },
      { labelKey: 'clinicasDentales', href: '/clinicas-dentales' },
      { labelKey: 'clinicasEsteticas', href: '/clinicas-esteticas' },
      { labelKey: 'inmobiliarias', href: '/inmobiliarias' },
      { labelKey: 'remodelaciones', href: '/remodelaciones' },
    ],
  },
  {
    labelKey: 'growth',
    href: '/crecimiento/clinicas-esteticas',
    locale: 'es',
    children: [
      { labelKey: 'clinicasEsteticas', href: '/crecimiento/clinicas-esteticas' },
      { labelKey: 'clinicasOdontologicas', href: '/crecimiento/clinicas-odontologicas' },
      { labelKey: 'clinicasMedicas', href: '/crecimiento/clinicas-medicas' },
      { labelKey: 'inmobiliarias', href: '/crecimiento/inmobiliarias' },
      { labelKey: 'construccion', href: '/crecimiento/construccion' },
    ],
  },
  {
    labelKey: 'podcast',
    href: '/participa',
    children: [
      { labelKey: 'podcastParticipate', href: '/participa' },
      {
        labelKey: 'podcastCommercial',
        href: '/participa/asegura-tu-participacion',
      },
      { labelKey: 'podcastSponsors', href: '/patrocinios' },
    ],
  },
  { labelKey: 'plans', href: '/#planes' },
  { labelKey: 'cases', href: '/casos-de-exito' },
  { labelKey: 'about', href: '/sobre-cluster' },
  { labelKey: 'blog', href: '/blog', wideOnly: true },
  { labelKey: 'contact', href: '/contacto', wideOnly: true },
];

export function Header() {
  const t = useTranslations('Nav');
  const tc = useTranslations('Common');
  const pathname = usePathname();
  const currentLocale = useLocale();
  // Solo se fuerza el idioma al enlazar desde otro: en el propio idioma el enlace queda sin prefijo.
  const linkLocale = (item: NavItem) =>
    item.locale === currentLocale ? undefined : item.locale;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const isPodcast = pathname === '/participa' || pathname.startsWith('/participa/') || pathname === '/patrocinios';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // ponytail: única página de fondo claro; si aparecen más, pasar a una lista.
  const solid = pathname === '/agentes-ia';

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  if (
    isPodcast ||
    pathname.startsWith('/acuerdo-proveedores') ||
    pathname.startsWith('/crecimiento')
  ) return null;

  return (
    <header
      className={`header-enter fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid
          ? 'bg-ink-900'
          : scrolled || open
            ? 'bg-ink-900/80 shadow-[0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl'
            : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-[76px] w-full max-w-[1760px] items-center justify-between gap-4 px-5 sm:px-8 min-[1600px]:px-12">
        <Logo className="shrink-0" />

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label={tc('navAria')}>
          {navItems.map((item) => {
            const hasChildren = Boolean(item.children?.length);
            return (
              <div
                key={item.href}
                className={`group relative ${item.wideOnly ? 'hidden min-[1600px]:block' : ''}`}
              >
                <Link
                  href={item.href}
                  locale={linkLocale(item)}
                  className={`inline-flex items-center gap-1 whitespace-nowrap px-2 py-2 font-mono min-[1600px]:px-2.5 text-[10px] font-medium uppercase tracking-[0.08em] transition-colors ${
                    isActive(item.href) ||
                    item.children?.some((child) => isActive(child.href))
                      ? 'text-accent'
                      : 'text-muted hover:text-fg'
                  }`}
                >
                  {t(item.labelKey)}
                  {hasChildren && <Icon name="chevron-down" size={13} />}
                </Link>
                {hasChildren && (
                  <div className="invisible absolute left-0 top-full w-64 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    <div className="overflow-hidden rounded-2xl bg-ink-850/95 p-2 shadow-panel backdrop-blur-xl">
                      {item.children!.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          locale={linkLocale(item)}
                          className="block px-3.5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-accent"
                        >
                          {t(child.labelKey)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          <LanguageSwitcher />
          <a
            href={whatsappLink(tc('whatsappDefaultMessage'))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tc('whatsapp')}
            className="hidden h-10 w-10 items-center justify-center border-0 bg-surface text-muted transition-all hover:bg-[#25D366] hover:text-white min-[1600px]:flex"
          >
            <Icon name="whatsapp" size={18} />
          </a>
          <Button href={site.calendarUrl} size="sm" iconRight="arrow-right">
            {tc('scheduleCall')}
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? tc('closeMenu') : tc('openMenu')}
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center border-0 bg-surface text-fg transition-colors hover:bg-surface-2 xl:hidden"
        >
          <Icon name={open ? 'close' : 'menu'} size={22} />
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-line bg-ink-900 transition-[max-height] duration-500 ease-out xl:hidden ${
          open ? 'max-h-[85vh]' : 'max-h-0'
        }`}
      >
        <nav className="container-x flex flex-col gap-0.5 py-5" aria-label={tc('mobileNavAria')}>
          {navItems.map((item) => {
            const hasChildren = Boolean(item.children?.length);
            return (
              <div key={item.href}>
                <div className="flex items-center justify-between">
                  <Link
                    href={item.href}
                    locale={linkLocale(item)}
                    className={`flex-1 px-3 py-3 text-lg font-medium ${
                      isActive(item.href) ||
                      item.children?.some((child) => isActive(child.href))
                        ? 'text-accent'
                        : 'text-fg'
                    }`}
                  >
                    {t(item.labelKey)}
                  </Link>
                  {hasChildren && (
                    <button
                      type="button"
                      onClick={() =>
                        setOpenGroup((current) =>
                          current === item.href ? null : item.href,
                        )
                      }
                      aria-label={`${tc('showNavGroup')}: ${t(item.labelKey)}`}
                      aria-expanded={openGroup === item.href}
                      className="flex h-9 w-9 items-center justify-center border-0 text-faint"
                    >
                      <Icon
                        name="chevron-down"
                        size={18}
                        className={`transition-transform ${
                          openGroup === item.href ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>
                {hasChildren && openGroup === item.href && (
                  <div className="ml-3 flex flex-col border-l border-line pl-3">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        locale={linkLocale(item)}
                        className="px-3 py-2.5 text-[15px] text-muted"
                      >
                        {t(child.labelKey)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div className="mt-5 flex flex-col gap-2.5">
            <LanguageSwitcher className="self-start" />
            <Button href={site.calendarUrl} icon="calendar">
              {tc('scheduleCall')}
            </Button>
            <Button
              href={whatsappLink(tc('whatsappDefaultMessage'))}
              external
              variant="whatsapp"
              icon="whatsapp"
            >
              {tc('whatsapp')}
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
