import Link from 'next/link';
import type { ReactNode } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { reviewPost, reviewProduct, setApplicationStatus } from '@/lib/valux/actions';
import { listApplications, listPosts, listProducts } from '@/lib/valux/data';
import { Empty, PageTitle, ReviewButtons, SectionTitle, btnSmall, rowClass } from '@/components/dashboard/StaffUi';
import { Icon } from '@/components/ui/Icon';
import { listCourseReviewRequests } from '@/lib/crm/lms';
import { formatDateTime } from '@/lib/crm/format';

function Queue({ id, title, count, empty, children }: { id: string; title: string; count: number; empty: string; children: ReactNode }) {
  return (
    <VStack as="section" gap={4} aria-labelledby={id}>
      <SectionTitle id={id} title={`${title} (${count})`} />
      {count ? <ul className="academy-panel divide-y divide-academy-line overflow-hidden">{children}</ul> : <Empty title={empty} />}
    </VStack>
  );
}

export default async function RevisionesPage() {
  const [courses, products, posts, applications] = await Promise.all([
    listCourseReviewRequests(),
    listProducts('pendiente'),
    listPosts('pendiente'),
    listApplications(),
  ]);
  const fichas = applications.filter((item) => String(item.status) === 'nueva' || String(item.status) === 'revision');

  return (
    <VStack gap={8} className="mx-auto w-full max-w-6xl">
      <PageTitle eyebrow="Contenido" title="Revisiones" description="Lo que espera una decisión: cursos enviados por profesores, recursos, notas del blog y fichas nuevas." />
      <Queue id="cursos-revision" title="Cursos" count={courses.length} empty="Los cursos enviados por profesores aparecerán aquí.">
        {courses.map((course) => (
          <li key={course.id} className={rowClass}>
            <VStack gap={1} className="min-w-0">
              <p className="break-words font-semibold">{course.title}</p>
              <p className="text-sm text-academy-muted">{course.teacher || 'Academia'} · {course.lessons} {course.lessons === 1 ? 'clase' : 'clases'} · enviado el {formatDateTime(course.requestedAt)}</p>
            </VStack>
            <Link href={`/dashboard/cursos/${course.id}?vista=revision`} className={btnSmall}>{course.revision ? 'Revisar actualización' : 'Revisar curso'}<small className="sr-only"> {course.title}</small><Icon name="arrow-right" size={15} /></Link>
          </li>
        ))}
      </Queue>
      <Queue id="productos-revision" title="Recursos del marketplace" count={products.length} empty="No hay recursos pendientes.">
        {products.map((product) => (
          <li key={product.id} className={rowClass}>
            <p className="min-w-0 break-words font-semibold">{product.title}</p>
            <ReviewButtons action={reviewProduct} id={product.id} status={product.review_status} title={product.title} />
          </li>
        ))}
      </Queue>
      <Queue id="blog-revision" title="Notas del blog" count={posts.length} empty="No hay notas pendientes.">
        {posts.map((post) => (
          <li key={post.id} className={rowClass}>
            <p className="min-w-0 break-words font-semibold">{post.title}</p>
            <ReviewButtons action={reviewPost} id={post.id} status={post.status} title={post.title} />
          </li>
        ))}
      </Queue>
      <Queue id="fichas-revision" title="Fichas" count={fichas.length} empty="No hay fichas nuevas.">
        {fichas.map((item) => (
          <li key={String(item.id)} className={rowClass}>
            <VStack gap={0} className="min-w-0">
              <p className="break-words font-semibold">{String(item.full_name)}</p>
              <p className="break-all text-sm text-academy-muted">{String(item.email)}</p>
            </VStack>
            {String(item.status) === 'nueva' ? (
              <form action={setApplicationStatus}>
                <input type="hidden" name="id" value={String(item.id)} />
                <input type="hidden" name="status" value="revision" />
                <button className={btnSmall} type="submit">Pasar a revisión<small className="sr-only"> la ficha de {String(item.full_name)}</small></button>
              </form>
            ) : (
              <Link href="/dashboard/cursos/fichas" className={btnSmall}>Abrir fichas</Link>
            )}
          </li>
        ))}
      </Queue>
    </VStack>
  );
}
