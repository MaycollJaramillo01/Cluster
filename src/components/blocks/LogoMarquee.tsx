import { clientLogos } from '@/lib/site';

// Marquee infinito de nombres de clientes (prueba social).
export function LogoMarquee() {
  const row = [...clientLogos, ...clientLogos];
  return (
    <div
      className="relative flex overflow-hidden"
      style={{
        maskImage:
          'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
      }}
    >
      <div className="flex shrink-0 animate-marquee items-center gap-14 pr-14">
        {row.map((name, i) => (
          <span
            key={i}
            className="whitespace-nowrap font-display text-xl font-medium text-paper/30 transition-colors hover:text-brand-300"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
