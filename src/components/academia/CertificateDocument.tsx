import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { formatDate } from '@/lib/crm/format';
import type { Certificate } from '@/lib/valux/certificates';

export function CertificateDocument({ certificate, verificationUrl }: {
  certificate: Omit<Certificate, 'share_code'>;
  verificationUrl?: string;
}) {
  return (
    <article id="constancia-documento" aria-label="Constancia de finalización" className="border border-black/15 bg-white p-5 shadow-sm sm:p-8 print:break-inside-avoid print:shadow-none">
      <VStack gap={6} hAlign="center" className="border border-black/20 border-t-4 border-t-brand px-4 py-8 text-center sm:px-10 sm:py-12 print:py-10">
        <p className="font-brand text-sm font-extrabold uppercase tracking-widest text-ink">Academia Cluster</p>
        <header className="w-full space-y-4">
          <Heading level={1} className="font-display text-4xl tracking-wide sm:text-6xl print:text-5xl">Constancia de finalización</Heading>
          <p className="text-sm text-ink/70">Otorgada a</p>
          <p className="break-words font-brand text-2xl font-bold leading-tight sm:text-4xl print:text-3xl">{certificate.student_name}</p>
          <p className="text-sm text-ink/70">por completar el curso</p>
          <p className="break-words font-brand text-xl font-semibold leading-snug sm:text-2xl">{certificate.course_title}</p>
        </header>
        <dl className="grid w-full gap-4 border-t border-black/15 pt-5 text-sm sm:grid-cols-3 print:grid-cols-3">
          <section><dt className="text-ink/70">Finalización</dt><dd className="mt-1 font-semibold">{formatDate(certificate.completed_at)}</dd></section>
          <section><dt className="text-ink/70">Clases completadas</dt><dd className="mt-1 font-semibold">{certificate.lesson_count}</dd></section>
          <section><dt className="text-ink/70">Emisión</dt><dd className="mt-1 font-semibold">{formatDate(certificate.issued_at)}</dd></section>
        </dl>
        <footer className="w-full space-y-2 border-t border-black/15 pt-4">
          <p className="text-xs text-ink/70">Folio <span className="block break-all font-mono text-ink sm:inline print:inline">{certificate.id}</span></p>
          {verificationUrl ? <p className="break-all text-xs text-ink/70">Verificación <a href={verificationUrl} className="underline underline-offset-2">{verificationUrl}</a></p> : null}
        </footer>
      </VStack>
    </article>
  );
}
