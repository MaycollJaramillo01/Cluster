import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-ink-950 text-white">
      <div
        className="absolute inset-0 bg-grid-fade [background-size:64px_64px] opacity-30 [mask-image:radial-gradient(50%_50%_at_50%_50%,black,transparent)]"
        aria-hidden="true"
      />
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div
        className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 blur-3xl"
        aria-hidden="true"
      />
      <div className="container-x relative text-center">
        <p className="font-display text-7xl font-bold text-brand-300 sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
          Esta página no existe.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-white/65">
          Es posible que el enlace esté roto o que la página se haya movido.
          Volvamos a un lugar conocido.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/" size="lg" icon="arrow-right">
            Volver al inicio
          </Button>
          <Button href="/contacto" variant="outline-light" size="lg">
            Contactar
          </Button>
        </div>
      </div>
    </section>
  );
}
