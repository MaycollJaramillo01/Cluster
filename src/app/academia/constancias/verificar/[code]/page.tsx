import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { CertificateDocument } from '@/components/academia/CertificateDocument';
import { Icon } from '@/components/ui/Icon';
import { formatDate } from '@/lib/crm/format';
import { verifyCertificate } from '@/lib/valux/certificates';

export const metadata: Metadata = { title: 'Verificación de constancia · Academia Cluster', robots: { index: false, follow: false }, referrer: 'no-referrer' };
export const dynamic = 'force-dynamic';

export default async function VerifyCertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const certificate = await verifyCertificate(code);
  if (!certificate) notFound();
  return (
    <main className="academy-page max-w-4xl space-y-6 print:max-w-none print:space-y-0 print:p-0">
      <HStack as="section" role="status" gap={4} align="start" className="academy-panel p-5 sm:p-6 print:hidden">
        <strong aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-academy-full bg-academy-action text-academy-action-text"><Icon name="check" size={20} strokeWidth={2.5} /></strong>
        <VStack gap={1} className="min-w-0">
          <Heading level={2} className="text-lg font-bold">Constancia verificada</Heading>
          <p className="text-sm text-academy-muted">
            Academia Cluster emitió esta constancia a {certificate.student_name} por completar {certificate.course_title} el {formatDate(certificate.completed_at)}.
          </p>
        </VStack>
      </HStack>
      <CertificateDocument certificate={certificate} />
    </main>
  );
}
