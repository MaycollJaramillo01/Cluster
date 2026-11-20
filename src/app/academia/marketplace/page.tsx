import Link from 'next/link';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { AcademySurface } from '@/components/academia/AcademySurface';
import { CourseTile } from '@/components/academia/CourseTile';
import { Cover } from '@/components/academia/ui';
import { academyMoney as money } from '@/lib/valux/money';
import { listProducts, publishedCourses } from '@/lib/valux/data';
import { featuredCourseIds, selectFeatured } from '@/lib/valux/catalog';

export default async function MarketplacePage() {
  const [products,courses,ids] = await Promise.all([listProducts('publicado'),publishedCourses(),featuredCourseIds()]);
  const featured = selectFeatured(courses, ids);
  const remaining = courses.filter((course) => !featured.some((item) => item.id === course.id));
  return (
    <AcademySurface className="mx-auto w-full max-w-6xl gap-10 px-4 py-10 md:py-16">
      <VStack gap={5} className="border-b border-black/15 pb-8">
        <Link href="/academia" className="w-fit text-sm text-black/60 hover:text-ink">← Cursos</Link>
        <Heading level={1} className="font-display text-6xl leading-none tracking-tight md:text-7xl">Marketplace</Heading>
      </VStack>
      {featured.length ? <VStack as="section" gap={5} aria-labelledby="marketplace-featured"><HStack justify="between" wrap="wrap"><Heading id="marketplace-featured" level={2} className="font-display text-4xl">Cursos destacados</Heading><Link href="/academia#catalogo" className="text-sm underline underline-offset-4">Ver todos los cursos →</Link></HStack><Grid columns={{minWidth:240,max:Math.min(4,featured.length)}} gap={5}>{featured.map((course,index)=><CourseTile key={course.id} course={course} index={index} featured wide={featured.length===1}/>)}</Grid></VStack> : null}
      {remaining.length ? <VStack as="section" gap={5}><Heading level={2} className="font-display text-4xl">Cursos</Heading><Grid columns={{minWidth:260,max:3}} gap={5}>{remaining.map((course,index)=><CourseTile key={course.id} course={course} index={index}/>)}</Grid></VStack> : null}
      <VStack as="section" gap={5} aria-labelledby="products-title">
        <Heading id="products-title" level={2} className="font-display text-4xl">Productos digitales</Heading>
        {products.length ? <Grid columns={{ minWidth:260,max:3 }} gap={5}>{products.map((product)=>(
          <Link key={product.id} href={`/academia/marketplace/${product.id}`} className="group flex min-w-0 flex-col border border-black/10 bg-white hover:border-ink">
            <Cover url={product.cover_url} title={product.title}/><VStack gap={3} padding={5}><Text type="supporting">{product.creator_name || 'Academia Cluster'}</Text><Heading level={3} className="font-brand text-lg font-semibold">{product.title}</Heading><Text type="label">{product.price_cents>0?money(product.price_cents):'Gratis'}</Text></VStack>
          </Link>
        ))}</Grid> : <Text as="p" type="supporting">Sin productos disponibles.</Text>}
      </VStack>
    </AcademySurface>
  );
}
