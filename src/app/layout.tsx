import type { ReactNode } from 'react';
import './globals.css';

// Root layout required by Next.js. Locale-specific html/body live in [locale]/layout.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
