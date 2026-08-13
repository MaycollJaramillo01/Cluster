import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';

const websiteCases = [
  {
    name: 'Luxo Boutique',
    category: 'E-commerce',
    url: 'https://www.luxoboutique.com/',
    image: '/assets/stock/desarrollo-web/luxo.png',
  },
  {
    name: 'Ink Express',
    category: 'E-commerce',
    url: 'http://inkexpresshn.com/',
    image: '/assets/stock/desarrollo-web/ink-express.png',
  },
  {
    name: 'Bee Cool & Heat',
    category: 'Servicios',
    url: 'https://beecoolandheat.com/',
    image: '/assets/stock/desarrollo-web/bee-cool.png',
  },
  {
    name: 'Familia Towing',
    category: 'Servicios',
    url: 'https://familiatowing.com/',
    image: '/assets/stock/desarrollo-web/familia-towing.png',
  },
  {
    name: 'Alpha Pro',
    category: 'Renovaciones',
    url: 'https://www.alphapro.llc/',
    image: '/assets/stock/desarrollo-web/alpha-pro.png',
  },
] as const;

function CaseCard({
  item,
  duplicate = false,
}: {
  item: (typeof websiteCases)[number];
  duplicate?: boolean;
}) {
  return (
    <li className="w-[20rem] shrink-0 sm:w-[26rem]">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={duplicate ? -1 : undefined}
        className="group relative block overflow-hidden bg-surface transition-transform duration-300 hover:-translate-y-1"
      >
        <div className="web-card-bar absolute inset-x-0 top-0 z-[1]" aria-hidden="true" />
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" aria-hidden="true" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" aria-hidden="true" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" aria-hidden="true" />
          <span className="ml-2 truncate font-mono text-[10px] uppercase tracking-wider text-faint">
            {item.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </span>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden bg-ink-950">
          <Image
            src={item.image}
            alt={duplicate ? '' : `Website de ${item.name}`}
            fill
            sizes="416px"
            className="object-cover object-top transition duration-700 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex items-end justify-between gap-4 p-5">
          <div>
            <span className="mono-label text-accent">{item.category}</span>
            <h3 className="mt-2 font-display text-xl font-semibold uppercase leading-tight text-fg">
              {item.name}
            </h3>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-accent text-accent-fg transition-opacity group-hover:opacity-90">
            <Icon name="arrow-right" size={16} />
          </span>
        </div>
      </a>
    </li>
  );
}

function CasesStrip({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul className="flex shrink-0 gap-5 pr-5 sm:gap-6 sm:pr-6" aria-hidden={duplicate}>
      {websiteCases.map((item) => (
        <CaseCard
          key={`${duplicate ? 'dup-' : ''}${item.url}`}
          item={item}
          duplicate={duplicate}
        />
      ))}
    </ul>
  );
}

export function WebsiteCasesCarousel() {
  return (
    <div
      aria-label="Carrusel de casos de éxito web"
      className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]"
      role="region"
    >
      <div className="flex w-max animate-marquee py-1 [--marquee-duration:42s] hover:[animation-play-state:paused] motion-reduce:animate-none">
        <CasesStrip />
        <div className="motion-reduce:hidden">
          <CasesStrip duplicate />
        </div>
      </div>
    </div>
  );
}
