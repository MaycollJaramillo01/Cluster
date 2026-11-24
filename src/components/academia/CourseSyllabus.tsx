import Link from 'next/link';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { Icon } from '@/components/ui/Icon';
import { lessonOrder, type publishedCourse } from '@/lib/valux/data';
import { LessonMark, durationLabel } from './ui';

type Course = NonNullable<Awaited<ReturnType<typeof publishedCourse>>>;

export function CourseSyllabus({ course, open, done, sample, next }: {
  course: Course;
  open: ReadonlySet<string>;
  done?: ReadonlySet<string>;
  sample?: string;
  next?: string;
}) {
  const lessons = lessonOrder(course.sections, course.lessons);
  const positions = new Map(lessons.map((lesson, index) => [lesson.id, index + 1]));
  const sections = new Set(course.sections.map(({ id }) => id));
  const loose = lessons.filter(({ section_id }) => !sections.has(section_id));
  const groups = course.sections.map((section) => ({
    ...section,
    lessons: lessons.filter(({ section_id }) => section_id === section.id),
  })).filter((group) => group.lessons.length > 0);
  const moduleCount = groups.length;
  if (loose.length) groups.push({ id: '', title: moduleCount ? 'Otras clases' : 'Clases', lessons: loose });

  return (
    <VStack as="section" id="temario" gap={4} className="scroll-mt-24" aria-labelledby="syllabus-title">
      <HStack align="end" justify="between" wrap="wrap" gap={2}>
        <Heading level={2} id="syllabus-title" className="academy-section-title">Contenido del curso</Heading>
        <Text as="p" className="text-sm text-academy-muted">
          {moduleCount ? `${moduleCount} ${moduleCount === 1 ? 'módulo' : 'módulos'} · ` : ''}
          {lessons.length} {lessons.length === 1 ? 'clase' : 'clases'}
        </Text>
      </HStack>
      {!groups.length ? <p className="academy-notice">Este curso todavía no tiene clases.</p> : (
        <VStack gap={0} className="divide-y divide-academy-line border-y border-academy-line">
          {groups.map((group, index) => {
            const minutes = group.lessons.reduce((sum, lesson) => sum + (lesson.duration_min || 0), 0);
            return (
              <details key={group.id} open={lessons.length <= 12 || index === 0 || group.lessons.some(({ id }) => id === next || id === sample) || undefined} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 py-3 font-semibold focus-visible:-outline-offset-2 [&::-webkit-details-marker]:hidden">
                  <Text className="min-w-0 flex-1 break-words text-base font-bold">{group.title}</Text>
                  {minutes ? <Text className="shrink-0 text-xs font-medium text-academy-muted">{durationLabel(minutes)}</Text> : null}
                  <Icon name="chevron-down" size={16} className="shrink-0 text-academy-primary transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <ol start={positions.get(group.lessons[0].id)} role="list" className="relative mb-3 list-none before:absolute before:bottom-7 before:left-4 before:top-7 before:w-px before:bg-academy-line">
                  {group.lessons.map((lesson) => {
                    const locked = !open.has(lesson.id);
                    const complete = done?.has(lesson.id) ?? false;
                    const preview = lesson.id === sample;
                    const row = 'relative flex min-h-14 items-center gap-3 rounded-academy py-2 pr-2 sm:pr-3';
                    const contents = (
                      <>
                        <Text aria-hidden="true" className={`flex size-8 shrink-0 items-center justify-center rounded-academy border text-xs font-bold tabular-nums ${preview || complete ? 'border-academy-tint bg-academy-tint text-academy-primary' : 'border-academy-line bg-academy-surface text-academy-muted'}`}>
                          {positions.get(lesson.id)}
                        </Text>
                        <VStack gap={0} className="min-w-0 flex-1">
                          <Text className="break-words text-sm font-semibold">{lesson.title}</Text>
                          {preview || lesson.has_video || lesson.has_activity || lesson.duration_min ? (
                            <Text className="text-xs text-academy-muted">
                              {preview ? <strong className="text-academy-primary">Muestra</strong> : lesson.has_video ? 'Video' : lesson.has_activity ? 'Actividad' : null}
                              {lesson.duration_min ? `${preview || lesson.has_video || lesson.has_activity ? ' · ' : ''}${lesson.duration_min} min` : null}
                            </Text>
                          ) : null}
                        </VStack>
                        {locked || complete ? <LessonMark done={complete} locked={locked} /> : (
                          <Icon name={lesson.has_video ? 'play' : 'arrow-right'} size={17} aria-hidden="true" className="shrink-0 text-academy-primary" />
                        )}
                      </>
                    );
                    return (
                      <li key={lesson.id}>
                        {locked ? <HStack gap={3} align="center" className={row}>{contents}</HStack> : (
                          <Link href={`/academia/${course.slug}/${lesson.slug}`} prefetch={false} className={`${row} academy-focus hover:bg-academy-page`}>{contents}</Link>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </details>
            );
          })}
        </VStack>
      )}
    </VStack>
  );
}
