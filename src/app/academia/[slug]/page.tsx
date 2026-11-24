import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Cover, PayMethod, durationLabel, payHint, payNote, payReady } from '@/components/academia/ui';
import { CourseCheckoutForm } from '@/components/academia/CourseCheckoutForm';
import { CertificateRequest } from '@/components/academia/CertificateRequest';
import { academyMoney as money } from '@/lib/valux/money';
import { buyCourse, buyUpsell } from '@/lib/valux/actions';
import { canReadCourse, getPerson, lessonAccess, lessonOrder, ownsCourse, publishedCourse } from '@/lib/valux/data';
import { academiaPersonId } from '@/lib/valux/session';
import { paymentOptions } from '@/lib/valux/transfers';
import { advanceStage } from '@/lib/valux/events';
import { Icon } from '@/components/ui/Icon';
import { CourseTile } from '@/components/academia/CourseTile';
import { CourseSyllabus } from '@/components/academia/CourseSyllabus';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Button } from '@astryxdesign/core/Button';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { getCourseReviews } from '@/lib/valux/course-community';
import { saveCourseReview } from '@/lib/valux/community-actions';
import { catalogCourseRatings, catalogTopicsFor, relatedCatalogCourses } from '@/lib/valux/catalog';

const catalogPath = '/academia?vista=catalogo#catalogo';
const metaAdsOutcomes = [
  'Prepara tu cuenta de Meta Ads antes de invertir.',
  'Define el objetivo, el público y el presupuesto de tu primera campaña.',
  'Crea anuncios y decide qué ajustar según el costo por consulta.',
];

export default async function CourseCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ok?: string; error?: string; terminado?: string; inscripcion?: string; constancia?: string; resena?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const course = await publishedCourse(slug);
  if (!course) notFound();
  const pay = await paymentOptions();
  const personId = await academiaPersonId();
  // Registrado que mira la ficha de un curso: pasa de nuevo a interesado (nunca retrocede).
  if (personId) await advanceStage({ personId }, 'interesado');
  // La oferta postcompra solo aparece a quien ya tiene este curso y aún no tiene el ofrecido.
  const upsell = query.ok && course.upsell && (await ownsCourse(personId, course.id)) && !(await ownsCourse(personId, course.upsell.id))
    ? course.upsell
    : null;
  const minutes = course.lessons.reduce((sum, lesson) => sum + (lesson.duration_min || 0), 0);
  const lessonCount = course.lessons.length;
  // Inscrito, o con acceso a un curso de pago por membresía o rol: ve su avance en vez del checkout.
  const enrolled = await ownsCourse(personId, course.id);
  const hasAccess = Boolean(personId) && (course.price_cents <= 0 ? enrolled : await canReadCourse(personId, course));
  const coursePath = `/academia/${course.slug}`;
  const checkoutPath = `${coursePath}?inscripcion=1`;
  const paid = course.price_cents > 0;
  const priceLabel = paid ? money(course.price_cents) : 'Gratis';
  const bump = payReady(pay) ? course.bump : null;
  const registration = `/academia/entrar?modo=registro&curso=${encodeURIComponent(course.slug)}`;
  const person = !hasAccess ? await getPerson(personId) : null;
  const suspended = person?.is_active === false;
  const contact = person?.is_active ? { name: person.name || person.email, email: person.email } : undefined;

  if (!hasAccess && !suspended && (query.inscripcion === '1' || (paid && query.error && query.error !== 'reembolso'))) {
    return (
      <main className="academy-page max-w-5xl">
        <Link href={coursePath} className="academy-nav academy-focus w-fit"><Icon name="arrow-right" size={16} className="rotate-180" /> Volver al curso</Link>
        <Heading level={1} className="academy-title mb-6 mt-3">Inscripción</Heading>
        <section className="grid items-start gap-5 md:grid-cols-3 md:gap-7">
          <aside aria-label="Resumen del curso" className="academy-panel overflow-hidden md:order-2">
            <section aria-hidden="true" className="hidden md:block"><Cover url={course.cover_url} title={course.title} slug={course.slug} eager /></section>
            <section className="p-5">
              <VStack gap={2}>
              <Heading level={2} className="text-balance text-xl font-bold">{course.title}</Heading>
              <p className="text-sm text-academy-muted">{lessonCount} {lessonCount === 1 ? 'clase' : 'clases'}{minutes ? ` · ${durationLabel(minutes)}` : ''}</p>
              <p className="border-t border-academy-line pt-3 text-3xl font-bold tabular-nums">{priceLabel}</p>
              </VStack>
            </section>
          </aside>
          <section aria-label="Datos de inscripción" className="academy-panel space-y-5 p-5 sm:p-8 md:order-1 md:col-span-2">
            <Heading level={2} className="academy-section-title">Datos de inscripción</Heading>
            {query.error && (payReady(pay) || query.error !== 'pasarela') ? <p role="alert" className="academy-notice">{payNote(query.error)}</p> : null}
            {paid && !payReady(pay) ? (
              <p>{payNote('pasarela')}</p>
            ) : !paid && !contact ? (
              <Button as={Link} href={registration} label="Crear cuenta para inscribirme" size="lg" width="100%" />
            ) : (
              <>
                <CourseCheckoutForm
                  hidden={{ slug: course.slug }}
                  label={paid ? 'Continuar al pago' : 'Confirmar inscripción'}
                  pay={paid || bump ? pay : undefined}
                  bump={bump}
                  coupon={paid}
                  contact={contact}
                  note={paid ? payHint(pay) : undefined}
                />
              </>
            )}
          </section>
        </section>
      </main>
    );
  }
  const [access, reviews, recommendations] = await Promise.all([
    hasAccess ? lessonAccess(personId, course) : null,
    getCourseReviews(course.id, personId),
    relatedCatalogCourses(course, personId),
  ]);
  const ratings = await catalogCourseRatings(recommendations.map(({ course: recommendation }) => recommendation.id));
  const doneCount = access ? access.order.filter((lesson) => access.done.has(lesson.id)).length : 0;
  const nextLesson = access?.pending;
  const finished = Boolean(access) && lessonCount > 0 && !nextLesson;
  const pct = lessonCount ? Math.round((doneCount / lessonCount) * 100) : 0;
  const lessonUrl = (lesson: { slug: string }) => `/academia/${course.slug}/${lesson.slug}`;
  const [firstLesson] = lessonOrder(course.sections, course.lessons);
  const sample = hasAccess ? undefined : paid ? course.lessons.find((lesson) => lesson.preview_public) : firstLesson;
  const openLessons = access?.unlocked ?? new Set(
    paid ? course.lessons.filter((lesson) => lesson.preview_public).map((lesson) => lesson.id) : firstLesson ? [firstLesson.id] : [],
  );
  const teacherName = course.teacher_name.trim() || 'Academia Cluster';
  const byAcademy = teacherName === 'Academia Cluster';
  const initials = teacherName.split(/\s+/).slice(0, 2).map((name) => Array.from(name)[0]).join('').toLocaleUpperCase('es');

  const [topic] = catalogTopicsFor(course);
  const outcomes = course.learning_outcomes.length ? course.learning_outcomes
    : course.slug === 'meta-ads-negocios-locales' ? metaAdsOutcomes : [];
  const content = [
    { icon: 'video', count: course.lessons.filter((lesson) => lesson.has_video).length, singular: 'clase en video', plural: 'clases en video' },
    { icon: 'target', count: course.lessons.filter((lesson) => lesson.has_activity).length, singular: 'actividad', plural: 'actividades' },
    { icon: 'link', count: course.lessons.reduce((sum, lesson) => sum + lesson.resource_count, 0), singular: 'material de apoyo', plural: 'materiales de apoyo' },
  ] as const;
  const includes = content.filter(({ count }) => count > 0);

  return (
    <main className="overflow-x-clip bg-academy-surface">
      <section className="mx-auto grid w-full max-w-7xl items-start gap-x-14 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8">
        <VStack as="header" gap={4} className="academy-course-masthead py-6 text-white sm:gap-6 sm:py-10 lg:col-start-1 lg:row-start-1 lg:py-12">
          <nav aria-label="Ruta del curso" className="flex flex-wrap items-center gap-x-2 text-sm font-semibold text-white/80">
            <Link href={catalogPath} className="py-2 underline-offset-4 hover:underline">Catálogo</Link>
            {topic ? (
              <>
                <Icon name="chevron-down" size={14} className="-rotate-90" aria-hidden="true" />
                <Link href={`/academia?categoria=${topic.id}#catalogo`} className="py-2 underline-offset-4 hover:underline">{topic.label}</Link>
              </>
            ) : null}
          </nav>

          <VStack gap={4} className="min-w-0">
            <Heading level={1} className="max-w-3xl text-pretty break-words text-4xl font-bold !leading-[1.02] text-white sm:text-6xl xl:text-7xl">{course.title}</Heading>
            <Text as="p" className="max-w-2xl whitespace-pre-line text-base leading-relaxed text-white/85 sm:text-lg">{course.description}</Text>
          </VStack>

          <HStack gap={4} align="center" wrap="wrap" className="text-sm text-white/85">
            <Link href="#docente" className="text-white/85 underline-offset-4 hover:underline">Por <strong className="text-white">{teacherName}</strong></Link>
            {reviews.count ? (
              <Link href="#resenas" className="inline-flex items-center gap-2 py-2 font-semibold text-white underline-offset-4 hover:underline">
                <Icon name="star" size={16} fill="currentColor" aria-hidden="true" />
                {reviews.average.toLocaleString('es-HN')} / 5 · {reviews.count} {reviews.count === 1 ? 'reseña' : 'reseñas'}
              </Link>
            ) : null}
          </HStack>

          <dl className="flex flex-wrap gap-x-8 gap-y-3 border-t border-white/25 pt-4 sm:gap-x-10">
            {course.sections.length ? <VStack gap={0}><dt className="text-xs font-semibold text-white/75">Módulos</dt><dd className="mt-0.5 text-2xl font-bold tabular-nums">{course.sections.length}</dd></VStack> : null}
            <VStack gap={0}><dt className="text-xs font-semibold text-white/75">Clases</dt><dd className="mt-0.5 text-2xl font-bold tabular-nums">{lessonCount}</dd></VStack>
            {minutes ? <VStack gap={0}><dt className="text-xs font-semibold text-white/75">Duración</dt><dd className="mt-0.5 text-2xl font-bold tabular-nums">{durationLabel(minutes)}</dd></VStack> : null}
          </dl>
        </VStack>

        <aside aria-label={access ? 'Tu acceso al curso' : 'Inscripción al curso'} className="academy-panel z-10 mt-5 min-w-0 overflow-hidden lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-11">
          {sample ? (
            <Link href={lessonUrl(sample)} className="group relative block focus-visible:-outline-offset-4" prefetch={false}>
              <Cover url={course.cover_url} title={course.title} slug={course.slug} aspect="aspect-[2.2/1] sm:aspect-video lg:aspect-[4/3]" eager />
              <HStack gap={0} align="center" justify="center" className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30">
                <HStack gap={0} align="center" justify="center" className="size-14 rounded-academy-xl bg-academy-surface text-academy-ink shadow-md">
                  <Icon name={sample.has_video ? 'play' : 'arrow-right'} size={23} aria-hidden="true" />
                </HStack>
              </HStack>
              <Text className="absolute bottom-3 left-3 rounded-academy bg-black/85 px-3 py-2 text-xs font-bold text-white">
                {paid ? 'Ver clase de muestra' : 'Ver primera clase'}
              </Text>
            </Link>
          ) : <Cover url={course.cover_url} title={course.title} slug={course.slug} aspect="aspect-[2.2/1] sm:aspect-video lg:aspect-[4/3]" eager />}
          <VStack gap={4} className="p-5 sm:p-6">
            {access ? (
              <>
                <Heading level={2} className="text-2xl font-bold">{finished ? 'Curso terminado' : enrolled ? 'Tu progreso' : 'Tienes acceso a este curso'}</Heading>
                <VStack gap={2}>
                  <progress aria-label="Progreso del curso" value={pct} max={100} className="academy-progress w-full" />
                  <Text as="p" className="text-sm text-academy-muted">{pct}% · {doneCount} de {lessonCount} {lessonCount === 1 ? 'clase' : 'clases'}</Text>
                </VStack>
                {finished ? (
                  <>
                    {access.person?.is_active ? <CertificateRequest slug={course.slug} /> : null}
                    <Link prefetch={false} href={lessonUrl(access.order[0])} className="academy-nav academy-focus justify-center underline">Repasar desde la primera clase</Link>
                  </>
                ) : nextLesson ? (
                  <>
                    <Link prefetch={false} href={lessonUrl(nextLesson)} className="academy-action academy-action-primary min-h-12 w-full">
                      {doneCount ? 'Continuar curso' : 'Empezar el curso'}
                    </Link>
                    <Text as="p" className="text-sm text-academy-muted">{doneCount ? 'Sigue' : 'Primera clase'} · {nextLesson.title}</Text>
                  </>
                ) : null}
              </>
            ) : (
              <>
                <Text as="p" className="text-4xl font-bold tracking-tight text-academy-ink">{priceLabel}</Text>
                {suspended ? (
                  <Text as="p" role="status" className="text-sm leading-relaxed text-academy-muted">{payNote('suspendido')}</Text>
                ) : paid && !payReady(pay) ? (
                  <Text as="p" role="status" className="text-sm leading-relaxed text-academy-muted">{payNote('pasarela')}</Text>
                ) : !paid && contact && !bump ? (
                  <form action={buyCourse}>
                    <input type="hidden" name="slug" value={course.slug} />
                    <AcademySubmit label="Empezar gratis" pending="Inscribiendo…" fullWidth />
                  </form>
                ) : (
                  <Link prefetch={false} href={!paid && !contact ? registration : checkoutPath} className="academy-action academy-action-primary min-h-12 w-full">
                    {paid ? 'Inscribirme ahora' : 'Empezar gratis'} <Icon name="arrow-right" size={17} aria-hidden="true" />
                  </Link>
                )}
              </>
            )}
            {includes.length ? (
              <VStack gap={2} className="border-t border-academy-line pt-4">
                <Text as="p" className="text-sm font-bold">El curso incluye</Text>
                <ul className="space-y-2 text-sm text-academy-muted">
                  {includes.map(({ icon, count, singular, plural }) => (
                    <li key={icon} className="flex items-center gap-3">
                      <Icon name={icon} size={17} className="shrink-0 text-academy-primary" aria-hidden="true" />
                      {count} {count === 1 ? singular : plural}
                    </li>
                  ))}
                </ul>
              </VStack>
            ) : null}
          </VStack>
        </aside>

        <VStack as="article" gap={8} className="min-w-0 pb-10 pt-5 sm:gap-10 lg:col-start-1 lg:row-start-2 lg:pt-6">
          <nav aria-label="Secciones de la ficha" className="flex flex-wrap gap-x-3 border-b border-academy-line pb-2">
            {outcomes.length ? <Link href="#aprendizaje" className="academy-nav academy-focus">Qué aprenderás</Link> : null}
            <Link href="#temario" className="academy-nav academy-focus">Temario</Link>
            <Link href="#docente" className="academy-nav academy-focus">Docente</Link>
            <Link href="#resenas" className="academy-nav academy-focus">Reseñas</Link>
            {recommendations.length ? <Link href="#recomendados" className="academy-nav academy-focus">Recomendados</Link> : null}
          </nav>

          {query.ok && hasAccess ? <p role="status" className="academy-notice">Acceso listo.</p> : null}
          {query.terminado && finished ? (
            <p role="status" className="academy-notice">Terminaste el curso: completaste {lessonCount === 1 ? 'la clase' : `las ${lessonCount} clases`}.</p>
          ) : null}
          {query.constancia === 'nombre' ? <p role="alert" className="academy-notice">
            Guarda tu nombre en <Link href="/academia/perfil" className="font-semibold underline underline-offset-4">Mi perfil</Link> tal como quieres que aparezca en la constancia.
          </p> : null}
          {query.constancia === 'acceso' ? <p role="alert" className="academy-notice">Necesitas una cuenta activa y acceso al curso para emitir la constancia.</p> : null}
          {query.constancia === 'incompleto' ? <p role="alert" className="academy-notice">Completa todas las clases y aprueba sus actividades para emitir la constancia.</p> : null}
          {upsell ? (
            <form action={buyUpsell} className="academy-panel space-y-3 p-5">
              <input type="hidden" name="slug" value={course.slug} />
              <Heading level={2} className="text-xl font-semibold">Añade {upsell.title} por {money(upsell.cents)}</Heading>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" name="acepto" value="1" required className="mt-1" />
                <Text>Autorizo un cargo nuevo de {money(upsell.cents)} por {upsell.title}. Lo confirmo en la pantalla de pago.</Text>
              </label>
              {query.error === 'acepto' ? <p role="alert" className="text-sm">Marca la casilla para continuar.</p> : null}
              <PayMethod options={pay} />
              <HStack gap={3} wrap="wrap" align="center">
                <AcademySubmit label="Sí, agregarlo" pending="Abriendo el pago…" />
                <Link href={coursePath} className="academy-nav academy-focus">No, gracias</Link>
              </HStack>
            </form>
          ) : null}
          {query.error && query.error !== 'acepto' ? <p role="alert" className="academy-notice">{payNote(query.error)}</p> : null}

          {outcomes.length ? (
            <VStack as="section" id="aprendizaje" gap={4} className="scroll-mt-24" aria-labelledby="outcomes-title">
              <Heading level={2} id="outcomes-title" className="academy-section-title">Qué aprenderás</Heading>
              <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {outcomes.map((outcome, index) => (
                  <li className="flex min-w-0 items-start gap-3 break-words leading-relaxed" key={index}>
                    <Icon name="check" size={20} className="mt-0.5 shrink-0 text-academy-primary" strokeWidth={2.5} aria-hidden="true" />
                    <Text className="min-w-0 text-base leading-relaxed">{outcome}</Text>
                  </li>
                ))}
              </ul>
            </VStack>
          ) : null}

          <CourseSyllabus course={course} open={openLessons} done={access?.done} sample={sample?.id} next={nextLesson?.id} />

          {course.audience || course.prerequisites ? (
            <Grid columns={{ minWidth: 220, max: 2 }} gap={6} className="border-y border-academy-line py-6">
              {course.audience ? <VStack as="section" gap={2}><Heading level={2} className="text-xl font-bold">Para quién es</Heading><p className="whitespace-pre-wrap break-words leading-relaxed text-academy-muted">{course.audience}</p></VStack> : null}
              {course.prerequisites ? <VStack as="section" gap={2}><Heading level={2} className="text-xl font-bold">Requisitos</Heading><p className="whitespace-pre-wrap break-words leading-relaxed text-academy-muted">{course.prerequisites}</p></VStack> : null}
            </Grid>
          ) : null}

          <VStack as="section" id="docente" gap={4} className="scroll-mt-24" aria-labelledby="course-teacher-title">
            <Heading level={2} id="course-teacher-title" className="academy-section-title">Quién enseña el curso</Heading>
            <HStack gap={4} align="center" wrap="wrap" className="rounded-academy-lg border border-academy-line bg-academy-tint px-4 py-5 sm:px-5">
              <HStack align="center" justify="center" className={`size-14 shrink-0 rounded-academy ${byAcademy ? 'bg-academy-ink' : 'border border-academy-line bg-academy-surface text-academy-primary'}`}>
                {byAcademy ? <Image src="/assets/logo-white.webp" width={34} height={22} alt="" /> : (
                  <Text aria-hidden="true" className="text-lg font-bold text-academy-primary">{initials}</Text>
                )}
              </HStack>
              <VStack gap={1} className="min-w-0">
                <Heading level={3} className="break-words text-xl font-bold">{teacherName}</Heading>
                {byAcademy ? <Text className="text-sm text-academy-muted">Equipo de formación</Text> : (
                  <Link href={`/academia?q=${encodeURIComponent(teacherName)}#catalogo`} prefetch={false} className="font-semibold text-academy-primary underline underline-offset-4">Ver cursos del docente</Link>
                )}
              </VStack>
            </HStack>
          </VStack>

          <VStack as="section" id="resenas" gap={4} className="scroll-mt-24" aria-labelledby="course-reviews-title">
            <HStack align="end" justify="between" wrap="wrap" gap={2}>
              <Heading level={2} id="course-reviews-title" className="academy-section-title">Reseñas de alumnos</Heading>
              {reviews.count ? (
                <HStack gap={2} align="center" className="text-academy-primary">
                  <Icon name="star" size={18} fill="currentColor" aria-hidden="true" />
                  <Text as="p" className="text-sm font-semibold text-academy-primary">{reviews.average.toLocaleString('es-HN')} de 5 · {reviews.count} {reviews.count === 1 ? 'reseña' : 'reseñas'}</Text>
                </HStack>
              ) : null}
            </HStack>
            {reviews.reviews.length ? (
              <ul className="divide-y divide-academy-line border-y border-academy-line">
                {reviews.reviews.map((review, index) => (
                  <li key={index} className="space-y-2 py-4 text-sm">
                    <p className="font-semibold">{review.rating} de 5 · Alumno verificado</p>
                    {review.body ? <p className="whitespace-pre-wrap break-words leading-relaxed text-academy-muted">{review.body}</p> : null}
                  </li>
                ))}
              </ul>
            ) : <Text as="p" className="text-sm text-academy-muted">Aún no hay reseñas publicadas.</Text>}
            {query.resena === 'error' || query.resena === 'acceso' ? <p role="alert" className="text-sm text-red-800">{query.resena === 'acceso' ? 'Inscríbete y completa una clase para dejar tu reseña.' : 'Selecciona una calificación del 1 al 5 y escribe hasta 1.500 caracteres.'}</p> : null}
            {reviews.eligible ? (
              <form action={saveCourseReview} className="academy-panel space-y-4 p-5">
                <input type="hidden" name="slug" value={course.slug} />
                <Heading level={3} className="text-xl font-semibold">Tu reseña</Heading>
                {reviews.own ? <p role="status" className="text-sm">{reviews.own.status === 'pendiente' ? 'Tu reseña está en moderación.' : reviews.own.status === 'publicada' ? 'Tu reseña está publicada.' : 'Tu reseña está oculta. Puedes editarla para enviarla de nuevo.'}</p> : null}
                <label className="block text-sm font-medium">Calificación
                  <select name="rating" defaultValue={reviews.own?.rating ?? ''} required className="academy-field mt-2 block">
                    <option value="" disabled>Selecciona del 1 al 5</option>
                    {[5, 4, 3, 2, 1].map((value) => <option value={value} key={value}>{value} de 5</option>)}
                  </select>
                </label>
                <label className="block text-sm font-medium">Tu experiencia (opcional)
                  <textarea name="body" defaultValue={reviews.own?.body ?? ''} maxLength={1500} rows={3} className="academy-field mt-2 block w-full" />
                </label>
                <AcademySubmit pending="Guardando…" label="Enviar reseña" />
              </form>
            ) : null}
          </VStack>
        </VStack>
      </section>

      {recommendations.length ? (
        <section id="recomendados" aria-labelledby="recommendations-title" className="scroll-mt-20 border-t border-academy-line bg-academy-page">
          <VStack gap={5} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
            <HStack align="end" justify="between" wrap="wrap" gap={3}>
              <Heading level={2} id="recommendations-title" className="academy-section-title">Cursos recomendados</Heading>
              <Link href={catalogPath} className="academy-nav academy-focus">Ver todo el catálogo <Icon name="arrow-right" size={17} aria-hidden="true" /></Link>
            </HStack>
            <Grid columns={{ minWidth: 240, max: 3 }} gap={5}>
              {recommendations.map(({ course: recommendation, reason, shared }) => (
                <CourseTile key={recommendation.id} course={recommendation} reason={shared ? `Del mismo tema · ${reason}` : reason} rating={ratings.get(recommendation.id)} />
              ))}
            </Grid>
          </VStack>
        </section>
      ) : null}
    </main>
  );
}
