'use client';

import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@/components/ui/Icon';

export function PrintCertificate() {
  return <Button label="Imprimir o guardar PDF" onClick={() => window.print()} className="print:hidden" />;
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
    <Button label="Copiar enlace" onClick={copy} icon={<Icon name="link" size={17} />} />
    {message ? <p role="status" className="w-full text-sm text-ink/70">{message}</p> : null}
  </>;
}
