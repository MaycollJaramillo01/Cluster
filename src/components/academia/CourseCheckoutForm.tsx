'use client';

import { useActionState, useEffect, useRef, type ComponentProps } from 'react';
import { buyCourseWithFeedback } from '@/lib/valux/actions';
import { Checkout } from './ui';

type Props = Omit<ComponentProps<typeof Checkout>, 'action' | 'feedback'>;

export function CourseCheckoutForm(props: Props) {
  const [state, action] = useActionState(buyCourseWithFeedback, {
    attempt: 0, error: undefined as string | undefined, name: '', email: '', coupon: '', method: '', bump: false,
  });
  const region = useRef<HTMLElement>(null);

  useEffect(() => {
    if (state.error) region.current?.querySelector<HTMLElement>('[data-checkout-error]')?.focus();
  }, [state.attempt, state.error]);

  return (
    <section ref={region} aria-label="Formulario de inscripción">
      <Checkout key={state.attempt} {...props} action={action} feedback={state.attempt ? state : undefined} contact={state.attempt ? state : props.contact} />
    </section>
  );
}
