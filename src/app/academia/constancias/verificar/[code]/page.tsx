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
    <main className="academy-page max-w-4xl space-y-4 print:max-w-none print:p-0">
      <p role="status" className="academy-notice font-semibold print:hidden">Constancia verificada por Academia Cluster</p>
      <CertificateDocument certificate={certificate} />
    </main>
  );
}
