import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@astryxdesign/core/Button';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { AcademySurface } from '@/components/academia/AcademySurface';
import { payNote } from '@/components/academia/ui';
import { CourseTile } from '@/components/academia/CourseTile';
import { Icon } from '@/components/ui/Icon';
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
      <VStack as="main" gap={8} className="academy-page">
        {q || type ? <Heading level={1} className="academy-title">Cursos</Heading> : (
          <section aria-labelledby="academy-hero-title" className="academy-hero grid overflow-hidden rounded-academy-xl lg:grid-cols-2">
            <VStack gap={5} justify="center" className="p-6 sm:p-10 lg:p-12">
              <Heading id="academy-hero-title" level={1} className="max-w-xl text-balance text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">Aprende a hacer crecer tu negocio.</Heading>
              <Text as="p" className="max-w-md text-base leading-relaxed text-white/80 sm:text-lg">Cursos prácticos de marketing, ventas y tecnología para aplicar en tu negocio, a tu ritmo.</Text>
              <HStack gap={3} wrap="wrap" className="pt-2">
                <Link href="#catalogo" className="academy-action academy-action-inverse">Explorar cursos <Icon name="arrow-right" size={18} aria-hidden="true" /></Link>
                <Link href="/academia/mis-cursos" className="academy-action academy-action-on-dark">Mis cursos</Link>
              </HStack>
            </VStack>
            <figure className="relative min-h-48 sm:min-h-56">
              <Image src="/assets/stock/creative.jpg" alt="" fill priority sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
            </figure>
          </section>
        )}
        {query.error ? <Text as="p" role="alert" className="academy-notice">{payNote(query.error)}</Text> : null}
        <VStack as="section" id="catalogo" gap={5} className="scroll-mt-24" aria-label="Catálogo de cursos">
          <HStack justify="between" wrap="wrap" align="center" gap={3}>
            <Heading level={2} className="academy-section-title">Explora los cursos</Heading>
            <Text as="p" className="text-sm text-academy-muted">{courses.length} {courses.length === 1 ? 'curso disponible' : 'cursos disponibles'}</Text>
          </HStack>
          <HStack gap={4} wrap="wrap" justify="between" align="center">
            <form action="/academia#catalogo" role="search" className="flex w-full max-w-lg items-center gap-2">
              {type ? <input type="hidden" name="tipo" value={type} /> : null}
              <label htmlFor="course-search" className="sr-only">Buscar cursos</label>
              <input id="course-search" type="search" name="q" defaultValue={q} placeholder="Busca por curso o tema" className="academy-field min-w-0 flex-1" />
              <Button type="submit" variant="primary" size="lg" label="Buscar" icon={<Icon name="search" size={17} aria-hidden="true" />} />
            </form>
            <nav aria-label="Filtrar cursos" className="flex flex-wrap gap-2">
              {[['', 'Todos'], ['gratis', 'Gratis'], ['pago', 'De pago']].map(([value, label]) => <Link key={label} href={filterHref(value)} aria-current={type === value ? 'page' : undefined} className="academy-filter academy-focus">{label}</Link>)}
            </nav>
          </HStack>
          {courses.length ? <Grid columns={{ minWidth: 260, max: 3 }} gap={5}>{courses.map((course) => <CourseTile key={course.id} course={course} />)}</Grid> : (
            <VStack gap={3} padding={8} className="academy-panel">
              <Heading level={3}>{q || type ? 'No encontramos cursos con esos filtros' : 'Estamos preparando los próximos cursos'}</Heading>
              <Text as="p" color="secondary">{q || type ? 'Prueba otro nombre o vuelve al catálogo completo.' : 'Los cursos publicados aparecerán aquí.'}</Text>
              {q || type ? <Link href="/academia#catalogo" className="w-fit text-sm font-medium underline underline-offset-4">Limpiar filtros</Link> : null}
            </VStack>
          )}
        </VStack>
        <section className="academy-panel bg-academy-tint p-6 md:p-8">
          <HStack gap={6} justify="between" align="center" wrap="wrap">
            <VStack gap={2}>
              <Heading level={2} className="academy-section-title">Marketplace</Heading>
              <Text as="p" color="secondary">Encuentra recursos para aplicar lo que aprendiste.</Text>
            </VStack>
            <Link href="/academia/marketplace" className="academy-action academy-action-secondary">Explorar Marketplace <Icon name="arrow-right" size={17} aria-hidden="true" /></Link>
          </HStack>
        </section>
      </VStack>
    </AcademySurface>
  );
}
