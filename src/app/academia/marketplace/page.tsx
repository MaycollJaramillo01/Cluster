import Link from 'next/link';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { CourseTile } from '@/components/academia/CourseTile';
import { Cover } from '@/components/academia/ui';
import { Icon } from '@/components/ui/Icon';
import { academyMoney as money } from '@/lib/valux/money';
import { listProducts, publishedCourses } from '@/lib/valux/data';
import { featuredCourseIds, selectFeatured } from '@/lib/valux/catalog';

export default async function MarketplacePage() {
  const [products, courses, ids] = await Promise.all([listProducts('publicado'), publishedCourses(), featuredCourseIds()]);
  const featured = selectFeatured(courses, ids);
  // ponytail: el catálogo completo vive en /academia; aquí van hasta cuatro cursos, destacados primero.
  const shown = [...featured, ...courses.filter((course) => !featured.some((item) => item.id === course.id))].slice(0, 4);

  return (
    <main className="academy-page max-w-6xl space-y-12">
      <VStack as="header" gap={2}>
        <p className="text-sm font-semibold text-academy-primary">Marketplace</p>
        <Heading level={1} className="academy-title">Recursos y cursos</Heading>
        <p className="max-w-prose text-academy-muted">Cursos y recursos digitales para tus proyectos.</p>
      </VStack>

      <VStack as="section" gap={5} aria-labelledby="productos">
        <Heading id="productos" level={2} className="academy-section-title">Recursos digitales</Heading>
        {products.length ? (
          <ul className="academy-panel divide-y divide-academy-line overflow-hidden">
            {products.map((product) => (
              <li key={product.id} className="grid grid-cols-[theme(spacing.20)_1fr] items-start gap-4 p-4 sm:grid-cols-[theme(spacing.44)_1fr_auto] sm:items-center sm:gap-6 sm:p-5">
                <Link href={`/academia/marketplace/${product.id}`} aria-hidden="true" tabIndex={-1} className="block overflow-hidden rounded-academy">
                  {product.cover_url ? <Cover url={product.cover_url} title={product.title} /> : <strong className="grid aspect-video place-items-center bg-academy-tint text-academy-primary"><Icon name="upload" size={24} className="rotate-180" /></strong>}
                </Link>
                <VStack gap={1} className="min-w-0">
                  <p className="text-xs font-semibold text-academy-muted">{product.creator_name || 'Academia Cluster'}</p>
                  <Heading level={3} className="break-words text-lg font-bold">
                    <Link href={`/academia/marketplace/${product.id}`} className="academy-focus rounded-academy hover:underline hover:underline-offset-4">{product.title}</Link>
                  </Heading>
                  {product.description ? <p className="line-clamp-2 text-sm text-academy-muted">{product.description}</p> : null}
                </VStack>
                <HStack gap={4} align="center" justify="between" className="col-span-2 sm:col-span-1 sm:flex-col sm:items-end sm:gap-1">
                  <strong className="text-lg font-bold tabular-nums">{product.price_cents > 0 ? money(product.price_cents) : 'Gratis'}</strong>
                  <Link href={`/academia/marketplace/${product.id}`} aria-hidden="true" tabIndex={-1} className="flex items-center gap-1 text-sm font-semibold text-academy-primary">Ver recurso <Icon name="arrow-right" size={16} /></Link>
                </HStack>
              </li>
            ))}
          </ul>
        ) : (
          <p className="academy-panel p-6 text-academy-muted">Sin recursos disponibles por ahora.</p>
        )}
      </VStack>

      {shown.length ? (
        <VStack as="section" gap={5} aria-labelledby="cursos">
          <HStack justify="between" align="center" gap={3} wrap="wrap">
            <Heading id="cursos" level={2} className="academy-section-title">Cursos</Heading>
            <Link href="/academia?vista=catalogo#catalogo" className="academy-nav academy-focus">Ver todo el catálogo <Icon name="arrow-right" size={16} /></Link>
          </HStack>
          <Grid columns={{ minWidth: 240, max: 4 }} gap={5}>{shown.map((course) => <CourseTile key={course.id} course={course} />)}</Grid>
        </VStack>
      ) : null}
    </main>
  );
}
