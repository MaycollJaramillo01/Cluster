'use client';

import { useRef, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

export function MobileSyllabus({ children }: { children: ReactNode }) {
  const details = useRef<HTMLDetailsElement>(null);
  const toggle = useRef<HTMLElement>(null);
  function close() {
    if (!details.current?.open) return;
    details.current.open = false;
    toggle.current?.focus();
  }

  return (
    <details ref={details} className="group lg:hidden" onKeyDown={(event) => {
      if (event.key === 'Escape' && details.current?.open) {
        event.preventDefault();
        close();
      }
    }}>
      <summary ref={toggle} className="flex min-h-11 cursor-pointer list-none items-center gap-1 border border-white/20 px-3 text-sm focus-visible:outline focus-visible:outline-2 [&::-webkit-details-marker]:hidden">
        Temario
        <Icon name="chevron-down" size={16} className="transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <section className="t-sheet fixed inset-x-0 bottom-0 top-14 overflow-y-auto overscroll-contain border-t border-black/10 bg-white">
        <header className="flex justify-end border-b border-black/10 px-4">
          <button type="button" className="min-h-11 px-3 text-sm font-semibold text-ink underline underline-offset-4 focus-visible:outline focus-visible:outline-2" onClick={close}>Cerrar temario</button>
        </header>
        {children}
      </section>
    </details>
  );
}
