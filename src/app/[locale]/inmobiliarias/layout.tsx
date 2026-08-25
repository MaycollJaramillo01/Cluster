import type { ReactNode } from 'react';
import { AnalyticsTags } from '@/components/clinicas-esteticas/AnalyticsTags';
import '../clinicas-esteticas/print.css';

export default function InmobiliariasLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <AnalyticsTags />
      {children}
    </>
  );
}
