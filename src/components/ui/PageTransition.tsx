'use client';

import { usePathname } from 'next/navigation';
import { useRef, type ReactNode } from 'react';

// Reproduce una animación de entrada cada vez que cambia la ruta.
// El `key={pathname}` fuerza el re-montaje para relanzar la animación.
// Se omite en la primera carga.
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hasNavigated = useRef(false);
  const previousPath = useRef(pathname);

  if (previousPath.current !== pathname) {
    hasNavigated.current = true;
    previousPath.current = pathname;
  }

  return (
    <div
      key={pathname}
      className={hasNavigated.current ? 'page-enter' : undefined}
    >
      {children}
    </div>
  );
}
