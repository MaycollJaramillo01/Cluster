import type { Metadata } from 'next';
import Image from 'next/image';
import { SupplierAgreementForm } from '@/components/suppliers/SupplierAgreementForm';

type PageProps = {
  searchParams: Promise<{ proveedor?: string | string[] }>;
};

export const metadata: Metadata = {
  title: 'Acuerdo de buenas prácticas para proveedores',
  description: 'Acuerdo interno de buenas prácticas para proveedores de Cluster Media.',
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

function getSupplier(value?: string | string[]) {
  const supplier = Array.isArray(value) ? value[0] : value;
  return supplier?.trim().slice(0, 80) || undefined;
}

const commitments = [
  'Cumplir con los pagos en los tiempos y condiciones acordados.',
  'Comunicar claramente el alcance, horarios y requerimientos de cada producción.',
  'Procurar una buena planificación, respetando su tiempo y disponibilidad.',
  'Informar oportunamente cualquier cambio relevante.',
  'Mantener siempre un trato respetuoso y profesional.',
];

const commercialCommitments = [
  'No promocionar su empresa, marca o servicios frente al cliente.',
  'No compartir datos personales con fines comerciales.',
  'No buscar oportunidades de negocio propias o de terceros con el cliente.',
  'No utilizar la relación generada a través de Cluster para ofrecer posteriormente servicios de manera directa.',
];

export default async function SupplierAgreementPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const supplier = getSupplier(query.proveedor);

  return (
    <div className="theme-light min-h-[100dvh] bg-paper text-ink-900">
      <div className="border-b border-ink-900/10">
        <div className="container-x flex min-h-24 items-center py-6">
          <div className="flex items-center gap-3" aria-label="Cluster Media">
            <Image
              src="/assets/logo-mark.webp"
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
              <span className="mt-1 font-brand text-[11px] font-light uppercase tracking-[0.35em] text-ink-900/50">
                Media
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-x py-12 sm:py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.55fr)] lg:gap-20">
          <aside className="lg:sticky lg:top-10 lg:self-start">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink-900/55">
              Acuerdo para proveedores
            </p>
            <h1 className="mt-5 max-w-[13ch] text-5xl font-normal leading-[0.95] text-ink-900 sm:text-6xl">
              Acuerdo de buenas prácticas para proveedores externos
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-900/65">
              En Cluster Media trabajamos con proveedores externos como aliados de nuestro
              equipo. Estos lineamientos buscan establecer una relación clara, profesional y
              de confianza, protegiendo el trabajo de ambas partes y nuestra relación con los
              clientes.
            </p>
            <div className="mt-8 h-1 w-20 bg-accent" aria-hidden="true" />
          </aside>

          <div>
            <article className="space-y-11 text-[17px] leading-8 text-ink-900/75">
              <section aria-labelledby="supplier-commitment">
                <h2
                  id="supplier-commitment"
                  className="text-3xl font-normal text-ink-900 sm:text-4xl"
                >
                  Nuestro compromiso con usted
                </h2>
                <p className="mt-5">Al trabajar con Cluster, nos comprometemos a:</p>
                <ul className="mt-5 space-y-3 border-l-2 border-accent pl-6">
                  {commitments.map((commitment) => (
                    <li key={commitment}>{commitment}</li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="represents-cluster">
                <h2
                  id="represents-cluster"
                  className="text-3xl font-normal text-ink-900 sm:text-4xl"
                >
                  Cuando representa a Cluster
                </h2>
                <p className="mt-5">
                  Cuando participa en una producción, visita o proyecto de Cluster,
                  representa a nuestra marca frente al cliente. Su comportamiento,
                  comunicación y calidad de trabajo forman parte de la experiencia que
                  ofrecemos.
                </p>
                <p className="mt-4">
                  Por ello, cualquier inconformidad, problema interno o diferencia
                  relacionada con Cluster deberá conversarse directamente con nosotros y no
                  con el cliente.
                </p>
              </section>

              <section aria-labelledby="client-coordination">
                <h2
                  id="client-coordination"
                  className="text-3xl font-normal text-ink-900 sm:text-4xl"
                >
                  Coordinación con el cliente
                </h2>
                <p className="mt-5">
                  La coordinación general y comercial con el cliente corresponde a Cluster.
                </p>
                <p className="mt-4">
                  Si el cliente solicita una nueva producción, cambio de fecha, contenido
                  adicional u otro servicio, no deberá confirmarlo directamente. La respuesta
                  deberá ser:
                </p>
                <blockquote className="my-6 border-l-2 border-ink-900 bg-white px-6 py-5 text-xl font-medium leading-relaxed text-ink-900">
                  “Permítame confirmarlo con el equipo de programación y le damos respuesta.”
                </blockquote>
                <p>Esto nos permite evitar conflictos de agenda, alcance o costos.</p>
              </section>

              <section aria-labelledby="commercial-relationship">
                <h2
                  id="commercial-relationship"
                  className="text-3xl font-normal text-ink-900 sm:text-4xl"
                >
                  Relación comercial
                </h2>
                <p className="mt-5">
                  Consideramos como motivo de rompimiento de nuestra relación de negocio
                  negociar, cotizar, ofrecer o aceptar directamente servicios de un cliente
                  conocido a través de Cluster.
                </p>
                <p className="mt-4">
                  Asimismo, durante los servicios realizados para Cluster, el proveedor se
                  compromete a:
                </p>
                <ul className="mt-5 space-y-3 border-l-2 border-accent pl-6">
                  {commercialCommitments.map((commitment) => (
                    <li key={commitment}>{commitment}</li>
                  ))}
                </ul>
                <p className="mt-5">
                  Si un cliente se acerca al proveedor con una propuesta comercial directa,
                  esperamos que se comunique a Cluster.
                </p>
              </section>

              <section aria-labelledby="content-confidentiality">
                <h2
                  id="content-confidentiality"
                  className="text-3xl font-normal text-ink-900 sm:text-4xl"
                >
                  Contenido y confidencialidad
                </h2>
                <p className="mt-5">
                  El material producido para nuestros clientes (fotografías, videos, detrás
                  de cámaras u otro contenido) no deberá publicarse, utilizarse como portafolio
                  ni emplearse para promocionar al proveedor o su marca.
                </p>
                <p className="mt-4">
                  La información sobre clientes, precios, estrategias, procesos internos o
                  proyectos de Cluster deberá manejarse de manera confidencial.
                </p>
              </section>

              <section aria-labelledby="reciprocity">
                <h2
                  id="reciprocity"
                  className="text-3xl font-normal text-ink-900 sm:text-4xl"
                >
                  Reciprocidad
                </h2>
                <p className="mt-5">
                  Cluster se compromete a respetar el trabajo, tiempo y acuerdos con sus
                  proveedores. Esperamos de nuestros proveedores el mismo cuidado hacia
                  nuestra marca, nuestros clientes y nuestras relaciones comerciales.
                </p>
              </section>
            </article>

            <div className="mt-14 scroll-mt-8" id="aceptacion">
              <SupplierAgreementForm supplier={supplier} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
