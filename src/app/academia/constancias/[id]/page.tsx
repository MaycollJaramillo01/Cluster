import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { CertificateDocument } from '@/components/academia/CertificateDocument';
import { CopyCertificateLink, PrintCertificate } from '@/components/academia/CertificateTools';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Icon } from '@/components/ui/Icon';
import { setCertificateSharing } from '@/lib/valux/certificate-actions';
import { certificatesPath, ownedCertificate, publicCertificatePath } from '@/lib/valux/certificates';
import { academiaPersonId } from '@/lib/valux/session';
import { site } from '@/lib/site';

export const metadata: Metadata = { title: 'Constancia de finalización · Academia Cluster', robots: { index: false, follow: false }, referrer: 'no-referrer' };

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, personId] = await Promise.all([params, academiaPersonId()]);
  if (!personId) redirect('/academia/entrar');
  const certificate = await ownedCertificate(personId, id);
  if (!certificate) notFound();
  const path = certificate.share_code ? publicCertificatePath(certificate.share_code) : null;
  const origin = process.env.VERCEL_ENV === 'production' ? site.url : process.env.LOCAL_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : site.url);
  return (
    <main className="academy-page max-w-6xl space-y-5 print:max-w-none print:space-y-0 print:p-0">
      <HStack as="header" justify="between" align="center" gap={3} wrap="wrap" className="print:hidden">
        <Link href={certificatesPath} className="academy-nav academy-focus"><Icon name="arrow-right" size={16} className="rotate-180" />Mis constancias</Link>
        <PrintCertificate />
      </HStack>
      <section className="grid items-start gap-6 lg:grid-cols-[1fr_theme(spacing.80)] print:block">
        <CertificateDocument certificate={certificate} verificationUrl={path ? `${origin}${path}` : undefined} />
        <VStack as="aside" gap={4} aria-labelledby="compartir-constancia" className="academy-panel p-5 sm:p-6 lg:sticky lg:top-24 print:hidden">
          <HStack gap={2} align="center">
            <Icon name={path ? 'globe' : 'lock'} size={18} className={path ? 'text-academy-primary' : 'text-academy-muted'} />
            <Heading level={2} id="compartir-constancia" className="text-lg font-bold">Verificación pública</Heading>
          </HStack>
          <strong className={`w-fit rounded-academy-full px-3 py-1 text-xs font-semibold ${path ? 'bg-academy-tint text-academy-primary' : 'bg-academy-page text-academy-muted'}`}>{path ? 'Enlace activo' : 'Desactivada'}</strong>
          <p className="text-sm text-academy-muted">
            {path
              ? 'Cualquiera con el enlace puede ver tu nombre, el curso y la fecha de finalización. Desactívalo cuando quieras; el enlace dejará de funcionar.'
              : 'Activa un enlace para que otra persona verifique tu nombre, el curso y la fecha de finalización. Nadie más puede ver esta constancia.'}
          </p>
          {path ? (
            <VStack gap={2} className="items-start">
              <CopyCertificateLink path={path} />
              <Link prefetch={false} href={path} className="academy-focus inline-flex min-h-11 items-center gap-2 rounded-academy text-sm font-semibold underline underline-offset-4">Ver la verificación <Icon name="arrow-right" size={16} /></Link>
            </VStack>
          ) : null}
          <form action={setCertificateSharing} className="border-t border-academy-line pt-4">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="share" value={path ? '0' : '1'} />
            <AcademySubmit pending={path ? 'Desactivando…' : 'Activando…'} label={path ? 'Desactivar enlace' : 'Activar enlace'} variant={path ? 'secondary' : 'primary'} fullWidth />
          </form>
        </VStack>
      </section>
    </main>
  );
}
