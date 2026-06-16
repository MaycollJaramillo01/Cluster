import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta editorial: tinta #111111 (negro neutro) + papel #F9F9F9
        ink: {
          DEFAULT: '#111111',
          950: '#080808',
          900: '#111111',
          850: '#1A1A1A',
          800: '#222222',
          700: '#163039',
          600: '#1F4350',
          500: '#2C5A6B',
        },
        paper: {
          DEFAULT: '#F9F9F9',
          soft: '#EFEFEF',
          dim: '#E4E4E4',
        },
        // "brand" apunta a la tinta (sin verde) por compatibilidad con clases existentes.
        brand: {
          DEFAULT: '#02C39A',
          50: '#EAEDEE',
          100: '#C9D0D2',
          200: '#9FACB0',
          300: '#6E8089',
          400: '#42535C',
          500: '#09161C',
          600: '#09161C',
          700: '#070F14',
          800: '#05090C',
          900: '#030506',
          glow: '#1F4350',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Arial Narrow', 'Impact', 'sans-serif'],
        brand: ['var(--font-brand)', 'Montserrat', 'Arial', 'sans-serif'],
        sans: ['var(--font-body)', 'Georgia', 'serif'],
        serif: ['var(--font-body)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'Consolas', 'monospace'],
      },
      fontSize: {
        '10xl': ['10rem', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
      },
      maxWidth: {
        container: '1320px',
      },
      // Estética editorial: esquinas rectas en todo el sitio.
      borderRadius: {
        none: '0',
        sm: '0',
        DEFAULT: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        '4xl': '0',
        '5xl': '0',
        full: '0',
      },
      boxShadow: {
        glow: '0 24px 60px -24px rgba(0,0,0,0.35)',
        'glow-sm': '0 12px 30px -14px rgba(0,0,0,0.3)',
        panel: '0 30px 80px -20px rgba(0,0,0,0.45)',
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-rev': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        marquee: 'marquee var(--marquee-duration,40s) linear infinite',
        'marquee-rev': 'marquee-rev var(--marquee-duration,40s) linear infinite',
        float: 'float 7s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'spin-slow': 'spin-slow 22s linear infinite',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
