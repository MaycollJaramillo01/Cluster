import type { IconName } from '@/components/ui/Icon';

export type WebsitePlanSlug =
  | 'website'
  | 'website-plus'
  | 'website-leads'
  | 'website-seo'
  | 'website-seo-leads';

export type WebsitePlan = {
  slug: WebsitePlanSlug;
  name: string;
  nameAccent?: string;
  kicker?: string;
  headline: string;
  tagline: string;
  price: number;
  features: string[];
  idealFor: string[];
  faqs: { q: string; a: string }[];
  note?: string;
  footer?: string;
  highlight?: boolean;
  badge?: string;
  stripeUrl: string;
  whatsapp: string;
};

export function websitePlanDisplayName(plan: WebsitePlan) {
  return plan.nameAccent ? `${plan.name} ${plan.nameAccent}` : plan.name;
}

export const websitePlans: WebsitePlan[] = [
  {
    slug: 'website',
    name: 'Website',
    kicker: 'Plan 1',
    headline: 'Presencia web profesional por una mensualidad accesible.',
    tagline: 'Presencia web profesional por una mensualidad accesible.',
    price: 99,
    features: [
      'Hasta 7 páginas',
      'Hosting + SSL',
      'Diseño responsive',
      'Formulario de contacto + WhatsApp',
      '1 ronda de cambios al mes',
    ],
    idealFor: [
      'Negocios que necesitan su primera web profesional',
      'Emprendedores que quieren presencia clara y confiable',
      'Marcas que aún no requieren dominio gestionado por nosotros',
    ],
    faqs: [
      {
        q: '¿El dominio está incluido en Website?',
        a: 'No. En este plan el dominio no está incluido. Si lo necesitas, Website Plus ya lo contempla junto con más mantenimiento.',
      },
      {
        q: '¿Cuántas páginas incluye?',
        a: 'Hasta 7 páginas. Ideal para presentar tu negocio, servicios y contacto de forma clara.',
      },
      {
        q: '¿Puedo subir después a otro plan?',
        a: 'Sí. Cuando quieras sumar dominio gestionado, SEO o leads, podemos subir tu plan sin empezar de cero.',
      },
    ],
    note: 'Dominio no incluido',
    stripeUrl: '',
    whatsapp:
      'Hola, quiero contratar el plan Website de USD 99/mes.',
  },
  {
    slug: 'website-plus',
    name: 'Website',
    nameAccent: 'Plus',
    headline: 'Tu presencia web completa, administrada y siempre activa.',
    tagline: 'Tu presencia web completa, administrada y siempre activa.',
    price: 129,
    features: [
      'Todo lo del plan Website',
      'Dominio incluido',
      'Hosting + SSL',
      'Backups periódicos',
      'Monitoreo y salud web',
    ],
    idealFor: [
      'Negocios que quieren olvidarse del hosting y el dominio',
      'Marcas que necesitan backups y monitoreo continuo',
      'Equipos que buscan una web administrada sin preocupaciones',
    ],
    faqs: [
      {
        q: '¿Qué suma Website Plus frente a Website?',
        a: 'Incluye todo lo del plan Website y agrega dominio, backups periódicos y monitoreo de salud web para operar sin fricción.',
      },
      {
        q: '¿El dominio queda a mi nombre?',
        a: 'Sí. Te acompañamos en la gestión del dominio como parte del plan mensual.',
      },
      {
        q: '¿Hay monitoreo incluido?',
        a: 'Sí. Revisamos la salud del sitio para detectar caídas o problemas básicos de forma oportuna.',
      },
    ],
    footer: 'Tu presencia digital sin preocupaciones.',
    stripeUrl: '',
    whatsapp:
      'Hola, quiero contratar el plan Website Plus de USD 129/mes.',
  },
  {
    slug: 'website-leads',
    name: 'Website',
    nameAccent: '+ Leads',
    headline: 'Tu sitio web y una estrategia enfocada en generar oportunidades.',
    tagline:
      'Tu sitio web y una estrategia enfocada en generar oportunidades de negocio.',
    price: 279,
    features: [
      'Todo lo del plan Website Plus',
      'Campaña de Google Ads',
      'Enfoque en generación de leads',
      'Optimización y seguimiento mensual',
      'Ideal para captar clientes',
    ],
    idealFor: [
      'Negocios listos para captar clientes de forma activa',
      'Marcas que ya tienen oferta clara y quieren demanda',
      'Equipos que necesitan seguimiento mensual de campañas',
    ],
    faqs: [
      {
        q: '¿La inversión publicitaria está incluida?',
        a: 'No. Incluimos la gestión y optimización de la campaña de Google Ads. El presupuesto que pagas a Google es aparte.',
      },
      {
        q: '¿Qué incluye la campaña?',
        a: 'Configuración, optimización y seguimiento mensual con enfoque en generar leads calificados hacia tu website.',
      },
      {
        q: '¿Necesito tener Website Plus antes?',
        a: 'Este plan ya incluye todo lo de Website Plus, así que partes con web administrada + generación de leads.',
      },
    ],
    note: 'Inversión publicitaria no incluida',
    footer: 'Tu presencia digital con enfoque comercial.',
    highlight: true,
    badge: 'Popular',
    stripeUrl: '',
    whatsapp:
      'Hola, quiero contratar el plan Website + Leads de USD 279/mes.',
  },
  {
    slug: 'website-seo',
    name: 'Website',
    nameAccent: '+ SEO',
    headline: 'Tu sitio web con visibilidad en Google para crecer orgánicamente.',
    tagline: 'Tu sitio web con visibilidad en Google para crecer orgánicamente.',
    price: 350,
    features: [
      'Todo lo del plan Website Plus',
      'SEO local y on-page',
      'Hasta 15 keywords prioritarias',
      'Optimización mensual + 1 artículo',
      'Perfil de Negocio de Google optimizado',
    ],
    idealFor: [
      'Negocios locales que quieren aparecer en búsquedas',
      'Marcas que priorizan tráfico orgánico sostenible',
      'Equipos que necesitan contenido SEO mensual',
    ],
    faqs: [
      {
        q: '¿Cuántas keywords trabajan?',
        a: 'Hasta 15 keywords prioritarias, alineadas a tu oferta y a búsquedas con intención comercial.',
      },
      {
        q: '¿Incluye contenido?',
        a: 'Sí. Cada mes optimizamos y entregamos 1 artículo SEO para reforzar tu posicionamiento.',
      },
      {
        q: '¿Trabajan el perfil de Google?',
        a: 'Sí. Optimizamos tu Perfil de Negocio de Google para mejorar visibilidad local.',
      },
    ],
    footer: 'Tu presencia digital con enfoque en posicionamiento.',
    stripeUrl: '',
    whatsapp:
      'Hola, quiero contratar el plan Website + SEO de USD 350/mes.',
  },
  {
    slug: 'website-seo-leads',
    name: 'Website',
    nameAccent: '+ SEO + Leads',
    headline: 'Website, posicionamiento y leads en una sola estrategia.',
    tagline:
      'Tu sitio web, tu posicionamiento y tus leads en una sola estrategia.',
    price: 499,
    features: [
      'Todo lo del plan Website Plus',
      'Campaña de Google Ads',
      'SEO mensual',
      'Hasta 15 keywords prioritarias',
      '1 artículo SEO al mes',
      'Perfil de Negocio de Google optimizado',
    ],
    idealFor: [
      'Marcas que quieren crecimiento integral (orgánico + pagado)',
      'Negocios listos para operar web, SEO y Ads juntos',
      'Equipos que buscan un solo partner para presencia y demanda',
    ],
    faqs: [
      {
        q: '¿Qué diferencia tiene frente a Website + Leads o + SEO?',
        a: 'Une ambos enfoques: mantienes la web administrada, sumas SEO mensual y también campaña de Google Ads para captar demanda.',
      },
      {
        q: '¿La pauta de Ads está incluida?',
        a: 'No. Gestionamos y optimizamos la campaña; la inversión publicitaria en Google se paga aparte.',
      },
      {
        q: '¿Es el plan más completo?',
        a: 'Sí. Es la opción más integral para desarrollo, mantenimiento, posicionamiento y generación de leads.',
      },
    ],
    note: 'Inversión publicitaria no incluida',
    footer: 'Tu presencia digital con enfoque en crecimiento integral.',
    badge: 'Más completo',
    stripeUrl: '',
    whatsapp:
      'Hola, quiero contratar el plan Website + SEO + Leads de USD 499/mes.',
  },
];

export const websitePlanSlugs: WebsitePlanSlug[] = websitePlans.map(
  (plan) => plan.slug
);

export function getWebsitePlanBySlug(slug: string): WebsitePlan | undefined {
  return websitePlans.find((plan) => plan.slug === slug);
}

export const websitePlanBenefits: {
  icon: IconName;
  title: string;
  text: string;
}[] = [
  {
    icon: 'globe',
    title: 'Desarrollo web',
    text: 'Sitios claros, modernos y pensados para convertir visitas en contactos.',
  },
  {
    icon: 'shield',
    title: 'Mantenimiento',
    text: 'Hosting, SSL, backups y monitoreo para que tu web esté siempre activa.',
  },
  {
    icon: 'search',
    title: 'SEO',
    text: 'Posicionamiento local y on-page para aparecer cuando te buscan.',
  },
  {
    icon: 'target',
    title: 'Leads',
    text: 'Campañas y seguimiento para captar clientes con enfoque comercial.',
  },
];

export const websitePlanFaqs = [
  {
    q: '¿Los planes son mensuales?',
    a: 'Sí. Todos los planes de desarrollo y mantenimiento web se facturan mensualmente. Puedes empezar por el nivel que necesitas y subir cuando quieras más alcance.',
  },
  {
    q: '¿El dominio está incluido?',
    a: 'En el plan Website el dominio no está incluido. A partir de Website Plus el dominio sí está incluido, junto con hosting, SSL y mantenimiento.',
  },
  {
    q: '¿La inversión de Google Ads está incluida?',
    a: 'No. En los planes con Leads incluimos la gestión y optimización de la campaña. El presupuesto publicitario que pagas a Google es aparte.',
  },
  {
    q: '¿Puedo cambiar de plan después?',
    a: 'Sí. Si empiezas con Website o Website Plus y luego quieres sumar SEO o generación de leads, podemos subir tu plan sin reinventar todo desde cero.',
  },
];
