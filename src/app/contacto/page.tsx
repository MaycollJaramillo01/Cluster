import type { Metadata } from 'next';
import { Section, Eyebrow } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { ContactForm } from '@/components/blocks/ContactForm';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { site, whatsappLink } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contacto | Agenda una llamada con Cluster Media',
  description:
    'Agenda una llamada con Cluster Media o escríbenos por WhatsApp para mejorar la presencia digital, campañas, branding o automatización de tu negocio.',
  alternates: { canonical: '/contacto' },
};

export default function ContactoPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          { name: 'Contacto', url: `${site.url}/contacto` },
        ])}
      />

      {/* Hero compacto */}
      <section className="relative overflow-hidden bg-ink-950 pt-36 pb-16 sm:pt-44">
        <div
          className="absolute inset-0 bg-grid-fade [background-size:64px_64px] opacity-40 [mask-image:radial-gradient(60%_60%_at_30%_0%,black,transparent)]"
          aria-hidden="true"
        />
        <div
          className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-surface blur-[120px]"
          aria-hidden="true"
        />
        <div className="container-x relative z-[1] max-w-3xl">
          <Reveal>
            <Eyebrow>Contacto · Hablemos</Eyebrow>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.02] tracking-[-0.03em] text-fg sm:text-6xl">
              Hablemos de cómo hacer crecer tu negocio.
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-6 text-lg text-muted">
              Agenda una llamada, escríbenos por WhatsApp o completa el
              formulario. Te ayudaremos a identificar la mejor ruta para tu
              negocio.
            </p>
          </Reveal>
        </div>
      </section>

      <Section tone="light">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
          {/* Columna de canales */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <Reveal className="rounded-3xl bg-surface p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-surface text-accent">
                    <Icon name="calendar" size={24} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-fg">
                      Agendar llamada
                    </h3>
                    <p className="mt-1.5 text-[15px] text-muted">
                      Elige el día y la hora que mejor te funcione para una
                      llamada de diagnóstico.
                    </p>
                    <Button
                      href={site.calendarUrl}
                      external
                      size="sm"
                      className="mt-4"
                      icon="calendar"
                    >
                      Ver calendario
                    </Button>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={80} className="rounded-3xl bg-surface p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-[#25D366]/10 text-[#25D366]">
                    <Icon name="whatsapp" size={24} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-fg">
                      WhatsApp
                    </h3>
                    <p className="mt-1.5 text-[15px] text-muted">
                      ¿Prefieres escribirnos directamente? Envíanos un mensaje.
                    </p>
                    <Button
                      href={whatsappLink('Hola Cluster Media, quiero información.')}
                      external
                      variant="whatsapp"
                      size="sm"
                      className="mt-4"
                      icon="whatsapp"
                    >
                      Escribir por WhatsApp
                    </Button>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={160} className="rounded-3xl bg-surface p-6">
                <div className="space-y-4">
                  <a
                    href={`mailto:${site.email}`}
                    className="flex items-center gap-4 text-muted transition-colors hover:text-accent"
                  >
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-surface text-accent">
                      <Icon name="mail" size={22} />
                    </span>
                    <div>
                      <div className="font-mono text-xs uppercase tracking-wider text-faint">
                        Email
                      </div>
                      <div className="font-medium">{site.email}</div>
                    </div>
                  </a>
                  <div className="flex items-center gap-4 text-muted">
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-surface text-accent">
                      <Icon name="pin" size={22} />
                    </span>
                    <div>
                      <div className="font-mono text-xs uppercase tracking-wider text-faint">
                        Ubicación
                      </div>
                      <div className="font-medium">{site.location}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Formulario */}
          <div className="lg:col-span-3">
            <Reveal delay={100}>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </Section>
    </>
  );
}
