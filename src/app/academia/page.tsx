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
  const q = typeof query.q === 'string' ? query.q.trim() : '';
  const all = await publishedCourses();
  const featured = selectFeatured(all, await featuredCourseIds());
  const type = query.tipo === 'gratis' || query.tipo === 'pago' ? query.tipo : '';
  const featuredIds = new Set(featured.map((course) => course.id));
  const ordered = [...featured, ...all.filter((course) => !featuredIds.has(course.id))];
  const courses = ordered.filter((course) => (!type || (type === 'gratis' ? course.price_cents === 0 : course.price_cents > 0)) && [course.title, course.teacher_name, course.description].join(' ').toLocaleLowerCase('es').includes(q.toLocaleLowerCase('es')));
  const filterHref = (value: string) => `/academia?${new URLSearchParams({ ...(q ? { q } : {}), ...(value ? { tipo: value } : {}) })}#catalogo`;

  return (
    <AcademySurface>
      <VStack gap={8} className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
        <Heading level={1} className="font-display text-5xl leading-none tracking-tight md:text-7xl">Cursos</Heading>
        {query.error ? <Text as="p" role="alert" className="border border-black/10 bg-white p-4">{payNote(query.error)}</Text> : null}
        <VStack as="section" id="catalogo" gap={5} className="scroll-mt-24" aria-label="Catálogo de cursos">
          <HStack gap={4} wrap="wrap" justify="between" align="center">
            <form action="/academia#catalogo" role="search" className="flex w-full max-w-md">
              {type ? <input type="hidden" name="tipo" value={type} /> : null}
              <label htmlFor="course-search" className="sr-only">Buscar cursos</label>
              <input id="course-search" type="search" name="q" defaultValue={q} placeholder="Busca por curso o tema…" className="min-w-0 flex-1 border border-black/25 bg-white px-4 py-3 text-base text-ink outline-none focus:border-ink focus:ring-1 focus:ring-ink" />
              <button className="bg-ink px-5 text-sm font-medium text-white hover:bg-ink-800" type="submit">Buscar</button>
            </form>
            <nav aria-label="Filtrar cursos" className="flex flex-wrap gap-2">
              {[['', 'Todos'], ['gratis', 'Gratis'], ['pago', 'De pago']].map(([value, label]) => <Link key={label} href={filterHref(value)} aria-current={type === value ? 'page' : undefined} className={`inline-flex min-h-11 items-center border px-4 text-sm transition-colors ${type === value ? 'border-ink bg-ink text-white' : 'border-black/20 bg-white hover:border-ink'}`}>{label}</Link>)}
            </nav>
          </HStack>
          <Text as="p" className="text-sm text-black/65">{courses.length} {courses.length === 1 ? 'curso disponible' : 'cursos disponibles'}</Text>
          {courses.length ? <Grid columns={{ minWidth: 260, max: 3 }} gap={5}>{courses.map((course) => <CourseTile key={course.id} course={course} headingLevel={2} />)}</Grid> : (
            <VStack gap={3} padding={8} className="border border-dashed border-black/20 bg-white">
              <Heading level={2}>{q || type ? 'No encontramos cursos con esos filtros' : 'Estamos preparando los próximos cursos'}</Heading>
              <Text as="p" color="secondary">{q || type ? 'Prueba otro nombre o vuelve al catálogo completo.' : 'Los cursos publicados aparecerán aquí.'}</Text>
              {q || type ? <Link href="/academia#catalogo" className="w-fit text-sm font-medium underline underline-offset-4">Limpiar filtros</Link> : null}
            </VStack>
          )}
        </VStack>
        <section className="border border-black/15 bg-brand/10 p-6 md:p-10">
          <HStack gap={6} justify="between" align="center" wrap="wrap">
            <Heading level={2} className="font-display text-4xl tracking-wide">Marketplace</Heading>
            <Link href="/academia/marketplace" className="inline-flex min-h-12 items-center border border-ink bg-white px-6 text-sm font-medium transition-colors hover:bg-ink hover:text-white">Explorar Marketplace →</Link>
          </HStack>
        </section>
      </VStack>
    </AcademySurface>
  );
}
