import Link from 'next/link';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
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
    <VStack as="main" gap={8} className="academy-page">
      <VStack as="header" gap={3} className="academy-hero rounded-academy-xl p-6 text-white sm:p-9">
        <Heading level={1} className="text-4xl font-bold text-white sm:text-5xl">Marketplace</Heading>
        <Text as="p" className="max-w-prose text-white/80">Cursos y recursos digitales para tus proyectos.</Text>
      </VStack>
      {featured.length ? <VStack as="section" gap={5} aria-labelledby="marketplace-featured"><HStack justify="between" wrap="wrap"><Heading id="marketplace-featured" level={2} className="academy-section-title">Cursos destacados</Heading><Link href="/academia?vista=catalogo#catalogo" className="academy-nav academy-focus">Ver todos los cursos →</Link></HStack><Grid columns={{minWidth:240,max:Math.min(4,featured.length)}} gap={5}>{featured.map(course=><CourseTile key={course.id} course={course} wide={featured.length===1}/>)}</Grid></VStack> : null}
      {remaining.length ? <VStack as="section" gap={5}><Heading level={2} className="academy-section-title">Cursos</Heading><Grid columns={{minWidth:260,max:3}} gap={5}>{remaining.map(course=><CourseTile key={course.id} course={course}/>)}</Grid></VStack> : null}
      <VStack as="section" gap={5} aria-labelledby="products-title">
        <Heading id="products-title" level={2} className="academy-section-title">Productos digitales</Heading>
        {products.length ? <Grid columns={{ minWidth:260,max:3 }} gap={5}>{products.map((product)=>(
          <Link key={product.id} href={`/academia/marketplace/${product.id}`} className="academy-focus group block min-w-0 rounded-academy-lg">
            <Card padding={0} className="h-full overflow-hidden motion-safe:group-hover:shadow-md">
              <Cover url={product.cover_url} title={product.title} />
              <VStack gap={3} padding={5}>
                <Text type="supporting">{product.creator_name || 'Academia Cluster'}</Text>
                <Heading level={3} className="break-words text-xl font-bold">{product.title}</Heading>
                <Text className="font-bold text-academy-primary">{product.price_cents > 0 ? money(product.price_cents) : 'Gratis'}</Text>
              </VStack>
            </Card>
          </Link>
        ))}</Grid> : <Text as="p" type="supporting" className="academy-notice">Sin productos disponibles.</Text>}
      </VStack>
    </VStack>
  );
}
