'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { Icon } from '@/components/ui/Icon';
import { leaveAcademia } from '@/lib/valux/actions';
import { AcademyTheme } from './AcademySurface';

const links = [
  ['/academia', 'Inicio'],
  ['/academia?vista=catalogo#catalogo', 'Catálogo'],
  ['/academia/marketplace', 'Marketplace'],
  ['/academia/blog', 'Blog'],
  ['/academia/retos', 'Retos'],
] as const;

const reserved = new Set(['marketplace', 'blog', 'paypal', 'stripe', 'entrar', 'perfil', 'ficha', 'apoyar', 'suscripcion', 'mis-cursos', 'transferencia', 'recibos', 'retos', 'constancias']);

function AcademyBrand() {
  return (
    <Link href="/academia" className="academy-focus flex shrink-0 items-center gap-2.5" aria-label="Academia Cluster">
      <HStack align="center" justify="center" className="size-10 shrink-0 rounded-academy bg-academy-action shadow-sm">
        <Image src="/assets/logo-white.webp" alt="" width={28} height={18} className="h-auto w-7" />
      </HStack>
      <VStack gap={0}>
        <Text className="text-lg font-bold leading-tight tracking-tight text-academy-ink">Cluster</Text>
        <Text className="text-xs font-semibold leading-tight text-academy-primary">Academia</Text>
      </VStack>
    </Link>
  );
}

export function Frame({ children, signedIn }: { children: ReactNode; signedIn: boolean }) {
  const path = usePathname();
  const query = useSearchParams();
  const previousPath = useRef(path);
  const menu = useRef<HTMLElement>(null);
  const parts = path.split('/').filter(Boolean);
  const coursePath = parts[0] === 'academia' && parts.length >= 2 && !reserved.has(parts[1]);
  const classroom = coursePath && parts.length >= 3;
  const browsing = path === '/academia' && (query.get('vista') === 'catalogo' || ['q', 'tipo', 'categoria', 'error'].some((key) => query.get(key)));
  const printing = path.startsWith('/academia/constancias/') || path.startsWith('/academia/recibos/');

  function closeMenu() {
    if (menu.current?.matches(':popover-open')) menu.current.hidePopover();
  }

  useEffect(() => {
    if (path !== previousPath.current) closeMenu();
    previousPath.current = path;
  }, [path]);

  const isCurrent = (href: string) => {
    if (href === '/academia') return path === href && !browsing;
    if (href.startsWith('/academia?')) return coursePath || browsing;
    return path === href || path.startsWith(`${href}/`);
  };
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
          <nav aria-label="Academia" className="hidden min-w-0 flex-1 items-center gap-1 xl:flex">{nav}</nav>
          <HStack gap={2} align="center" className="ml-auto shrink-0">
            <Link href="/academia?vista=catalogo#course-search" aria-label="Buscar cursos" className="academy-nav academy-focus justify-center px-3"><Icon name="search" size={19} aria-hidden="true" /></Link>
            {signedIn ? <HStack className="hidden sm:flex">{library}</HStack> : null}
            {signedIn ? (
              <>
                <Link href="/academia/perfil" aria-label="Mi perfil" title="Mi perfil" aria-current={isCurrent('/academia/perfil') ? 'page' : undefined} className="academy-nav academy-focus justify-center px-0">
                  <Icon name="user" size={19} aria-hidden="true" className="mx-3" />
                </Link>
                <form action={leaveAcademia} className="hidden xl:block">
                  <Button type="submit" variant="ghost" label="Salir" />
                </form>
              </>
            ) : <>
              <Link href="/academia/entrar" className="academy-nav academy-focus hidden sm:inline-flex">Iniciar sesión</Link>
              <Button as={Link} href="/academia?vista=catalogo#catalogo" label="Empieza a aprender" variant="primary" className="hidden min-h-11 lg:inline-flex" />
              <Link href="/academia/entrar" aria-label="Iniciar sesión" className="academy-nav academy-focus px-3 sm:hidden"><Icon name="user" size={19} aria-hidden="true" /></Link>
            </>}
            <button type="button" popoverTarget="academia-menu" aria-label="Menú" className="academy-nav academy-focus justify-center px-0 xl:hidden">
              <Icon name="menu" size={21} className="mx-3" />
            </button>
            <nav ref={menu} popover="auto" id="academia-menu" aria-label="Menú de Academia" className="academy-popover border-b border-academy-line bg-academy-surface shadow-lg xl:hidden">
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
      <footer className={`border-t border-academy-line bg-academy-deep text-white ${printing ? 'print:hidden' : ''}`}>
        <VStack gap={8} className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Grid columns={{ minWidth: 200, max: 4 }} gap={8}>
            <VStack gap={3}>
              <Text className="text-xl font-bold text-white">Academia Cluster</Text>
              <Text as="p" className="max-w-xs text-sm leading-relaxed text-white/75">Habilidades digitales para llevar tus ideas a la práctica y hacer crecer tu negocio.</Text>
            </VStack>
            {[
              { title: 'Explora', links: [['/academia?vista=catalogo#catalogo', 'Todos los cursos'], ['/academia?tipo=gratis#catalogo', 'Cursos gratuitos'], ['/academia/marketplace', 'Marketplace'], ['/academia/blog', 'Blog']] },
              { title: 'Tu aprendizaje', links: [['/academia/mis-cursos', 'Mis cursos'], ['/academia/constancias', 'Mis constancias'], ['/academia/recibos', 'Mis recibos'], ['/academia/perfil', 'Mi cuenta']] },
              { title: 'Academia', links: [['/academia/suscripcion', 'Suscripciones'], ['/academia/retos', 'Retos'], ['/academia/apoyar', 'Apoyar la academia'], ['/dashboard/cursos', 'Panel de gestión']] },
            ].map((group) => (
              <VStack as="nav" aria-label={group.title} key={group.title} gap={2}>
                <Text as="p" className="mb-1 font-semibold text-white">{group.title}</Text>
                {group.links.map(([href, label]) => <Link key={href} href={href} className="academy-focus w-fit py-1 text-sm text-white/75 transition-colors hover:text-white">{label}</Link>)}
              </VStack>
            ))}
          </Grid>
          <Text as="p" className="border-t border-white/15 pt-5 text-sm text-white/65">Aprende a tu ritmo. Aplica lo que aprendes.</Text>
        </VStack>
      </footer>
    </AcademyTheme>
  );
}
