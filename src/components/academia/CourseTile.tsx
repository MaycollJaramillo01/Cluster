import Link from 'next/link';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Icon} from '@/components/ui/Icon';
import {Cover, durationLabel} from './ui';
import {academyMoney as money} from '@/lib/valux/money';
import type {publishedCourses} from '@/lib/valux/data';

type Course = Awaited<ReturnType<typeof publishedCourses>>[number];

export function CourseTile({ course, wide = false, headingLevel = 3, rating, reason }: { course: Course; wide?: boolean; headingLevel?: 2 | 3; rating?: { average: number; count: number }; reason?: string }) {
  return (
    <Link href={`/academia/${course.slug}`} className="academy-focus group block h-full min-w-0 rounded-academy-lg">
      <Card padding={0} className={`h-full overflow-hidden border-academy-line transition-shadow motion-safe:group-hover:shadow-md ${wide ? 'grid md:grid-cols-2' : 'flex flex-col'}`}>
        <Cover url={course.cover_url} title={course.title} slug={course.slug} />
        <VStack gap={3} className="flex-1 p-5 sm:p-6">
          <Heading level={headingLevel} className="text-balance break-words text-xl font-bold leading-snug group-hover:text-academy-primary">{course.title}</Heading>
          <Text as="p" className="text-xs font-semibold text-academy-muted">{course.teacher_name || 'Academia Cluster'}</Text>
          <Text as="p" type="supporting" maxLines={2} className="text-academy-muted">{reason || course.description}</Text>
          {rating ? (
            <HStack gap={2} align="center" className="text-academy-primary">
              <Icon name="star" size={16} fill="currentColor" aria-hidden="true" />
              <Text className="text-sm font-semibold tabular-nums">{rating.average.toLocaleString('es', { minimumFractionDigits: 1 })} / 5</Text>
              <Text className="text-xs text-academy-muted">({rating.count} {rating.count === 1 ? 'reseña' : 'reseñas'})</Text>
            </HStack>
          ) : null}
          <HStack justify="between" align="center" gap={2} wrap="wrap" className="mt-auto border-t border-academy-line pt-4">
            <Text className="text-sm text-academy-muted">{course.lessons} {course.lessons === 1 ? 'clase' : 'clases'}{course.minutes ? ` · ${durationLabel(course.minutes)}` : ''}</Text>
            <HStack gap={2} align="center" className="text-academy-primary">
              <Text className="font-bold tabular-nums">{course.price_cents > 0 ? money(course.price_cents) : 'Gratis'}</Text>
              <Icon name="arrow-right" size={16} aria-hidden="true" />
            </HStack>
          </HStack>
        </VStack>
      </Card>
    </Link>
  );
}
