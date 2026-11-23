import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { CertificateDocument } from '@/components/academia/CertificateDocument';
import { CopyCertificateLink, PrintCertificate } from '@/components/academia/CertificateTools';
import { SubmitButton } from '@/components/ui/SubmitButton';
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
    <main className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8 sm:px-6 sm:py-12 print:max-w-none print:space-y-0 print:p-0">
      <header className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={certificatesPath} className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">← Mis constancias</Link>
        <PrintCertificate />
      </header>
      <CertificateDocument certificate={certificate} verificationUrl={path ? `${origin}${path}` : undefined} />
      <section className="space-y-3 border border-black/15 bg-white p-5 print:hidden" aria-labelledby="compartir-constancia">
        <h2 id="compartir-constancia" className="font-brand text-lg font-semibold normal-case">Compartir verificación</h2>
        <p className="text-sm text-ink/70">{path ? 'Cualquiera con el enlace puede verificar tu nombre, el curso y la fecha de finalización.' : 'Al activar el enlace público, quien lo reciba podrá verificar tu nombre, el curso y la fecha de finalización.'}</p>
        <section className="flex flex-wrap items-center gap-3" aria-label="Opciones de verificación">
          <form action={setCertificateSharing}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="share" value={path ? '0' : '1'} />
            <SubmitButton pending={path ? 'Desactivando…' : 'Activando…'} className="sm:w-auto">{path ? 'Desactivar enlace público' : 'Activar enlace público'}</SubmitButton>
          </form>
          {path ? <>
            <CopyCertificateLink path={path} />
            <Link prefetch={false} href={path} className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">Ver verificación</Link>
          </> : null}
        </section>
      </section>
    </main>
  );
}
