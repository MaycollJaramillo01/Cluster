import Link from 'next/link';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Cover, durationLabel} from './ui';
import {academyMoney as money} from '@/lib/valux/money';
import type {publishedCourses} from '@/lib/valux/data';

type Course = Awaited<ReturnType<typeof publishedCourses>>[number];

export function CourseTile({ course, wide = false, headingLevel = 3 }: { course: Course; wide?: boolean; headingLevel?: 2 | 3 }) {
  return (
    <Link href={`/academia/${course.slug}`} className={`group min-w-0 border border-black/10 bg-white transition-colors hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${wide ? 'grid md:grid-cols-2' : 'flex flex-col'}`}>
      <Cover url={course.cover_url} title={course.title} slug={course.slug} />
      <VStack gap={3} className="flex-1 p-5">
        <Heading level={headingLevel} className="text-balance break-words font-brand text-lg font-semibold normal-case leading-snug">{course.title}</Heading>
        <Text as="p" type="supporting" maxLines={2}>{course.description}</Text>
        <HStack justify="between" gap={2} wrap="wrap" className="mt-auto border-t border-black/10 pt-3">
          <Text className="text-sm text-black/65">{course.lessons} {course.lessons === 1 ? 'clase' : 'clases'}{course.minutes ? ` · ${durationLabel(course.minutes)}` : ''}</Text>
          <Text className="font-semibold tabular-nums text-ink">{course.price_cents > 0 ? money(course.price_cents) : 'Gratis'}</Text>
        </HStack>
      </VStack>
    </Link>
  );
}
