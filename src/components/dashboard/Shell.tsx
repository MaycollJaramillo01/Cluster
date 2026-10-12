'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { logout } from '@/lib/crm/access';
import type { SidebarCounts } from '@/lib/crm/types';
import { itemsFor, sectionFor, sections, type NavItem } from './nav';

function itemActive(item: NavItem, pathname: string, params: URLSearchParams) {
  const [path, query = ''] = item.href.split('#')[0].split('?');
  const expected = new URLSearchParams(query);
  const expectedKeys = [...expected.keys()];
  const sameQuery = expectedKeys.every((key) => params.get(key) === expected.get(key));
  const noExtra =
    expectedKeys.length > 0 ||
    (!params.get('segment') && !params.get('membership') && !params.get('kind') && !params.get('stage'));

  if (item.match === 'contacts-root') {
    return (
      pathname === '/dashboard/contactos' ||
      /^\/dashboard\/contactos\/(?!envios$|ajustes$)[^/]+$/.test(pathname)
    ) && !params.get('segment') && !params.get('membership');
  }

  if (pathname !== path) {
    return item.match === 'prefix' && pathname.startsWith(`${path}/`) && expectedKeys.length === 0;
  }

  if (expectedKeys.length > 0) return sameQuery;
  if (item.match === 'prefix') return true;
  return noExtra;
}

export function Shell({
  children,
  counts,
  account,
}: {
  children: ReactNode;
  counts: SidebarCounts;
  account: string;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const section = sectionFor(pathname);
  const items = itemsFor(section.id, counts);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-2 bg-ink px-3 text-white">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2 px-1">
          <Image src="/assets/logo-white.webp" alt="" width={112} height={62} className="h-7 w-auto" />
          <span className="hidden leading-none sm:flex sm:flex-col">
            <span className="font-brand text-[13px] font-extrabold uppercase tracking-[0.18em]">Cluster</span>
            <span className="mt-0.5 font-brand text-[10px] font-light uppercase tracking-[0.32em] text-white/60">Media</span>
          </span>
        </Link>
        <nav className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto" aria-label="Secciones">
          {sections.map((item) => {
            const active = item.id === section.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`shrink-0 px-3 py-1.5 text-[13px] ${active ? 'bg-brand font-medium text-ink' : 'text-white/70 hover:text-white'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/" className="hidden shrink-0 px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/60 hover:text-white sm:inline">
          Ver sitio
        </Link>
        <form action={logout}>
          <button className="shrink-0 px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/60 hover:text-white" type="submit">
            Salir
          </button>
        </form>
      </header>
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col md:flex-row">
        <aside className="border-b border-black/10 bg-white md:w-72 md:shrink-0 md:border-b-0 md:border-r">
          <div className="px-5 py-6 md:px-6 md:py-8">
            <h2 className="font-display text-4xl tracking-wide">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-black/55">{section.description}</p>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-col md:px-3 md:pb-8" aria-label={section.title}>
            {items.map((item) => {
              const active = itemActive(item, pathname, params);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex shrink-0 items-center justify-between gap-3 border-l-2 px-3 py-2 text-sm md:w-full ${
                    active ? 'border-brand bg-brand/10 font-medium text-ink' : 'border-transparent text-black/70 hover:bg-black/[0.03] hover:text-ink'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {item.count != null ? <span className="font-mono text-xs text-black/40">{item.count}</span> : null}
                </Link>
              );
            })}
          </nav>
          <p className="hidden truncate px-6 pb-8 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-black/35 md:block">
            {account}
          </p>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
