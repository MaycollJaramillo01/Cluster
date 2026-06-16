import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { whatsappLink, type Plan } from '@/lib/site';

export function PricingCard({ plan, index = 0 }: { plan: Plan; index?: number }) {
  return (
    <Reveal
      delay={index * 80}
      className={`group relative flex flex-col rounded-3xl p-7 transition-all duration-500 hover:-translate-y-1.5 ${
        plan.highlight
          ? 'bg-surface-2 shadow-glow ring-1 ring-inset ring-[color:var(--accent)]'
          : 'bg-surface hover:bg-surface-2'
      }`}
    >
      {plan.highlight && (
        <span className="mono-label absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-accent px-4 py-1.5 text-accent-fg">
          Más popular
        </span>
      )}

      <h3 className="font-display text-lg font-semibold text-fg">
        {plan.name}
      </h3>
      <div className="mt-3 flex items-end gap-1">
        <span className="font-display text-4xl font-semibold tracking-tight text-fg">
          {plan.price}
        </span>
        <span className="pb-1.5 font-mono text-sm text-faint">
          {plan.period}
        </span>
      </div>

      <ul className="mt-6 flex-1 space-y-2.5 border-t border-line pt-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-muted">
            <Icon
              name="check"
              size={15}
              className="mt-0.5 flex-none text-accent"
              strokeWidth={2.5}
            />
            {f}
          </li>
        ))}
      </ul>

      <Button
        href={whatsappLink(`Hola, quiero el paquete ${plan.name} de redes sociales.`)}
        external
        variant={plan.highlight ? 'primary' : 'ghost'}
        className="mt-7 w-full"
      >
        Solicitar {plan.name}
      </Button>
    </Reveal>
  );
}
