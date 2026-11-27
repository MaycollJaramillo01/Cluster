import Link from 'next/link';
import type { Metadata } from 'next';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { AccountNav } from '@/components/academia/AccountNav';
import { Icon } from '@/components/ui/Icon';
import { formatDate } from '@/lib/crm/format';
import { academiaPersonId } from '@/lib/valux/session';
import { certificatesPath, listCertificates } from '@/lib/valux/certificates';

export const metadata: Metadata = { title: 'Mis constancias · Academia Cluster', robots: { index: false, follow: false } };

export default async function CertificatesPage() {
  const personId = await academiaPersonId();
  if (!personId) {
    return (
      <main className="academy-page max-w-xl">
        <VStack as="section" gap={4} className="academy-panel items-start p-6 sm:p-8">
          <Heading level={1} className="text-2xl font-bold">Entra para ver tus constancias</Heading>
          <p className="text-academy-muted">Usa el mismo correo con el que estudias en la Academia.</p>
          <Link href="/academia/entrar" className="academy-action academy-action-primary">Entrar <Icon name="arrow-right" size={16} /></Link>
        </VStack>
      </main>
    );
  }
  const certificates = await listCertificates(personId);

  return (
    <main className="academy-page grid max-w-6xl items-start gap-6 lg:grid-cols-[theme(spacing.60)_1fr]">
      <VStack gap={4} className="min-w-0 lg:sticky lg:top-24">
        <AccountNav current="/academia/constancias" />
      </VStack>
      <VStack gap={6} className="min-w-0">
        <VStack as="header" gap={2}>
          <Heading level={1} className="academy-title">Mis constancias</Heading>
          <p className="text-academy-muted">Imprime tus constancias o comparte un enlace para que otros las verifiquen.</p>
        </VStack>
        {certificates.length ? (
          <ul aria-label="Constancias emitidas" className="academy-panel divide-y divide-academy-line overflow-hidden">
            {certificates.map((certificate) => (
              <li key={certificate.id} className="grid gap-4 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
                <strong aria-hidden="true" className="hidden size-12 place-items-center rounded-academy bg-academy-tint text-academy-primary sm:grid"><Icon name="star" size={22} /></strong>
                <VStack gap={1} className="min-w-0">
                  <Heading level={2} className="break-words text-lg font-bold">{certificate.course_title}</Heading>
                  <p className="text-sm text-academy-muted">Completado el {formatDate(certificate.completed_at)} · {certificate.lesson_count} {certificate.lesson_count === 1 ? 'clase' : 'clases'}</p>
                  <small className={`mt-1 flex w-fit items-center gap-2 text-xs font-semibold ${certificate.shared ? 'text-academy-primary' : 'text-academy-muted'}`}>
                    <Icon name={certificate.shared ? 'globe' : 'lock'} size={14} />{certificate.shared ? 'Enlace de verificación activo' : 'Privada'}
                  </small>
                </VStack>
                <Link href={`${certificatesPath}/${certificate.id}`} className="academy-action academy-action-primary">Ver constancia<em className="sr-only not-italic"> de {certificate.course_title}</em> <Icon name="arrow-right" size={16} /></Link>
              </li>
            ))}
          </ul>
        ) : (
          <VStack as="section" gap={4} className="academy-panel items-start p-6 sm:p-8">
            <Heading level={2} className="text-xl font-bold">Todavía no tienes constancias emitidas</Heading>
            <p className="text-academy-muted">Cuando termines un curso, pide tu constancia desde Mis cursos.</p>
            <Link href="/academia/mis-cursos?estado=completados" className="academy-action academy-action-secondary">Ver cursos completados</Link>
          </VStack>
        )}
      </VStack>
    </main>
  );
}
