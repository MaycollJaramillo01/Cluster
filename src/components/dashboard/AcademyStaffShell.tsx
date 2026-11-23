'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { AcademyTheme } from '@/components/academia/AcademySurface';
import { Icon } from '@/components/ui/Icon';
import { logout } from '@/lib/crm/access';
import type { NavItem } from './nav';

const areas = [
  { name: 'Contenido', pages: ['', 'marketplace', 'blog', 'retos', 'revisiones'] },
  { name: 'Alumnos', pages: ['fichas', 'personas', 'clientes'] },
  { name: 'Operación', pages: ['analitica', 'ventas', 'cupones', 'transferencias', 'suscripcion', 'liquidaciones', 'donaciones', 'ajustes'] },
];

function StaffNavigation({ items, active, teacher }: { items: NavItem[]; active: string | undefined; teacher: boolean }) {
  const groups = teacher ? [{ name: 'Cursos', items }] : areas.map((area) => ({
    name: area.name,
    items: items.filter((item) => area.pages.includes(item.href.split('/').at(3) || '')),
  }));
  return (
    <VStack as="nav" aria-label={teacher ? 'Panel docente' : 'Administración de Academia'} gap={5} className="px-3 py-4">
      {groups.filter((group) => group.items.length).map((group) => (
        <VStack key={group.name} gap={1}>
          <Text as="p" className="px-3 pb-1 text-xs font-bold text-academy-muted">{group.name}</Text>
          {group.items.map((item) => (
            <Link key={item.href} href={item.href} aria-current={item.href === active ? 'page' : undefined} className="academy-nav academy-focus w-full justify-between">
              {item.label}
              {item.count != null ? <Badge label={String(item.count)} /> : null}
            </Link>
          ))}
        </VStack>
      ))}
    </VStack>
  );
}

export function AcademyStaffShell({ children, teacher, openAccess, path, items, active, sections }: {
  children: ReactNode;
  teacher: boolean;
  openAccess: boolean;
  path: string;
  items: NavItem[];
  active: string | undefined;
  sections: { id: string; href: string; label: string }[];
}) {
  const home = teacher ? '/dashboard/profesor' : '/dashboard/cursos';
  const label = teacher ? 'Panel docente' : 'Administración';
  return (
    <AcademyTheme className="min-h-screen">
      <a href="#panel-academia" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-academy-surface focus:p-3">Saltar al contenido</a>
      <header className="sticky top-0 z-30 border-b border-academy-line bg-academy-surface">
        <HStack gap={3} align="center" justify="between" className="h-[var(--academy-header-size)] px-4 sm:px-6">
          <Link href={home} className="academy-focus flex min-w-0 items-center gap-2.5">
            <HStack align="center" justify="center" className="size-10 shrink-0 rounded-academy bg-academy-ink">
              <Image src="/assets/logo-white.webp" alt="" width={28} height={18} />
            </HStack>
            <Text className="truncate text-base font-bold text-academy-ink">Academia</Text>
            <Text className="hidden border-l border-academy-line pl-2 text-sm font-medium text-academy-muted sm:inline">{label}</Text>
          </Link>
          <HStack align="center" gap={2}>
            {sections.length > 1 ? (
              <details key={path} className="relative">
                <summary className="academy-nav academy-focus cursor-pointer list-none">Secciones <Icon name="chevron-down" size={14} /></summary>
                <VStack as="nav" aria-label="Secciones de Cluster" gap={1} className="academy-panel absolute right-0 z-40 mt-2 min-w-48 p-2 shadow-lg">
                  {sections.map((section) => <Link key={section.id} href={section.href} className="academy-nav academy-focus">{section.label}</Link>)}
                </VStack>
              </details>
            ) : null}
            <Link className="academy-nav academy-focus hidden sm:inline-flex" href="/academia">Ver academia <Icon name="arrow-right" size={14} /></Link>
            {openAccess ? null : <form action={logout}><Button label="Salir" type="submit" size="md" variant="ghost" /></form>}
          </HStack>
        </HStack>
      </header>

      <HStack gap={0} className="min-w-0 flex-1 flex-col md:flex-row">
        <aside className="border-b border-academy-line bg-academy-surface md:w-60 md:shrink-0 md:border-b-0 md:border-r lg:w-64">
          <details key={path} className="md:hidden">
            <summary className="academy-focus flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-4 text-sm font-semibold">
              {active ? items.find((item) => item.href === active)?.label || label : label}
              <Icon name="chevron-down" size={15} />
            </summary>
            <StaffNavigation items={items} active={active} teacher={teacher} />
            <Link href="/academia" className="academy-nav academy-focus m-3">Ver academia <Icon name="arrow-right" size={14} /></Link>
          </details>
          <VStack className="sticky top-[var(--academy-header-size)] hidden max-h-dvh overflow-y-auto md:flex">
            <StaffNavigation items={items} active={active} teacher={teacher} />
          </VStack>
        </aside>
        <main id="panel-academia" tabIndex={-1} className="academy-dashboard-content min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </HStack>
    </AcademyTheme>
  );
}
