import Link from 'next/link';
import type { Metadata } from 'next';
import { Heading } from '@astryxdesign/core/Heading';
import { formatDate } from '@/lib/crm/format';
import { academiaPersonId } from '@/lib/valux/session';
import { certificatesPath, listCertificates } from '@/lib/valux/certificates';

export const metadata: Metadata = { title: 'Mis constancias · Academia Cluster', robots: { index: false, follow: false } };

export default async function CertificatesPage() {
  const personId = await academiaPersonId();
  const certificates = await listCertificates(personId);
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="space-y-3 border-b border-black/15 pb-5">
        <Link href="/academia/mis-cursos" className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">← Mis cursos</Link>
        <Heading level={1} className="font-display text-5xl tracking-wide">Mis constancias</Heading>
      </header>
      {certificates.length ? (
        <ul className="divide-y divide-black/10 border border-black/15 bg-white">
          {certificates.map((certificate) => <li key={certificate.id}>
            <Link href={`${certificatesPath}/${certificate.id}`} className="flex flex-wrap items-center justify-between gap-2 p-5 hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset">
              <section className="min-w-0 space-y-1">
                <p className="break-words font-semibold">{certificate.course_title}</p>
                <p className="text-sm text-ink/70">Completado el {formatDate(certificate.completed_at)} · {certificate.lesson_count} {certificate.lesson_count === 1 ? 'clase' : 'clases'}</p>
              </section>
              <span className="text-sm font-medium underline underline-offset-4">Ver constancia</span>
            </Link>
          </li>)}
        </ul>
      ) : (
        <section className="space-y-3 border border-black/15 bg-white p-5 sm:p-8">
          <Heading level={2} className="font-brand text-xl font-semibold normal-case">{personId ? 'Todavía no tienes constancias emitidas' : 'Entra para ver tus constancias'}</Heading>
          <p className="text-sm text-ink/70">{personId ? 'Cuando termines un curso, abre su ficha y selecciona Obtener constancia.' : 'Usa el mismo correo con el que estudias en Academia.'}</p>
          <Link href={personId ? '/academia/mis-cursos?estado=completados' : '/academia/entrar'} className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">{personId ? 'Ver cursos completados' : 'Entra en tu cuenta'}</Link>
        </section>
      )}
    </main>
  );
}
