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
  'group/btn relative inline-flex items-center justify-center gap-2.5 border-0 font-mono text-xs font-medium uppercase tracking-[0.16em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:[--tw-ring-color:var(--accent)] focus-visible:[--tw-ring-offset-color:var(--bg)] disabled:opacity-60';

// Botones monocromáticos: contraste sólido que se invierte con el tema.
const variants: Record<Variant, string> = {
  primary:
    'bg-fg text-bg hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-surface text-fg hover:bg-surface-2 hover:-translate-y-0.5 active:translate-y-0',
  ghost: 'bg-surface text-fg hover:bg-surface-2',
  whatsapp:
    'bg-[#25D366] text-white hover:bg-[#1ebe5a] hover:-translate-y-0.5 active:translate-y-0',
  'outline-light': 'bg-surface text-fg hover:bg-surface-2',
  white:
    'bg-paper text-ink hover:bg-white hover:-translate-y-0.5 active:translate-y-0',
};

const sizes: Record<Size, string> = {
  sm: 'px-5 py-2.5',
  md: 'px-6 py-3.5',
  lg: 'px-8 py-4 text-[13px]',
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
