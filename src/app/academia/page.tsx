import Link from 'next/link';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { AcademySurface } from '@/components/academia/AcademySurface';
import { payNote } from '@/components/academia/ui';
import { CourseTile } from '@/components/academia/CourseTile';
import { publishedCourses } from '@/lib/valux/data';
import { featuredCourseIds, selectFeatured } from '@/lib/valux/catalog';

export default async function AcademiaHome({ searchParams }: { searchParams: Promise<{ error?: string; q?: string; tipo?: string }> }) {
  const query = await searchParams;
  const q = (query.q || '').trim();
  const all = await publishedCourses();
  const featured = selectFeatured(all, await featuredCourseIds());
  const type = query.tipo === 'gratis' || query.tipo === 'pago' ? query.tipo : '';
  const courses = all.filter((course) => (!type || (type === 'gratis' ? course.price_cents === 0 : course.price_cents > 0)) && [course.title, course.teacher_name, course.description].join(' ').toLocaleLowerCase('es').includes(q.toLocaleLowerCase('es')));
  const filterHref = (value: string) => `/academia?${new URLSearchParams({ ...(q ? { q } : {}), ...(value ? { tipo: value } : {}) })}#catalogo`;

  return (
    <AcademySurface>
      <section className="border-b border-black/10 bg-white">
        <VStack gap={6} className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
          <Text type="label" className="text-xs uppercase tracking-widest text-black/50">Academia Cluster</Text>
          <Heading level={1} className="max-w-3xl font-display text-6xl leading-none tracking-tight md:text-8xl">Cursos</Heading>
          <HStack gap={6} wrap="wrap" justify="between" align="end">
            <Link href="/academia/entrar" className="inline-flex min-h-12 items-center bg-ink px-6 text-sm font-medium text-white transition-colors hover:bg-ink-800">Entrar a mi aula →</Link>
          </HStack>
        </VStack>
      </section>
      <VStack gap={10} className="mx-auto w-full max-w-6xl px-4 py-10 md:py-12">
        {query.error ? <Text as="p" role="alert" className="border border-black/10 bg-white p-4">{payNote(query.error)}</Text> : null}
        {!q && !type && featured.length > 0 ? (
          <VStack as="section" gap={5} aria-labelledby="featured-title">
            <HStack justify="between" align="end" gap={4} wrap="wrap">
              <VStack gap={1}><Text type="label" className="text-xs uppercase tracking-widest text-black/50">Destacados</Text><Heading id="featured-title" level={2} className="font-display text-4xl tracking-wide">Cursos destacados</Heading></VStack>
              <Link href="#catalogo" className="text-sm font-medium underline underline-offset-4">Ver todo el catálogo ↓</Link>
            </HStack>
            <Grid columns={{ minWidth: 240, max: Math.min(4, featured.length) }} gap={5}>
              {featured.map((course, index) => <CourseTile key={course.id} course={course} index={index} featured wide={featured.length === 1} />)}
            </Grid>
          </VStack>
        ) : null}
        <VStack as="section" id="catalogo" gap={5} className="scroll-mt-24" aria-labelledby="catalog-title">
          <HStack gap={5} wrap="wrap" justify="between" align="end">
            <VStack gap={1}><Heading level={2} id="catalog-title" className="font-display text-4xl tracking-wide">Todos los cursos</Heading><Text type="supporting">{courses.length} {courses.length === 1 ? 'curso disponible' : 'cursos disponibles'}</Text></VStack>
            <form action="/academia#catalogo" className="flex w-full max-w-md">
              {type ? <input type="hidden" name="tipo" value={type} /> : null}
              <label htmlFor="course-search" className="sr-only">Buscar cursos</label>
              <input id="course-search" type="search" name="q" defaultValue={q} placeholder="¿Qué quieres aprender?" className="min-w-0 flex-1 border border-black/20 bg-white px-4 py-3 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink" />
              <button className="bg-ink px-5 text-sm font-medium text-white hover:bg-ink-800" type="submit">Buscar</button>
            </form>
          </HStack>
          <nav aria-label="Filtrar cursos" className="flex flex-wrap gap-2">
            {[['', 'Todos'], ['gratis', 'Gratis'], ['pago', 'De pago']].map(([value, label]) => <Link key={label} href={filterHref(value)} aria-current={type === value ? 'page' : undefined} className={`border px-4 py-2 text-sm transition-colors ${type === value ? 'border-ink bg-ink text-white' : 'border-black/15 bg-white hover:border-ink'}`}>{label}</Link>)}
          </nav>
          {courses.length ? <Grid columns={{ minWidth: 260, max: 3 }} gap={5}>{courses.map((course, index) => <CourseTile key={course.id} course={course} index={index} />)}</Grid> : (
            <VStack gap={3} padding={8} className="border border-dashed border-black/20 bg-white">
              <Heading level={3}>{q || type ? 'No encontramos cursos con esos filtros' : 'Estamos preparando los próximos cursos'}</Heading>
              <Text as="p" color="secondary">{q || type ? 'Prueba otro nombre o vuelve al catálogo completo.' : 'Los cursos publicados aparecerán aquí.'}</Text>
              {q || type ? <Link href="/academia#catalogo" className="w-fit text-sm font-medium underline underline-offset-4">Limpiar filtros</Link> : null}
            </VStack>
          )}
        </VStack>
        <section className="border border-black/15 bg-brand/10 p-6 md:p-10">
          <HStack gap={6} justify="between" align="center" wrap="wrap">
            <VStack gap={3} className="max-w-xl"><Text type="label" className="text-xs uppercase tracking-widest">Marketplace</Text><Heading level={2} className="font-display text-4xl tracking-wide">Marketplace</Heading></VStack>
            <Link href="/academia/marketplace" className="inline-flex min-h-12 items-center border border-ink bg-white px-6 text-sm font-medium transition-colors hover:bg-ink hover:text-white">Explorar Marketplace →</Link>
          </HStack>
        </section>
      </VStack>
    </AcademySurface>
  );
}
