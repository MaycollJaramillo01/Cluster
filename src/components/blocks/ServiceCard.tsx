import Link from 'next/link';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import type { Service } from '@/lib/site';

export function ServiceCard({
  service,
  index = 0,
}: {
  service: Service;
  index?: number;
}) {
  return (
    <Reveal
      as="article"
      delay={index * 70}
      className="card-dark group flex flex-col p-7"
    >
      {/* Índice */}
      <span className="mono-label absolute right-7 top-7 text-faint">
        {String(index + 1).padStart(2, '0')}
      </span>

      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-accent transition-all duration-500 group-hover:scale-110 group-hover:border-line group-hover:bg-accent group-hover:text-accent-fg">
        <Icon name={service.icon as IconName} size={24} />
      </span>

      <h3 className="mt-6 font-display text-xl font-semibold text-fg">
        {service.name}
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        {service.description}
      </p>

      {service.price && (
        <span className="mt-4 inline-flex w-fit items-center rounded-full bg-surface px-3 py-1 font-mono text-xs font-medium text-accent">
          {service.price}
        </span>
      )}

      <ul className="mt-5 space-y-2 border-t border-line pt-5">
        {service.features.slice(0, 4).map((f) => (
          <li
            key={f}
            className="flex items-center gap-2.5 text-sm text-muted"
          >
            <Icon
              name="check"
              size={14}
              className="text-accent"
              strokeWidth={2.5}
            />
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={service.href}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-all group-hover:gap-3"
      >
        {service.cta}
        <Icon name="arrow-right" size={16} />
      </Link>
    </Reveal>
  );
}
