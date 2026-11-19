'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { leaveAcademia } from '@/lib/valux/actions';

const links = [
  ['/academia', 'Cursos'],
  ['/academia/marketplace', 'Marketplace'],
  ['/academia/blog', 'Blog'],
  ['/academia/retos', 'Retos'],
];

const reserved = new Set(['marketplace', 'blog', 'paypal', 'stripe', 'entrar', 'perfil', 'ficha', 'apoyar', 'suscripcion', 'mis-cursos', 'transferencia', 'recibos', 'retos']);

function classroomPath(path: string) {
  const parts = path.split('/').filter(Boolean);
  return parts[0] === 'academia' && parts.length >= 3 && !reserved.has(parts[1]);
}

// Menú del celular (transitions.dev, menu dropdown): abre en 250ms y cierra en 150ms.
function useMenu() {
  const [state, setState] = useState<'closed' | 'open' | 'closing'>('closed');
  const close = () => {
    setState((current) => (current === 'open' ? 'closing' : current));
    const ms = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dropdown-close-dur')) || 150;
    setTimeout(() => setState((current) => (current === 'closing' ? 'closed' : current)), ms);
  };
  return { state, open: () => setState('open'), close, reset: () => setState('closed') };
}

// name: nombre de la persona con sesión, o null si no entró.
export function Frame({ children, name }: { children: ReactNode; name: string | null }) {
  const path = usePathname();
  const menu = useMenu();
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const isOpen = menu.state === 'open';

  const { reset, close } = menu;
  // Al cambiar de página el menú queda cerrado.
  useEffect(() => reset(), [path]);

  // Escape o un toque fuera del encabezado lo cierran.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      close();
      toggle.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [isOpen]);

  if (classroomPath(path)) return <div className="min-h-screen bg-ink">{children}</div>;

  const row = 'flex h-12 items-center text-base';

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header ref={header} className="sticky top-0 z-20 border-b border-black/10 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-6">
          <Link href="/academia" className="font-brand text-sm font-extrabold uppercase tracking-[0.18em]">
            Academia
          </Link>
          <nav aria-label="Academia" className="hidden min-w-0 flex-1 items-center gap-5 text-sm text-black/70 md:flex">
            {links.map(([href, label]) => (
              <Link key={href} href={href} aria-current={path === href ? 'page' : undefined} className={`shrink-0 ${path === href ? 'font-medium text-ink' : 'hover:text-ink'}`}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-3 text-sm sm:gap-4">
            <Link href="/academia/mis-cursos" className={`text-black/70 hover:text-ink ${name ? '' : 'hidden md:inline'}`}>Mis cursos</Link>
            {name ? (
              <>
                <Link href="/academia/perfil" aria-label={`Perfil de ${name}`} className="hidden max-w-[10rem] truncate text-black/70 hover:text-ink lg:inline">
                  {name}
                </Link>
                <form action={leaveAcademia} className="hidden md:block">
                  <button type="submit" className="border border-black/15 px-3 py-2 hover:border-ink">Salir</button>
                </form>
              </>
            ) : (
              <Link href="/academia/entrar" className="bg-ink px-3 py-2 text-white">Entrar</Link>
            )}
            <button
              ref={toggle}
              type="button"
              aria-label="Menú"
              aria-expanded={isOpen}
              aria-controls="academia-menu"
              onClick={isOpen ? close : menu.open}
              className="flex h-11 w-11 items-center justify-center border border-black/15 hover:border-ink md:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                {isOpen ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
              </svg>
            </button>
          </div>
        </div>

        <div
          id="academia-menu"
          data-origin="top-right"
          inert={!isOpen}
          className={`t-dropdown absolute inset-x-0 top-full border-b border-black/10 bg-white md:hidden ${isOpen ? 'is-open' : menu.state === 'closing' ? 'is-closing' : ''}`}
        >
          <nav aria-label="Academia" className="px-4 py-2">
            <ul>
              {links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} onClick={close} aria-current={path === href ? 'page' : undefined} className={`${row} ${path === href ? 'font-medium text-ink' : 'text-black/75'}`}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            {name ? (
              <div className="mt-2 border-t border-black/10 pt-2">
                <Link href="/academia/perfil" onClick={close} className={`${row} text-black/75`}>
                  <span className="truncate">{name}</span>
                </Link>
                <form action={leaveAcademia}>
                  <button type="submit" className={`${row} w-full text-black/75`}>Salir</button>
                </form>
              </div>
            ) : (
              <div className="mt-2 border-t border-black/10 pt-2">
                <Link href="/academia/mis-cursos" onClick={close} className={`${row} text-black/75`}>Mis cursos</Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-6 gap-y-2 px-4 py-6 text-sm text-black/55">
          <Link href="/academia/suscripcion" className="hover:text-ink">Suscripción</Link>
          <Link href="/academia/apoyar" className="hover:text-ink">Apoyar</Link>
          <Link href="/academia/ficha" className="hover:text-ink">Ficha de asociado</Link>
          <Link href="/academia/perfil" className="hover:text-ink">Perfil</Link>
          <Link href="/academia/recibos" className="hover:text-ink">Recibos</Link>
          <Link href="/dashboard/cursos" className="hover:text-ink">Panel</Link>
        </div>
      </footer>
    </div>
  );
}
