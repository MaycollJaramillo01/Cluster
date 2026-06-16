'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { mainNav, site, whatsappLink } from '@/lib/site';

export function Header() {
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

        {/* Navegación de escritorio */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Principal">
          {mainNav.map((item) => {
            const hasChildren = 'children' in item && item.children;
            return (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={`inline-flex items-center gap-1 px-3.5 py-2 text-sm font-medium tracking-tight transition-colors ${
                    isActive(item.href)
                      ? 'text-brand-300'
                      : 'text-paper/70 hover:text-paper'
                  }`}
                >
                  {item.label}
                  {hasChildren && <Icon name="chevron-down" size={13} />}
                </Link>
                {hasChildren && (
                  <div className="invisible absolute left-0 top-full w-64 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    <div className="overflow-hidden rounded-2xl bg-ink-850/95 p-2 shadow-panel backdrop-blur-xl">
                      {item.children!.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-3.5 py-2.5 text-sm font-medium text-paper/65 transition-colors hover:bg-brand/10 hover:text-brand-300"
                        >
                          {child.label}
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
          <a
            href={whatsappLink('Hola Cluster Media, quiero más información.')}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="flex h-10 w-10 items-center justify-center border-0 bg-white/[0.08] text-paper/80 transition-all hover:bg-[#25D366] hover:text-white"
          >
            <Icon name="whatsapp" size={18} />
          </a>
          <Button href={site.calendarUrl} external size="sm" iconRight="arrow-right">
            Agendar llamada
          </Button>
        </div>

        {/* Botón menú móvil */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center border-0 bg-white/[0.08] text-paper transition-colors hover:bg-white/[0.16] lg:hidden"
        >
          <Icon name={open ? 'close' : 'menu'} size={22} />
        </button>
      </div>

      {/* Menú móvil */}
      <div
        className={`overflow-hidden border-t border-white/10 bg-ink-900 transition-[max-height] duration-500 ease-out lg:hidden ${
          open ? 'max-h-[85vh]' : 'max-h-0'
        }`}
      >
        <nav className="container-x flex flex-col gap-0.5 py-5" aria-label="Móvil">
          {mainNav.map((item) => {
            const hasChildren = 'children' in item && item.children;
            return (
              <div key={item.href}>
                <div className="flex items-center justify-between">
                  <Link
                    href={item.href}
                    className={`flex-1 px-3 py-3 text-lg font-medium ${
                      isActive(item.href) ? 'text-brand-300' : 'text-paper'
                    }`}
                  >
                    {item.label}
                  </Link>
                  {hasChildren && (
                    <button
                      type="button"
                      onClick={() => setServicesOpen((v) => !v)}
                      aria-label="Mostrar servicios"
                      className="flex h-9 w-9 items-center justify-center border-0 text-paper/50"
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
                  <div className="ml-3 flex flex-col border-l border-white/10 pl-3">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="px-3 py-2.5 text-[15px] text-paper/60"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div className="mt-5 flex flex-col gap-2.5">
            <Button href={site.calendarUrl} external icon="calendar">
              Agendar llamada
            </Button>
            <Button
              href={whatsappLink('Hola Cluster Media, quiero más información.')}
              external
              variant="whatsapp"
              icon="whatsapp"
            >
              Escribir por WhatsApp
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
