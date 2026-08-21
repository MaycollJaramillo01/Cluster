'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { clients, type Client } from '@/lib/site';

function BrandLogo({ client }: { client: Client }) {
  return (
    <Image
      src={client.logo}
      alt={client.name}
      width={220}
      height={88}
      sizes="(max-width: 768px) 40vw, 220px"
      className="max-h-12 w-auto object-contain opacity-85 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100 sm:max-h-14"
    />
  );
}

function LogoStrip({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul
      className="flex shrink-0 items-center gap-4 pr-4 sm:gap-6 sm:pr-6"
      aria-hidden={duplicate}
    >
      {clients.map((client) => (
        <li
          key={`${duplicate ? 'duplicate-' : ''}${client.name}`}
          className="group flex h-20 w-40 shrink-0 items-center justify-center border-l border-white/10 px-6 py-3 transition duration-300 hover:border-white/25 sm:h-24 sm:w-52 sm:px-8"
        >
          <BrandLogo client={client} />
        </li>
      ))}
    </ul>
  );
}

// Carrusel infinito de marcas con logos reales.
export function LogoWall() {
  const t = useTranslations('Common');

  return (
    <div aria-label={t('brandsCarouselAria')} role="region">
      <ul className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 md:hidden">
        {clients.map((client) => (
          <li
            key={client.name}
            className="group flex min-h-[4.5rem] items-center justify-center bg-ink-950 px-4 py-5"
          >
            <BrandLogo client={client} />
          </li>
        ))}
      </ul>

      <div className="relative hidden overflow-hidden border-y border-white/10 bg-transparent py-3 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)] md:block">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-white/20" />
        <div className="flex w-max animate-marquee items-center [--marquee-duration:34s] hover:[animation-play-state:paused] motion-reduce:animate-none">
          <LogoStrip />
          <div className="motion-reduce:hidden">
            <LogoStrip duplicate />
          </div>
        </div>
      </div>
    </div>
  );
}
