import { Icon } from '@/components/ui/Icon';
import { whatsappLink } from '@/lib/site';

// Botón flotante de WhatsApp, presente en todo el sitio.
export function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLink('Hola Cluster Media, quiero más información sobre sus servicios.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-3 border-0 bg-[#25D366] py-3.5 pl-4 pr-5 text-white shadow-lg shadow-[#25D366]/30 transition-all hover:scale-105 hover:shadow-xl"
    >
      <Icon name="whatsapp" size={24} />
      <span className="hidden text-sm font-semibold sm:inline">
        Escríbenos
      </span>
      <span className="absolute inset-0 -z-10 animate-ping bg-[#25D366] opacity-20" />
    </a>
  );
}
