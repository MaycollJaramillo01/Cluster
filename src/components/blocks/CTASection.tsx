import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { site, whatsappLink } from '@/lib/site';

type CTASectionProps = {
  title?: string;
  text?: string;
  whatsappMessage?: string;
};

export function CTASection({
  title = '¿Listo para hacer crecer tu negocio?',
  text = 'Agenda una llamada y cuéntanos qué necesita tu negocio. Te ayudaremos a identificar la mejor ruta para mejorar tu presencia digital, generar clientes o automatizar tu atención comercial.',
  whatsappMessage,
}: CTASectionProps) {
  return (
    <section className="relative overflow-hidden bg-ink-950 py-24 sm:py-32">
      <div className="grain absolute inset-0" aria-hidden="true" />
      {/* Glow grande de marca */}
      <div
        className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/20 blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-grid-fade [background-size:64px_64px] opacity-30 [mask-image:radial-gradient(50%_50%_at_50%_50%,black,transparent)]"
        aria-hidden="true"
      />

      <div className="container-x relative z-[1]">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-semibold leading-[1.02] tracking-[-0.03em] text-paper sm:text-5xl lg:text-6xl">
            {title}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-paper/60">
            {text}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button href={site.calendarUrl} external size="lg" iconRight="arrow-right">
              Agendar llamada
            </Button>
            <Button
              href={whatsappLink(whatsappMessage)}
              external
              variant="whatsapp"
              size="lg"
              icon="whatsapp"
            >
              Escribir por WhatsApp
            </Button>
            <Button href="/contacto" variant="ghost" size="lg">
              Solicitar información
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
