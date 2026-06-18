import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { plans, whatsappLink, type PricingPlan } from '@/lib/site';

function PlanCard({ plan, index }: { plan: PricingPlan; index: number }) {
  const highlight = !!plan.highlight;

  return (
    <Reveal
      delay={index * 90}
      className={`group relative flex flex-col p-8 transition-all duration-500 sm:p-9 ${
        highlight
          ? 'theme-dark grain bg-ink-950 text-fg shadow-panel ring-1 ring-inset ring-[color:var(--accent)] lg:-my-6 lg:py-14'
          : 'bg-paper-soft text-fg ring-1 ring-inset ring-[color:var(--line)] hover:-translate-y-1.5 hover:ring-[color:var(--accent)]'
      }`}
    >
      {/* Línea de acento superior en el plan destacado */}
      {highlight && (
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-accent" aria-hidden="true" />
      )}

      {/* Badge */}
      {plan.badge && (
        <span className="mono-label absolute right-7 top-7 bg-accent px-3 py-1 text-accent-fg sm:right-8 sm:top-9">
          {plan.badge}
        </span>
      )}

      {/* Encabezado */}
      <span className="mono-label text-faint">{plan.kicker}</span>
      <h3 className="mt-2 font-display text-2xl font-bold uppercase tracking-tight text-fg sm:text-3xl">
        {plan.name}
      </h3>

      {/* Precio */}
      <div className="mt-6 flex items-end gap-1.5">
        <span className="font-display text-5xl font-bold leading-none tracking-tight text-fg lg:text-6xl">
          {plan.price}
        </span>
        {plan.period && (
          <span className="pb-1.5 font-mono text-sm text-faint">{plan.period}</span>
        )}
      </div>
      <span className="mt-3 block text-[15px] leading-snug text-muted">{plan.note}</span>

      {/* Features */}
      <ul className="mt-8 flex-1 space-y-3.5 border-t border-line pt-8">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-[15px] leading-snug text-muted">
            <Icon
              name="check"
              size={16}
              strokeWidth={2.5}
              className="mt-0.5 flex-none text-accent"
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        href={whatsappLink(plan.whatsapp)}
        external
        variant={highlight ? 'primary' : 'ghost'}
        iconRight="arrow-right"
        size="lg"
        className="mt-9 w-full"
      >
        {plan.cta}
      </Button>
    </Reveal>
  );
}

export function PricingPlans() {
  return (
    <div className="mt-14 grid gap-5 lg:grid-cols-3 lg:items-center">
      {plans.map((plan, i) => (
        <PlanCard key={plan.name} plan={plan} index={i} />
      ))}
    </div>
  );
}
