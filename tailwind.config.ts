import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta dark modernism de Cluster Media
        ink: {
          DEFAULT: '#1D1D1D',
          950: '#0A0A0A',
          900: '#0E0E0E',
          850: '#121212',
          800: '#1D1D1D',
          700: '#242424',
          600: '#2E2E2E',
          500: '#3a3a3a',
        },
        paper: {
          DEFAULT: '#F9F9F9',
          dim: '#E7E7E7',
        },
        brand: {
          DEFAULT: '#2E7D32',
          50: '#E8F3E9',
          100: '#C8E2CA',
          200: '#A0CDA3',
          300: '#6FB174',
          400: '#43C04A',
          500: '#2E7D32',
          600: '#26692A',
          700: '#1E5421',
          800: '#163F18',
          900: '#0E2A10',
          glow: '#3CA142',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space)', 'var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '10xl': ['10rem', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
      },
      maxWidth: {
        container: '1320px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        glow: '0 0 60px -12px rgba(60,161,66,0.55)',
        'glow-sm': '0 0 30px -8px rgba(60,161,66,0.4)',
        panel: '0 30px 80px -20px rgba(0,0,0,0.6)',
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
