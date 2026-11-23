'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

const buttonClass = 'inline-flex min-h-11 items-center justify-center gap-2 border border-black/25 bg-white px-4 text-sm font-semibold hover:border-ink hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

export function PrintCertificate() {
  return <button type="button" onClick={() => window.print()} className={`${buttonClass} print:hidden`}>
    Imprimir o guardar PDF
  </button>;
}

export function CopyCertificateLink({ path }: { path: string }) {
  const [message, setMessage] = useState('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(new URL(path, window.location.origin).href);
      setMessage('Enlace copiado.');
    } catch {
      setMessage('Abre la verificación y copia la dirección desde el navegador.');
    }
  }
  return <>
    <button type="button" onClick={copy} className={buttonClass}><Icon name="link" size={17} aria-hidden="true" />Copiar enlace</button>
    {message ? <p role="status" className="w-full text-sm text-ink/70">{message}</p> : null}
  </>;
}
