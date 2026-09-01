'use client';

import { usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import { whatsappLink } from '@/lib/site';

export function FloatingWhatsApp() {
  const t = useTranslations('Common');
  const pathname = usePathname();

  if (
    pathname.startsWith('/postulaciones') ||
    pathname.startsWith('/carreras')
  ) {
    return null;
  }

  return (
    <a
      href={whatsappLink(t('whatsappServicesMessage'))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('whatsappWriteUsAria')}
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-3 border-0 bg-[#25D366] py-3.5 pl-4 pr-5 text-white shadow-lg shadow-[#25D366]/30 transition-all hover:scale-105 hover:shadow-xl"
    >
      <Icon name="whatsapp" size={24} />
      <span className="hidden text-sm font-semibold sm:inline">
        {t('whatsappWriteUs')}
      </span>
    </a>
  );
}
