import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

type Tone = 'light' | 'soft' | 'dark' | 'brand';

// Cada tono activa un tema (claro/oscuro) que invierte las utilidades semánticas.
const tones: Record<Tone, string> = {
  light: 'theme-light bg-paper',
  soft: 'theme-light bg-paper-soft',
  dark: 'theme-dark bg-ink-900 grain',
  brand: 'theme-dark bg-ink-950 grain',
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
      className={`relative overflow-hidden py-24 text-fg sm:py-28 lg:py-32 ${tones[tone]} ${className}`}
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
    <span className="mono-label inline-flex items-center gap-3 text-accent">
      <span className="inline-block h-px w-8 bg-accent" />
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
      <h2 className="text-5xl text-fg sm:text-6xl lg:text-7xl">{title}</h2>
      {description && (
        <p className="text-lg leading-relaxed text-muted sm:text-xl">
          {description}
        </p>
      )}
    </Reveal>
  );
}
