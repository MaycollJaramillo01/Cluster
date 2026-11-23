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

export function CourseTile({ course, wide = false, headingLevel = 3 }: { course: Course; wide?: boolean; headingLevel?: 2 | 3 }) {
  return (
    <Link href={`/academia/${course.slug}`} className="academy-focus group block min-w-0 rounded-academy-lg">
      <Card padding={0} className={`h-full overflow-hidden border-academy-line transition-shadow motion-safe:group-hover:shadow-md ${wide ? 'grid md:grid-cols-2' : 'flex flex-col'}`}>
        <Cover url={course.cover_url} title={course.title} slug={course.slug} />
        <VStack gap={3} className="flex-1 p-5 sm:p-6">
          <Text as="p" className="text-xs font-semibold text-academy-muted">{course.teacher_name || 'Academia Cluster'}</Text>
          <Heading level={headingLevel} className="text-balance break-words text-xl font-bold leading-snug group-hover:text-academy-primary">{course.title}</Heading>
          <Text as="p" type="supporting" maxLines={2} className="text-academy-muted">{course.description}</Text>
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
