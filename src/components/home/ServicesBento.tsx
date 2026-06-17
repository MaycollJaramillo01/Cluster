'use client';

import Link from 'next/link';
import { useState } from 'react';

type BentoVariant = 'accent' | 'dark' | 'light';

type BentoCard = {
  index: number;
  title: string;
  href: string;
  cta: string;
  tags: string;
  variant: BentoVariant;
  gridClass: string;
  titleClass: string;
  video?: string;
  poster?: string;
};

const cards: BentoCard[] = [
  {
    index: 1,
    title: 'Branding',
    href: '/branding',
    cta: 'Ver Branding',
    tags: 'Logotipo · Manual de marca',
    variant: 'accent',
    gridClass: 'md:col-span-2 md:row-span-2 min-h-72',
    titleClass: 'text-5xl lg:text-6xl xl:text-[5.5rem]',
    video: '/assets/videos/services/marca-profesional.mp4',
    poster: '/assets/videos/services/marca-profesional-poster.jpg',
  },
  {
    index: 2,
    title: 'Paquete Digital Inicial',
    href: '/paquete-inicial-digital',
    cta: 'Ver paquete',
    tags: 'USD 590 · Pago único',
    variant: 'dark',
    gridClass: 'md:col-span-2 min-h-56',
    titleClass: 'text-3xl lg:text-4xl xl:text-5xl',
    video: '/assets/videos/services/paquete-digital-bg.mp4',
    poster: '/assets/videos/services/paquete-digital-bg-poster.jpg',
  },
  {
    index: 3,
    title: 'Redes Sociales',
    href: '/redes-sociales',
    cta: 'Ver',
    tags: 'Crecimiento',
    variant: 'light',
    gridClass: 'min-h-44',
    titleClass: 'text-2xl lg:text-3xl',
    video: '/assets/videos/services/redes-sociales-bg.mp4',
    poster: '/assets/videos/services/redes-sociales-bg-poster.jpg',
  },
  {
    index: 4,
    title: 'Google Ads',
    href: '/google-ads',
    cta: 'Ver',
    tags: 'Desde USD 150/mes',
    variant: 'dark',
    gridClass: 'min-h-44',
    titleClass: 'text-2xl lg:text-3xl',
    video: '/assets/videos/services/google-ads-bg.mp4',
    poster: '/assets/videos/services/google-ads-bg-poster.jpg',
  },
  {
    index: 5,
    title: 'IA / Automatizaciones',
    href: '/automatizaciones-ia',
    cta: 'Ver más',
    tags: 'WhatsApp · CRM · Workflows',
    variant: 'light',
    gridClass: 'md:col-span-2 min-h-44',
    titleClass: 'text-3xl lg:text-4xl',
    video: '/assets/videos/services/automatizacion.mp4',
    poster: '/assets/videos/services/automatizacion-poster.jpg',
  },
  {
    index: 6,
    title: 'Websites / SEO',
    href: '/websites-seo',
    cta: 'Ver',
    tags: 'Landing pages · SEO básico',
    variant: 'dark',
    gridClass: 'md:col-span-2 min-h-44',
    titleClass: 'text-3xl lg:text-4xl',
    video: '/assets/videos/services/websites-seo-bg.mp4',
    poster: '/assets/videos/services/websites-seo-bg-poster.jpg',
  },
  {
    index: 7,
    title: 'SEO Audit',
    href: '/seo-audit',
    cta: 'Auditar',
    tags: 'IA · Diagnostico SEO',
    variant: 'accent',
    gridClass: 'md:col-span-4 min-h-44',
    titleClass: 'text-3xl lg:text-4xl xl:text-5xl',
    video: '/assets/videos/services/websites-seo-bg.mp4',
    poster: '/assets/videos/services/websites-seo-bg-poster.jpg',
  },
];

const variantBg: Record<BentoVariant, string> = {
  accent: 'bg-accent',
  dark: 'bg-ink-850',
  light: 'bg-paper-soft',
};

const variantText: Record<BentoVariant, string> = {
  accent: 'text-ink-950',
  dark: 'text-fg',
  light: 'text-ink-950',
};

const variantMuted: Record<BentoVariant, string> = {
  accent: 'text-ink-950/55',
  dark: 'text-muted',
  light: 'text-ink-950/50',
};

const variantBorder: Record<BentoVariant, string> = {
  accent: 'border-ink-950/15',
  dark: 'border-white/10',
  light: 'border-ink-950/12',
};

function Card({ card }: { card: BentoCard }) {
  const [hovered, setHovered] = useState(false);
  const active = hovered && !!card.video;

  return (
    <Link
      href={card.href}
      className={`relative overflow-hidden ${card.gridClass}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Video — always playing behind color layer */}
      {card.video && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={card.poster}
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover"
        >
          <source src={card.video} type="video/mp4" />
        </video>
      )}

      {/* Color layer — fades out on hover */}
      <div
        className={`absolute inset-0 z-10 ${variantBg[card.variant]} transition-opacity duration-700`}
        style={{ opacity: active ? 0 : 1 }}
      />

      {/* Dark scrim for text legibility over video */}
      {card.video && (
        <div
          className="absolute inset-0 z-20 bg-black/55 transition-opacity duration-700"
          style={{ opacity: active ? 1 : 0 }}
        />
      )}

      {/* Content */}
      <div
        className={`absolute inset-0 z-30 flex flex-col justify-between p-6 lg:p-8 transition-colors duration-500 ${
          active ? 'text-white' : variantText[card.variant]
        }`}
      >
        {/* Index */}
        <span
          className={`mono-label transition-colors duration-500 ${
            active ? 'text-white/55' : variantMuted[card.variant]
          }`}
        >
          {String(card.index).padStart(2, '0')}
        </span>

        {/* Title */}
        <h3 className={`mt-auto pb-5 font-display font-bold uppercase leading-none ${card.titleClass}`}>
          {card.title}
        </h3>

        {/* Bottom bar */}
        <div
          className={`flex items-center justify-between gap-4 border-t pt-4 ${
            active ? 'border-white/15' : variantBorder[card.variant]
          }`}
        >
          <span
            className={`mono-label transition-colors duration-500 ${
              active ? 'text-white/55' : variantMuted[card.variant]
            }`}
          >
            {card.tags}
          </span>
          <span
            className={`mono-label shrink-0 font-semibold transition-all duration-300 ${
              active ? 'text-white tracking-[0.34em]' : `${variantText[card.variant]} tracking-[0.16em]`
            }`}
          >
            {card.cta} →
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ServicesBento() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.index} card={card} />
      ))}
    </div>
  );
}
