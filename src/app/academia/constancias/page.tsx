import Link from 'next/link';
import type { Metadata } from 'next';
import { Heading } from '@astryxdesign/core/Heading';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@/components/ui/Icon';
import { formatDate } from '@/lib/crm/format';
import { academiaPersonId } from '@/lib/valux/session';
import { certificatesPath, listCertificates } from '@/lib/valux/certificates';

export const metadata: Metadata = { title: 'Mis constancias · Academia Cluster', robots: { index: false, follow: false } };

export default async function CertificatesPage() {
  const personId = await academiaPersonId();
  const certificates = await listCertificates(personId);
  return (
    <main className="academy-page max-w-4xl space-y-6">
      <header className="space-y-3">
        <Link href="/academia/mis-cursos" className="academy-nav academy-focus">← Mis cursos</Link>
        <Heading level={1} className="academy-title">Mis constancias</Heading>
      </header>
      {certificates.length ? (
        <ul className="academy-panel divide-y divide-academy-line overflow-hidden">
          {certificates.map((certificate) => <li key={certificate.id}>
            <Link href={`${certificatesPath}/${certificate.id}`} className="academy-focus flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-academy-tint focus-visible:outline-inset">
              <section className="min-w-0 space-y-1">
                <p className="break-words font-semibold">{certificate.course_title}</p>
                <p className="text-sm text-ink/70">Completado el {formatDate(certificate.completed_at)} · {certificate.lesson_count} {certificate.lesson_count === 1 ? 'clase' : 'clases'}</p>
              </section>
              <small className="flex items-center gap-2 text-sm font-semibold text-academy-primary">Ver constancia <Icon name="arrow-right" size={16} /></small>
            </Link>
          </li>)}
        </ul>
      ) : (
        <section className="academy-panel space-y-4 p-5 sm:p-8">
          <Heading level={2} className="font-brand text-xl font-semibold normal-case">{personId ? 'Todavía no tienes constancias emitidas' : 'Entra para ver tus constancias'}</Heading>
          <p className="text-sm text-ink/70">{personId ? 'Cuando termines un curso, abre su ficha y selecciona Obtener constancia.' : 'Usa el mismo correo con el que estudias en Academia.'}</p>
          <Button as={Link} href={personId ? '/academia/mis-cursos?estado=completados' : '/academia/entrar'} label={personId ? 'Ver cursos completados' : 'Entra en tu cuenta'} variant="primary" />
        </section>
      )}
    </main>
  );
}
