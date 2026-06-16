import type { SVGProps } from 'react';

export type IconName =
  | 'sparkles'
  | 'rocket'
  | 'megaphone'
  | 'target'
  | 'bot'
  | 'globe'
  | 'check'
  | 'arrow-right'
  | 'whatsapp'
  | 'calendar'
  | 'mail'
  | 'phone'
  | 'pin'
  | 'menu'
  | 'close'
  | 'chevron-down'
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'youtube'
  | 'shield'
  | 'search'
  | 'pen'
  | 'users'
  | 'chart'
  | 'bolt';

const paths: Record<IconName, React.ReactNode> = {
  sparkles: (
    <path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5 10.1 7.6 12 3zm6.5 9l.95 2.3L21.75 15l-2.3.95L18.5 18l-.95-2.05L15.25 15l2.3-.7L18.5 12zM5.5 14l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8.8-1.9z" />
  ),
  rocket: (
    <path d="M14 3c2.5.5 5 2.5 6 6 .8 2.9-.3 6-2.5 8.2l-2 2-2.5-2.5 1-2.8-3.4-3.4-2.8 1L5.3 9.5l2-2C9.5 5.3 11.6 3 14 3zm1.5 4.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM6 16c-1 1-1.2 3-1 5 2 .2 4 0 5-1l-4-4z" />
  ),
  megaphone: (
    <path d="M3 11v2a2 2 0 002 2h1l1 5h2l-1-5h1l7 4V6L10 10H5a2 2 0 00-2 2v-1zm16-3a4 4 0 010 8V8z" />
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  bot: (
    <>
      <rect x="4" y="8" width="16" height="11" rx="3" />
      <path d="M12 4v4M9 13h.01M15 13h.01M9 16h6" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
    </>
  ),
  check: <path d="M5 13l4 4L19 7" />,
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" />,
  whatsapp: (
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.8 14.13c-.25.69-1.45 1.32-1.99 1.4-.53.08-1.17.11-1.89-.12-.44-.14-1-.32-1.71-.63-3.01-1.3-4.97-4.33-5.12-4.53-.15-.2-1.22-1.62-1.22-3.09 0-1.47.77-2.19 1.05-2.49.27-.3.6-.37.8-.37.2 0 .4.002.57.01.18.008.43-.07.67.51.25.6.85 2.07.92 2.22.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.18-.31.4-.45.53-.15.15-.3.31-.13.61.17.3.77 1.27 1.65 2.06 1.14 1.01 2.1 1.33 2.4 1.48.3.15.47.12.64-.07.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.7.8 1.99.95.3.15.5.22.57.35.07.12.07.72-.18 1.41z" />
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  phone: (
    <path d="M5 3h3l2 5-2.5 1.5a11 11 0 005 5L19 14l2 5v3a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-2z" />
  ),
  pin: (
    <>
      <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  'chevron-down': <path d="M6 9l6 6 6-6" />,
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <path d="M14 9V7c0-1 .5-1.5 1.5-1.5H17V2.5h-2.5C12 2.5 10.5 4 10.5 6.5V9H8v3h2.5v9.5h3.5V12H17l.5-3H14z" />
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 014 0v4M11 10v7" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="3" />
      <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
    </>
  ),
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  pen: <path d="M4 20l4-1L20 7a2 2 0 00-3-3L5 16l-1 4zM14 6l3 3" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5a3 3 0 010 6M17 14c2.5.5 4 2.5 4 6" />
    </>
  ),
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  bolt: <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />,
};

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
};

export function Icon({ name, size = 24, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
