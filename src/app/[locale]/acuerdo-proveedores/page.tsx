import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Image from 'next/image';
import {
  SupplierAgreementConfirm,
  SupplierAgreementForm,
} from '@/components/suppliers/SupplierAgreementForm';
import { openResponse, supplierAgreement } from '@/lib/supplier-agreement';

type PageProps = {
  searchParams: Promise<{ proveedor?: string | string[]; confirmar?: string | string[] }>;
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

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SupplierAgreementPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const supplier = first(query.proveedor)?.trim().slice(0, 80) || undefined;
  // Enlace del correo de confirmación (doble opt-in): ?confirmar=<token>
  const token = first(query.confirmar);
  const pending = token ? openResponse(token) : null;
  if (token) {
    // Deja rastro de quién abre los enlaces (personas o filtros de correo) y
    // de si el enlace seguía siendo válido.
    console.info(
      '[supplier-agreement] enlace de confirmación abierto:',
      pending ? 'válido' : 'no válido',
      '|',
      (await headers()).get('user-agent'),
    );
  }

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

      {token ? (
        <div className="container-x pt-12 sm:pt-16 lg:pt-20">
          <div className="max-w-3xl">
            <SupplierAgreementConfirm
              token={token}
              response={
                pending && {
                  fullName: pending.fullName,
                  idNumber: pending.idNumber,
                  email: pending.email,
                  phone: pending.phone,
                  decision: pending.decision,
                }
              }
            />
          </div>
        </div>
      ) : null}

      <div className="container-x py-12 sm:py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.55fr)] lg:gap-20">
          <aside className="lg:sticky lg:top-10 lg:self-start">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink-900/55">
              Acuerdo para proveedores
            </p>
            <h1 className="mt-5 max-w-[13ch] text-5xl font-normal leading-[0.95] text-ink-900 sm:text-6xl">
              {supplierAgreement.title}
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-900/65">
              {supplierAgreement.intro}
            </p>
            <div className="mt-8 h-1 w-20 bg-accent" aria-hidden="true" />
          </aside>

          <div>
            <article className="space-y-11 text-[17px] leading-8 text-ink-900/75">
              {supplierAgreement.sections.map((section) => (
                <section key={section.id} aria-labelledby={section.id}>
                  <h2 id={section.id} className="text-3xl font-normal text-ink-900 sm:text-4xl">
                    {section.title}
                  </h2>
                  {section.blocks.map((block, index) => {
                    if ('list' in block) {
                      return (
                        <ul key={index} className="mt-5 space-y-3 border-l-2 border-accent pl-6">
                          {block.list.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      );
                    }

                    if ('quote' in block) {
                      return (
                        <blockquote
                          key={index}
                          className="my-6 border-l-2 border-ink-900 bg-white px-6 py-5 text-xl font-medium leading-relaxed text-ink-900"
                        >
                          {block.quote}
                        </blockquote>
                      );
                    }

                    const previous = section.blocks[index - 1];
                    const spacing =
                      !previous || 'list' in previous ? 'mt-5' : 'quote' in previous ? undefined : 'mt-4';

                    return (
                      <p key={index} className={spacing}>
                        {block.p}
                      </p>
                    );
                  })}
                </section>
              ))}
            </article>

            {pending ? null : (
              <div className="mt-14 scroll-mt-8" id="aceptacion">
                <SupplierAgreementForm
                  supplier={supplier}
                  statement={supplierAgreement.acceptance}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
