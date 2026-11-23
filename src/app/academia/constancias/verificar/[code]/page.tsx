import type { Metadata } from 'next';
import { CertificateDocument } from '@/components/academia/CertificateDocument';
import { verifyCertificate } from '@/lib/valux/certificates';
import { notFound } from 'next/navigation';

export const metadata: Metadata = { title: 'Verificación de constancia · Academia Cluster', robots: { index: false, follow: false }, referrer: 'no-referrer' };
export const dynamic = 'force-dynamic';

export default async function VerifyCertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const certificate = await verifyCertificate(code);
  if (!certificate) notFound();
  return (
    <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-8 sm:px-6 sm:py-12 print:max-w-none print:p-0">
      <p role="status" className="border border-brand bg-white p-4 text-sm font-semibold print:hidden">Constancia verificada por Academia Cluster</p>
      <CertificateDocument certificate={certificate} />
    </main>
  );
}
