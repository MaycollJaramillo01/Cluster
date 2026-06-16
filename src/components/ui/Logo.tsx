import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/lib/site';

type LogoProps = {
  variant?: 'light' | 'dark';
  className?: string;
};

// Logo oficial de Cluster Media (marca de "clúster" de tres figuras entrelazadas).
export function Logo({ variant = 'light', className = '' }: LogoProps) {
  const isLight = variant === 'light';

  return (
    <Link
      href="/"
      aria-label={`${site.name} — Inicio`}
      className={`group inline-flex items-center gap-2.5 ${className}`}
    >
      <Image
        src={isLight ? '/assets/logo-white.webp' : '/assets/logo-mark.webp'}
        alt="Cluster Media"
        width={400}
        height={222}
        priority
        className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
      />
      <span
        className={`flex flex-col leading-none ${
          isLight ? 'text-white' : 'text-ink-900'
        }`}
      >
        <span className="font-brand text-[15px] font-extrabold uppercase tracking-[0.18em]">
          Cluster
        </span>
        <span
          className={`mt-0.5 font-brand text-[12px] font-light uppercase tracking-[0.38em] ${
            isLight ? 'text-white/50' : 'text-ink-900/45'
          }`}
        >
          Media
        </span>
      </span>
    </Link>
  );
}
