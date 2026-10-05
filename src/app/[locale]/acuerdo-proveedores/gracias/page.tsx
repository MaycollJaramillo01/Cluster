import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Gracias | Acuerdo de proveedores',
  description: 'Confirmación de respuesta al acuerdo de proveedores de Cluster Media.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function SupplierAgreementThanksPage() {
  return (
    <div className="theme-dark flex min-h-[100dvh] flex-col bg-ink-900 text-paper">
      <div className="border-b border-paper/10">
        <div className="container-x flex min-h-24 items-center py-6">
          <div className="flex items-center gap-3" aria-label="Cluster Media">
            <Image
              src="/assets/logo-white.webp"
              alt=""
              width={400}
              height={222}
              priority
              className="h-11 w-auto"
            />
            <div className="flex flex-col leading-none">
              <span className="font-brand text-sm font-extrabold uppercase tracking-[0.18em]">
                Cluster
              </span>
              <span className="mt-1 font-brand text-[11px] font-light uppercase tracking-[0.35em] text-paper/50">
                Media
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-x flex flex-1 flex-col justify-center py-16 sm:py-24">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Respuesta confirmada
        </p>
        <h1 className="mt-6 text-[clamp(5rem,22vw,15rem)] font-normal leading-[0.85] text-paper">
          Gracias
        </h1>
        <div className="mt-10 h-1 w-20 bg-accent" aria-hidden="true" />
        <p className="mt-10 max-w-xl text-lg leading-relaxed text-paper/70 sm:text-xl">
          Tu respuesta al acuerdo de buenas prácticas para proveedores quedó confirmada. Te
          enviamos por correo una copia del acuerdo y de tu respuesta; el equipo de Cluster Media
          también la recibió.
        </p>
        <p className="mt-8 font-mono text-xs font-medium uppercase tracking-[0.12em] text-paper/45">
          Ya puedes cerrar esta página
        </p>
      </div>
    </div>
  );
}
