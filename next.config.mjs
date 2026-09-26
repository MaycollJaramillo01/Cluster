import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep a production build from overwriting assets served by the local preview.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Old AI landing slug: keep shared links, ads and indexed URLs working.
  async redirects() {
    return [
      { source: '/automatizaciones-ia', destination: '/agentes-ia', permanent: true },
      { source: '/en/automatizaciones-ia', destination: '/en/agentes-ia', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
