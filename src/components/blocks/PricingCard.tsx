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
          ? 'bg-brand/15 shadow-glow ring-1 ring-inset ring-brand/30'
          : 'bg-white/[0.05] hover:bg-white/[0.08]'
      }`}
    >
      {plan.highlight && (
        <span className="mono-label absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand px-4 py-1.5 text-white">
          Más popular
        </span>
      )}

      <h3 className="font-display text-lg font-semibold text-paper">
        {plan.name}
      </h3>
      <div className="mt-3 flex items-end gap-1">
        <span className="font-display text-4xl font-semibold tracking-tight text-paper">
          {plan.price}
        </span>
        <span className="pb-1.5 font-mono text-sm text-paper/45">
          {plan.period}
        </span>
      </div>

      <ul className="mt-6 flex-1 space-y-2.5 border-t border-white/10 pt-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-paper/60">
            <Icon
              name="check"
              size={15}
              className="mt-0.5 flex-none text-brand-300"
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
