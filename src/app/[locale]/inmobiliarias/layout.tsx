import type { ReactNode } from 'react';
import '../clinicas-esteticas/print.css';

export default function InmobiliariasLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
