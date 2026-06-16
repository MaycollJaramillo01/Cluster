import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

type Tone = 'light' | 'soft' | 'dark' | 'brand';

// En dark modernism todo es oscuro; los tonos solo varían la elevación.
const tones: Record<Tone, string> = {
  light: 'bg-ink-900 text-paper',
  soft: 'bg-ink-850 text-paper',
  dark: 'bg-ink-950 text-paper grain',
  brand: 'bg-brand text-white',
};

type SectionProps = {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  id?: string;
  containerClassName?: string;
};

export function Section({
  children,
  tone = 'light',
  className = '',
  id,
  containerClassName = '',
}: SectionProps) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden py-24 sm:py-28 lg:py-32 ${tones[tone]} ${className}`}
    >
      <div className={`container-x relative z-[1] ${containerClassName}`}>
        {children}
      </div>
    </section>
  );
}

type EyebrowProps = {
  children: ReactNode;
  tone?: 'dark' | 'light';
};

export function Eyebrow({ children }: EyebrowProps) {
  return (
    <span className="mono-label inline-flex items-center gap-2.5 text-brand-300">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-400 shadow-glow-sm" />
      {children}
    </span>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light';
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className = '',
}: SectionHeadingProps) {
  const isCenter = align === 'center';
  return (
    <Reveal
      className={`flex flex-col gap-5 ${
        isCenter ? 'mx-auto max-w-3xl items-center text-center' : 'max-w-2xl'
      } ${className}`}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-[2rem] font-semibold leading-[1.05] text-paper sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="text-lg leading-relaxed text-paper/55">{description}</p>
      )}
    </Reveal>
  );
}
