import { CommercialPaymentConfirmation } from '@/components/podcast/PodcastSite';
import { getPodcastCheckoutSession, checkoutFormData, isPaidPodcastSession } from '@/lib/podcast-stripe';
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CommercialThanksPage({ params, searchParams }: Props) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const sessionId = typeof query.session_id === 'string' ? query.session_id : '';
  let session = null;
  if (sessionId) {
    try {
      session = await getPodcastCheckoutSession(sessionId);
    } catch {
      session = null;
    }
  }

  const defaultPath = `${locale === 'es' ? '' : `/${locale}`}/participa/asegura-tu-participacion`;
  const returnPath = session?.metadata?.return_path || defaultPath;

  return <CommercialPaymentConfirmation
    paid={isPaidPodcastSession(session)}
    returnPath={returnPath}
    formData={checkoutFormData(session)}
  />;
}
