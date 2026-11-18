'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
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

// name: nombre de la persona con sesión, o null si no entró.
export function Frame({ children, name }: { children: ReactNode; name: string | null }) {
  const path = usePathname();
  if (classroomPath(path)) return <div className="min-h-screen bg-ink">{children}</div>;

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-black/10 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:gap-6">
          <Link href="/academia" className="font-brand text-sm font-extrabold uppercase tracking-[0.18em]">
            Academia
          </Link>
          <nav className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto text-sm text-black/70">
            {links.map(([href, label]) => (
              <Link key={href} href={href} className={`shrink-0 ${path === href ? 'font-medium text-ink' : 'hover:text-ink'}`}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-3 text-sm sm:gap-4">
            <Link href="/academia/mis-cursos" className="text-black/70 hover:text-ink">Mis cursos</Link>
            {name ? (
              <>
                <Link href="/academia/perfil" aria-label={`Perfil de ${name}`} className="hidden max-w-[10rem] truncate text-black/70 hover:text-ink sm:inline">
                  {name}
                </Link>
                <form action={leaveAcademia}>
                  <button type="submit" className="border border-black/15 px-3 py-2 hover:border-ink">Salir</button>
                </form>
              </>
            ) : (
              <Link href="/academia/entrar" className="bg-ink px-3 py-2 text-white">Entrar</Link>
            )}
          </div>
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
