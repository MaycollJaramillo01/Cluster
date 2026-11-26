import localFont from 'next/font/local';

export const academyBody = localFont({
  src: '../fonts/inter-latin.ttf',
  weight: '400 800',
  variable: '--font-academy-body',
  display: 'swap',
});

export const academyHeading = localFont({
  src: '../fonts/plus-jakarta-sans-latin.ttf',
  weight: '400 800',
  variable: '--font-academy-heading',
  display: 'swap',
});
