'use client';

import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

// Botón de envío que avisa mientras el servidor responde, y no se puede pulsar dos veces.
export function SubmitButton({ children, pending, className = '' }: { children: ReactNode; pending: string; className?: string }) {
  const status = useFormStatus();
  return (
    <button
      type="submit"
      disabled={status.pending}
      aria-busy={status.pending}
      className={`inline-flex h-12 w-full items-center justify-center gap-2 bg-brand px-5 text-base font-medium text-ink transition-opacity duration-150 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-70 ${className}`}
    >
      {status.pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/25 border-t-ink motion-reduce:animate-none" aria-hidden="true" />
          {pending}
        </>
      ) : children}
    </button>
  );
}
