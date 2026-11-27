import Link from 'next/link';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Page, payNote, payReady } from '@/components/academia/ui';
import { SubscriptionForm } from '@/components/academia/PayForms';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { cancelMySubscription } from '@/lib/valux/actions';
import { getPerson, listPlans, personSubscription } from '@/lib/valux/data';
import { academiaPersonId } from '@/lib/valux/session';
import { formatDate } from '@/lib/crm/format';
import { paymentOptions } from '@/lib/valux/transfers';
import { Icon } from '@/components/ui/Icon';

export default async function SuscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; cancelada?: string }>;
}) {
  const query = await searchParams;
  const plans = await listPlans(true);
  const personId = await academiaPersonId();
  const [current, person] = personId ? await Promise.all([personSubscription(personId), getPerson(personId)]) : [null, null];
  const pay = await paymentOptions();
  const active = current?.status === 'activa';

  return (
    <Page className="max-w-6xl gap-8">
      <VStack as="header" gap={2}>
        <p className="text-sm font-semibold text-academy-primary">Membresía</p>
        <Heading level={1} className="academy-title">Aprende con una membresía mensual</Heading>
        <p className="max-w-prose text-academy-muted">Un solo pago mensual en lempiras para aprender con los cursos incluidos en tu plan.</p>
      </VStack>

      {query.ok ? <p role="status" className="academy-notice flex items-center gap-2"><Icon name="check" size={16} className="text-academy-primary" />Tu membresía está activa.</p> : null}
      {query.cancelada ? <p role="status" className="academy-notice">Listo. Tu membresía ya no se renovará.</p> : null}
      {query.error === 'cancelar' ? <p role="alert" className="academy-notice">No se pudo cancelar en la pasarela. Intenta de nuevo o escríbenos.</p> : null}
      {query.error && query.error !== 'cancelar' ? <p role="alert" className="academy-notice">{payNote(query.error)}</p> : null}

      {current ? (
        <section aria-label="Tu membresía" className="academy-panel grid gap-6 p-5 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
          <VStack gap={2}>
            <HStack gap={3} align="center" wrap="wrap">
              <Heading level={2} className="text-2xl font-bold">Plan {current.plan_name || 'completo'}</Heading>
              <strong className={`rounded-academy-full px-3 py-1 text-xs font-semibold ${active ? 'bg-academy-tint text-academy-primary' : 'bg-academy-page text-academy-muted'}`}>{active ? 'Activa' : 'No se renueva'}</strong>
            </HStack>
            <p className="text-academy-muted">
              {active
                ? `Próxima renovación: ${formatDate(current.current_period_end)}.`
                : `Tienes los beneficios hasta el ${formatDate(current.current_period_end)}.`}
            </p>
          </VStack>
          <HStack gap={3} wrap="wrap">
            <Link href="/academia/mis-cursos" className="academy-action academy-action-primary">Ir a mis cursos <Icon name="arrow-right" size={16} /></Link>
            {active && current.gateway_id ? (
              <form action={cancelMySubscription}>
                <AcademySubmit label="Cancelar renovación" pending="Cancelando…" variant="secondary" />
              </form>
            ) : null}
          </HStack>
        </section>
      ) : plans.length === 0 ? (
        <p className="academy-panel p-6 text-academy-muted">Todavía no hay planes disponibles.</p>
      ) : (
        <SubscriptionForm plans={plans} pay={payReady(pay) ? pay : null} contact={person ? { name: person.name, email: person.email } : undefined} />
      )}
    </Page>
  );
}
