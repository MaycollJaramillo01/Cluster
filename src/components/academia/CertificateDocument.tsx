import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { formatDate } from '@/lib/crm/format';
import type { Certificate } from '@/lib/valux/certificates';

export function CertificateDocument({ certificate, verificationUrl }: {
  certificate: Omit<Certificate, 'share_code'>;
  verificationUrl?: string;
}) {
  return (
    <article id="constancia-documento" aria-label="Constancia de finalización" className="min-w-0 rounded-academy-lg border border-academy-line bg-white p-3 shadow-sm sm:p-5 print:break-inside-avoid print:rounded-none print:border-0 print:p-0 print:shadow-none">
      <VStack gap={8} hAlign="center" className="rounded-academy border border-academy-line border-t-4 border-t-academy-action px-5 py-10 text-center sm:px-12 sm:py-14">
        <p className="font-academy-heading text-sm font-bold uppercase tracking-widest text-academy-ink">Academia Cluster</p>
        <VStack as="header" gap={4} className="w-full">
          <Heading level={1} className="font-academy-heading text-3xl font-bold tracking-tight sm:text-5xl print:text-5xl">Constancia de finalización</Heading>
          <p className="text-sm text-academy-muted">Otorgada a</p>
          <p className="break-words font-academy-heading text-3xl font-bold leading-tight text-academy-ink sm:text-4xl">{certificate.student_name}</p>
          <p className="text-sm text-academy-muted">por completar el curso</p>
          <p className="break-words text-xl font-semibold leading-snug sm:text-2xl">{certificate.course_title}</p>
        </VStack>
        <dl className="grid w-full gap-4 border-t border-academy-line pt-6 text-sm sm:grid-cols-3 print:grid-cols-3">
          <VStack gap={1}><dt className="text-academy-muted">Finalización</dt><dd className="font-semibold">{formatDate(certificate.completed_at)}</dd></VStack>
          <VStack gap={1}><dt className="text-academy-muted">Clases completadas</dt><dd className="font-semibold">{certificate.lesson_count}</dd></VStack>
          <VStack gap={1}><dt className="text-academy-muted">Emisión</dt><dd className="font-semibold">{formatDate(certificate.issued_at)}</dd></VStack>
        </dl>
        <footer className="w-full space-y-2 border-t border-academy-line pt-4 text-xs text-academy-muted">
          <p>Folio <code className="break-all font-mono text-academy-ink">{certificate.id}</code></p>
          {verificationUrl ? <p className="break-all">Verificación <a href={verificationUrl} className="text-academy-ink underline underline-offset-2">{verificationUrl}</a></p> : null}
        </footer>
      </VStack>
    </article>
  );
}
