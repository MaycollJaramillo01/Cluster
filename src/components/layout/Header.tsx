'use client';

import { useTranslations } from 'next-intl';
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
};

const navItems: NavItem[] = [
  { labelKey: 'home', href: '/' },
  {
    labelKey: 'services',
    href: '/servicios',
    children: [
      { labelKey: 'branding', href: '/branding' },
      { labelKey: 'social', href: '/redes-sociales' },
      { labelKey: 'googleAds', href: '/google-ads' },
      { labelKey: 'automation', href: '/automatizaciones-ia' },
      { labelKey: 'websitesSeo', href: '/websites-seo' },
      { labelKey: 'webDev', href: '/desarrollo-web' },
      { labelKey: 'seoAudit', href: '/seo-audit' },
    ],
  },
  { labelKey: 'plans', href: '/#planes' },
  { labelKey: 'cases', href: '/casos-de-exito' },
  { labelKey: 'about', href: '/sobre-cluster' },
  { labelKey: 'blog', href: '/blog' },
  { labelKey: 'contact', href: '/contacto' },
];

export function Header() {
  const t = useTranslations('Nav');
  const tc = useTranslations('Common');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={`header-enter fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open
          ? 'bg-ink-900/80 shadow-[0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="container-x flex h-[76px] items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label={tc('navAria')}>
          {navItems.map((item) => {
            const hasChildren = Boolean(item.children?.length);
            return (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={`inline-flex items-center gap-1 px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.1em] transition-colors ${
                    isActive(item.href)
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

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          <a
            href={whatsappLink(tc('whatsappDefaultMessage'))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tc('whatsapp')}
            className="flex h-10 w-10 items-center justify-center border-0 bg-surface text-muted transition-all hover:bg-[#25D366] hover:text-white"
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
          className="flex h-11 w-11 items-center justify-center border-0 bg-surface text-fg transition-colors hover:bg-surface-2 lg:hidden"
        >
          <Icon name={open ? 'close' : 'menu'} size={22} />
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-line bg-ink-900 transition-[max-height] duration-500 ease-out lg:hidden ${
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
                    className={`flex-1 px-3 py-3 text-lg font-medium ${
                      isActive(item.href) ? 'text-accent' : 'text-fg'
                    }`}
                  >
                    {t(item.labelKey)}
                  </Link>
                  {hasChildren && (
                    <button
                      type="button"
                      onClick={() => setServicesOpen((v) => !v)}
                      aria-label={tc('showServices')}
                      className="flex h-9 w-9 items-center justify-center border-0 text-faint"
                    >
                      <Icon
                        name="chevron-down"
                        size={18}
                        className={`transition-transform ${
                          servicesOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>
                {hasChildren && servicesOpen && (
                  <div className="ml-3 flex flex-col border-l border-line pl-3">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
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
