import type { ReactNode } from 'react';
import Link from 'next/link';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Cover } from './ui';

type Course = { slug: string; title: string; cover_url: string };

const studentSteps = [
  ['Te enviamos un código a tu correo', 'Sirve una sola vez y vence en 15 minutos.'],
  ['Lo escribes aquí', 'No necesitas contraseña.'],
  ['Entras a tus cursos', 'Tu avance y tus constancias quedan guardados.'],
] as const;

const teacherSteps = [
  ['Correo y contraseña', 'Los de tu cuenta del panel.'],
  ['Código de verificación', 'El de tu aplicación de autenticación.'],
  ['Entras a tu panel', 'Cursos, alumnos y entregas por revisar.'],
] as const;

// Marco común de entrar, código y confirmación: el paso actual se ve en el panel oscuro.
export function AuthShell({ step, course, teacher = false, children }: {
  step: 1 | 2 | 3;
  course?: Course | null;
  teacher?: boolean;
  children: ReactNode;
}) {
  const steps = teacher ? teacherSteps : studentSteps;
  return (
    <main className="academy-page max-w-6xl">
      <section className="academy-panel grid overflow-hidden lg:grid-cols-5">
        <VStack as="section" gap={6} className="min-w-0 p-5 sm:p-8 lg:col-span-3 lg:p-12">{children}</VStack>
        <VStack as="aside" gap={8} aria-label={teacher ? 'Cómo entra el equipo docente' : 'Cómo funciona el acceso'} className="academy-hero order-first p-6 text-white sm:p-8 lg:order-last lg:col-span-2 lg:p-10">
          {course ? (
            <Link href={`/academia/${course.slug}`} className="academy-focus flex items-center gap-4 rounded-academy-lg border border-white/15 bg-white/5 p-3 hover:border-white/40">
              <figure className="w-24 shrink-0 overflow-hidden rounded-academy"><Cover url={course.cover_url} title={course.title} slug={course.slug} /></figure>
              <VStack gap={1} className="min-w-0">
                <small className="text-xs font-semibold text-academy-action">Curso elegido</small>
                <strong className="break-words font-semibold leading-snug text-white">{course.title}</strong>
              </VStack>
            </Link>
          ) : null}
          <VStack gap={2}>
            <Heading level={2} className="text-2xl font-bold text-white">{teacher ? 'Acceso del equipo docente' : course ? 'Entra para seguir con el curso' : 'Tu espacio de aprendizaje'}</Heading>
            <p className="text-sm leading-relaxed text-white/75">{teacher ? 'El acceso usa contraseña y un segundo factor.' : 'Entras con tu correo: te enviamos un código de 6 dígitos.'}</p>
          </VStack>
          <ol className="hidden space-y-5 sm:block" aria-label="Pasos">
            {steps.map(([title, detail], index) => {
              const number = index + 1;
              const state = number < step ? 'hecho' : number === step ? 'actual' : 'pendiente';
              return (
                <li key={title} aria-current={state === 'actual' ? 'step' : undefined}>
                  <HStack gap={4} align="start">
                    <strong className={`grid size-8 shrink-0 place-items-center rounded-academy-full border text-sm ${state === 'pendiente' ? 'border-white/25 text-white/60' : 'border-academy-action bg-academy-action text-academy-action-text'}`}>{number}</strong>
                    <VStack gap={1}>
                      <strong className={`font-semibold ${state === 'pendiente' ? 'text-white/70' : 'text-white'}`}>{title}</strong>
                      <small className="text-sm text-white/65">{detail}</small>
                    </VStack>
                  </HStack>
                </li>
              );
            })}
          </ol>
        </VStack>
      </section>
    </main>
  );
}

// Aviso de error de los formularios de acceso.
export function AuthError({ children, id }: { children: ReactNode; id?: string }) {
  return <p id={id} role="alert" className="rounded-academy border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{children}</p>;
}
