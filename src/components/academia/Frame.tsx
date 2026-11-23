'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { Icon } from '@/components/ui/Icon';
import { leaveAcademia } from '@/lib/valux/actions';
import { AcademyTheme } from './AcademySurface';

const links = [
  ['/academia', 'Cursos'],
  ['/academia/marketplace', 'Marketplace'],
  ['/academia/blog', 'Blog'],
  ['/academia/retos', 'Retos'],
] as const;

const reserved = new Set(['marketplace', 'blog', 'paypal', 'stripe', 'entrar', 'perfil', 'ficha', 'apoyar', 'suscripcion', 'mis-cursos', 'transferencia', 'recibos', 'retos', 'constancias']);

function AcademyBrand() {
  return (
    <Link href="/academia" className="academy-focus flex shrink-0 items-center gap-2.5" aria-label="Academia Cluster">
      <HStack align="center" justify="center" className="size-10 shrink-0 rounded-academy bg-academy-ink">
        <Image src="/assets/logo-white.webp" alt="" width={28} height={18} className="w-7" />
      </HStack>
      <Text className="text-lg font-bold tracking-tight text-academy-ink">Academia</Text>
    </Link>
  );
}

export function Frame({ children, signedIn }: { children: ReactNode; signedIn: boolean }) {
  const path = usePathname();
  const previousPath = useRef(path);
  const menu = useRef<HTMLElement>(null);
  const parts = path.split('/').filter(Boolean);
  const coursePath = parts[0] === 'academia' && parts.length >= 2 && !reserved.has(parts[1]);
  const classroom = coursePath && parts.length >= 3;
  const printing = path.startsWith('/academia/constancias/') || path.startsWith('/academia/recibos/');

  function closeMenu() {
    if (menu.current?.matches(':popover-open')) menu.current.hidePopover();
  }

  useEffect(() => {
    if (path !== previousPath.current) closeMenu();
    previousPath.current = path;
  }, [path]);

  const isCurrent = (href: string) => path === href || (href === '/academia' ? coursePath : path.startsWith(`${href}/`));
  const nav = links.map(([href, label]) => (
    <Link key={href} href={href} aria-current={isCurrent(href) ? 'page' : undefined} className="academy-nav academy-focus" onClick={closeMenu}>{label}</Link>
  ));
  const library = <Link href="/academia/mis-cursos" className="academy-nav academy-focus" aria-current={isCurrent('/academia/mis-cursos') ? 'page' : undefined} onClick={closeMenu}>Mis cursos</Link>;

  if (classroom) return <AcademyTheme className="min-h-screen">{children}</AcademyTheme>;
  return (
    <AcademyTheme className={`min-h-screen ${printing ? 'print:block print:min-h-0 print:bg-white' : ''}`}>
      <a href="#academia-contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-academy-ink focus:px-4 focus:py-3 focus:text-white">Saltar al contenido</a>
      <header className={`sticky top-0 z-20 border-b border-academy-line bg-academy-surface ${printing ? 'print:hidden' : ''}`}>
        <HStack gap={4} align="center" className="mx-auto h-[var(--academy-header-size)] w-full max-w-7xl px-4 sm:gap-6 sm:px-6 lg:px-8">
          <AcademyBrand />
          <nav aria-label="Academia" className="hidden min-w-0 flex-1 items-center gap-1 md:flex">{nav}</nav>
          <HStack gap={2} align="center" className="ml-auto shrink-0">
            <HStack className={signedIn ? 'hidden sm:flex' : 'hidden lg:flex'}>{library}</HStack>
            {signedIn ? (
              <>
                <Link href="/academia/perfil" aria-label="Mi perfil" title="Mi perfil" aria-current={isCurrent('/academia/perfil') ? 'page' : undefined} className="academy-nav academy-focus justify-center px-0">
                  <Icon name="user" size={19} aria-hidden="true" className="mx-3" />
                </Link>
                <form action={leaveAcademia} className="hidden md:block">
                  <Button type="submit" variant="ghost" label="Salir" />
                </form>
              </>
            ) : <Button as={Link} href="/academia/entrar" label="Entrar" variant="primary" className="min-h-11" />}
            <button type="button" popoverTarget="academia-menu" aria-label="Menú" className="academy-nav academy-focus justify-center px-0 md:hidden">
              <Icon name="menu" size={21} className="mx-3" />
            </button>
            <nav ref={menu} popover="auto" id="academia-menu" aria-label="Menú de Academia" className="academy-popover border-b border-academy-line bg-academy-surface shadow-lg md:hidden">
              <VStack gap={1} className="p-4">
                {nav}
                {library}
                {signedIn ? <form action={leaveAcademia}><Button variant="ghost" type="submit" label="Salir" /></form> : null}
              </VStack>
            </nav>
          </HStack>
        </HStack>
      </header>
      <VStack id="academia-contenido" tabIndex={-1} className="flex-1 scroll-mt-20">{children}</VStack>
      <footer className={`border-t border-academy-line bg-academy-surface ${printing ? 'print:hidden' : ''}`}>
        <HStack align="start" justify="between" wrap="wrap" gap={5} className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <AcademyBrand />
          <nav aria-label="Servicios y cuenta" className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-academy-muted">
            <Link href="/academia/suscripcion" className="academy-focus hover:text-academy-primary">Suscripción</Link>
            <Link href="/academia/apoyar" className="academy-focus hover:text-academy-primary">Apoyar</Link>
            <Link href="/academia/ficha" className="academy-focus hover:text-academy-primary">Ficha de asociado</Link>
            <Link href="/academia/recibos" className="academy-focus hover:text-academy-primary">Recibos</Link>
            <Link href="/academia/constancias" className="academy-focus hover:text-academy-primary">Constancias</Link>
            <Link href="/dashboard/cursos" className="academy-focus hover:text-academy-primary">Panel</Link>
          </nav>
        </HStack>
      </footer>
    </AcademyTheme>
  );
}
