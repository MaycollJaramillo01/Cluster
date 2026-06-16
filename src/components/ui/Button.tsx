import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

type Variant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'whatsapp'
  | 'outline-light'
  | 'white';
type Size = 'sm' | 'md' | 'lg';

const base =
  'group/btn relative inline-flex items-center justify-center gap-2 border-0 font-medium tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:opacity-60';

// Estilo modernista: rellenos sólidos, sin bordes. Botones contundentes.
const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-white hover:bg-brand-400 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-paper text-ink-900 hover:bg-white hover:-translate-y-0.5 active:translate-y-0',
  ghost:
    'bg-white/[0.08] text-paper backdrop-blur-sm hover:bg-white/[0.16] hover:-translate-y-0.5 active:translate-y-0',
  whatsapp:
    'bg-[#25D366] text-white hover:bg-[#1ebe5a] hover:-translate-y-0.5 active:translate-y-0',
  'outline-light':
    'bg-white/[0.08] text-paper backdrop-blur-sm hover:bg-white/[0.16] hover:-translate-y-0.5 active:translate-y-0',
  white:
    'bg-paper text-ink-900 hover:bg-white hover:-translate-y-0.5 active:translate-y-0',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-[15px]',
  lg: 'px-7 py-3.5 text-[15px]',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  children: ReactNode;
  className?: string;
};

type ButtonAsLink = CommonProps & {
  href: string;
  external?: boolean;
  type?: never;
  onClick?: never;
};

type ButtonAsButton = CommonProps & {
  href?: undefined;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  disabled?: boolean;
};

function Inner({
  icon,
  children,
  iconRight,
}: Pick<CommonProps, 'icon' | 'children' | 'iconRight'>) {
  return (
    <>
      {icon && <Icon name={icon} size={18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={18} />}
    </>
  );
}

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const {
    variant = 'primary',
    size = 'md',
    icon,
    iconRight,
    children,
    className = '',
  } = props;
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  const inner = <Inner icon={icon} iconRight={iconRight}>{children}</Inner>;

  if (props.href) {
    if (props.external) {
      return (
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link href={props.href} className={classes}>
        {inner}
      </Link>
    );
  }

  const btn = props as ButtonAsButton;
  return (
    <button
      type={btn.type ?? 'button'}
      onClick={btn.onClick}
      disabled={btn.disabled}
      className={classes}
    >
      {inner}
    </button>
  );
}
