'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

// Reproduce una animación de entrada cada vez que cambia la ruta.
// El `key={pathname}` fuerza el re-montaje para relanzar la animación.
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
