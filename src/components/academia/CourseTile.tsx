import Link from 'next/link';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {durationLabel} from './ui';
import {academyMoney as money} from '@/lib/valux/money';
import type {publishedCourses} from '@/lib/valux/data';

type Course = Awaited<ReturnType<typeof publishedCourses>>[number];

export function CourseTile({ course, index, featured = false, wide = false }: { course: Course; index: number; featured?: boolean; wide?: boolean }) {
  return (
    <Link href={`/academia/${course.slug}`} className={`group min-w-0 border border-black/10 bg-white transition-colors hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${wide ? 'grid md:grid-cols-2' : 'flex flex-col'}`}>
      {course.cover_url ? <img src={course.cover_url} alt="" className="aspect-video w-full object-cover" /> : (
        <VStack gap={4} justify="between" className={`aspect-video overflow-hidden p-5 ${featured ? 'bg-brand/15' : 'bg-paper-soft'}`}>
          <HStack justify="between"><Text type="label" className="text-xs uppercase tracking-widest">Cluster / Academia</Text><Text type="code">{String(index + 1).padStart(2, '0')}</Text></HStack>
          <Text type="large" weight="bold" className="max-w-xs leading-tight">{course.title}</Text>
        </VStack>
      )}
      <VStack gap={3} className="flex-1 p-5">
        <Text type="supporting">{course.teacher_name || 'Academia Cluster'}</Text>
        <Heading level={3} className="font-brand text-lg font-semibold leading-snug">{course.title}</Heading>
        <Text as="p" type="supporting" maxLines={2}>{course.description}</Text>
        <Text type="supporting">{course.lessons} {course.lessons === 1 ? 'clase' : 'clases'}{course.minutes ? ` · ${durationLabel(course.minutes)}` : ''}</Text>
        <HStack justify="between" className="mt-auto border-t border-black/10 pt-4">
          <Text type="label">{course.price_cents > 0 ? money(course.price_cents) : 'Gratis'}</Text>
          <Text type="label" className="transition-transform group-hover:translate-x-1">Ver curso →</Text>
        </HStack>
      </VStack>
    </Link>
  );
}
