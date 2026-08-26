import type { ReactNode } from 'react';
import { AnalyticsTags } from '@/components/clinicas-esteticas/AnalyticsTags';
import './print.css';

export default function ClinicasEsteticasLayout({
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
