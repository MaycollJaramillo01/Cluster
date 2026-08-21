import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/Button';

export default async function NotFound() {
  const locale = await getLocale();
  setRequestLocale(locale);
  const t = await getTranslations('NotFound');
  const tc = await getTranslations('Common');

  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-ink-950 text-white">
      <div
        className="absolute inset-0 bg-grid-fade [background-size:64px_64px] opacity-30 [mask-image:radial-gradient(50%_50%_at_50%_50%,black,transparent)]"
        aria-hidden="true"
      />
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div
        className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface blur-3xl"
        aria-hidden="true"
      />
      <div className="container-x relative text-center">
        <p className="font-display text-7xl font-bold text-accent sm:text-8xl">
          {t('code')}
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
          {t('title')}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-white/65">{t('text')}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/" size="lg" icon="arrow-right">
            {t('backHome')}
          </Button>
          <Button href="/contacto" variant="outline-light" size="lg">
            {tc('contactUs')}
          </Button>
        </div>
      </div>
    </section>
  );
}
