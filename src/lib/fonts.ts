import localFont from 'next/font/local';

export const display = localFont({
  src: '../fonts/bebas-neue-400.woff2',
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

export const body = localFont({
  src: '../fonts/dm-sans.woff2',
  weight: '400 600',
  variable: '--font-body',
  display: 'swap',
});

export const mono = localFont({
  src: [
    { path: '../fonts/ibm-plex-mono-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/ibm-plex-mono-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/ibm-plex-mono-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-mono',
  display: 'swap',
});

export const brand = localFont({
  src: '../fonts/montserrat.woff2',
  weight: '300 800',
  variable: '--font-brand',
  display: 'swap',
});
