import type { Metadata } from 'next';
import Link from 'next/link';
import { GraciasActions } from '@/components/inmobiliarias/GraciasActions';
import { getCountry, isCountryCode } from '@/lib/inmobiliarias/countries';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Recibimos tus datos',
  description:
    'Revisaremos tu mensaje. También puedes agendar una llamada o escribirnos por WhatsApp ahora.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/inmobiliarias/gracias' },
};

type Props = {
  searchParams: Promise<{ pais?: string }>;
};

export default async function GraciasPage({ searchParams }: Props) {
  const { pais } = await searchParams;
  const country = getCountry(isCountryCode(pais || '') ? pais : 'do');

  return (
    <section className="theme-dark relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-ink-950 px-5 py-28 text-fg">
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div className="relative z-[1] mx-auto max-w-xl text-center">
        <p className="mono-label text-accent">Mensaje recibido</p>
        <h1 className="mt-5 text-4xl sm:text-5xl">Recibimos tus datos.</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Si prefieres, agenda una llamada o escríbenos por WhatsApp ahora
          mismo.
        </p>
        <p className="mt-3 text-sm text-faint">
          Mercado: {country.name} · Respondemos en menos de 1 día hábil.
        </p>

        <GraciasActions countryCode={country.code} calendarUrl={site.calendarUrl} />

        <p className="mt-10 text-sm text-faint">
          <Link href={country.path} className="text-accent hover:underline">
            Volver a la landing
          </Link>
        </p>
      </div>
    </section>
  );
}
