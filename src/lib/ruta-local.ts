// Datos centralizados de la landing "Ruta Local by Cluster".
// Vertical de producción audiovisual territorial. Edita aquí los números,
// paquetes y municipios y se reflejan en /ruta-local.

import type { IconName } from '@/components/ui/Icon';

// ── Mensaje base para WhatsApp / leads ───────────────────────
export const rutaLocalWhatsApp =
  'Hola, quiero información sobre Ruta Local para mi municipio.';

// ── Métricas de alcance (sección dashboard) ──────────────────
export type ReachMetric = {
  platform: string;
  value: string;
  icon: IconName;
};

export const totalReach = '20.5M+';

export const reachMetrics: ReachMetric[] = [
  { platform: 'TikTok', value: '14.3M', icon: 'bolt' },
  { platform: 'Facebook', value: '5.3M', icon: 'facebook' },
  { platform: 'YouTube', value: '840K', icon: 'youtube' },
  { platform: 'Instagram', value: '47K', icon: 'instagram' },
];

export const newFollowers = '+8,000';

// ── Municipios ejecutados ────────────────────────────────────
export type CaseMunicipio = {
  name: string;
  region: string;
  blurb: string;
  tags: string[];
  image: string;
};

export const municipios: CaseMunicipio[] = [
  {
    name: 'Santa Rosa de Copán',
    region: 'Copán · Honduras',
    blurb:
      'Recorrimos su centro histórico, su cultura cafetalera y su gastronomía con podcast, reels y tomas aéreas.',
    tags: ['Podcast', 'Dron', 'Cultura', 'Gastronomía'],
    image: '/assets/stock/creative.jpg',
  },
  {
    name: 'San Juan, Intibucá',
    region: 'Intibucá · Honduras',
    blurb:
      'Contamos la identidad lenca, sus paisajes y sus líderes locales en una serie de contenido para redes.',
    tags: ['Reels', 'Identidad', 'Paisaje', 'Líderes'],
    image: '/assets/stock/strategy2.jpg',
  },
  {
    name: 'San Marcos',
    region: 'Ocotepeque · Honduras',
    blurb:
      'Mostramos su turismo, sus tradiciones y su gente con vlogs, transmisiones en vivo y miniaturas para video.',
    tags: ['Vlog', 'En vivo', 'Turismo', 'Tradición'],
    image: '/assets/stock/collaboration.jpg',
  },
];

// ── Paquetes (tabla comparativa, Premium destacado) ──────────
export type RutaLocalPackage = {
  name: string;
  kicker: string;
  tagline: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
};

export const packages: RutaLocalPackage[] = [
  {
    name: 'Básico',
    kicker: 'Ruta Local',
    tagline: 'Una primera historia de tu municipio para encender la conversación.',
    features: [
      '1 día de producción en locación',
      '1 podcast o entrevista con un líder local',
      '3 reels verticales editados',
      '1 video resumen del municipio',
      'Publicación en las redes de Ruta Local',
    ],
  },
  {
    name: 'Plus',
    kicker: 'Ruta Local',
    tagline: 'Más cobertura y formatos para mostrar todo lo que tu territorio ofrece.',
    features: [
      '2 días de producción en locación',
      '2 podcasts o entrevistas',
      '6 reels verticales editados',
      'Tomas aéreas con dron',
      'Cobertura de gastronomía y cultura',
      '1 mini documental del municipio',
      'Difusión en redes + pauta básica',
    ],
  },
  {
    name: 'Premium',
    kicker: 'Ruta Local',
    tagline: 'La producción integral que convierte a tu municipio en un destino.',
    highlight: true,
    badge: 'Más completo',
    features: [
      '3+ días de producción integral',
      'Podcast en locación con varios invitados',
      '10+ reels verticales editados',
      'Dron y tomas cinematográficas',
      'Documental completo del municipio',
      'Turismo, gastronomía, cultura y eventos',
      'Transmisiones en vivo',
      'Campaña de difusión con pauta',
      'Reporte de alcance y resultados',
    ],
  },
];

// ── Ideal para (a quién va dirigido) ─────────────────────────
export type IdealAudience = { label: string; icon: IconName };

export const idealFor: IdealAudience[] = [
  { label: 'Alcaldías', icon: 'shield' },
  { label: 'Cámaras de turismo', icon: 'pin' },
  { label: 'Asociaciones empresariales', icon: 'users' },
  { label: 'Empresarios', icon: 'bolt' },
  { label: 'Patronatos', icon: 'users' },
  { label: 'Festivales', icon: 'sparkles' },
  { label: 'Ferias', icon: 'megaphone' },
  { label: 'Turismo local', icon: 'globe' },
];

// ── Beneficios ───────────────────────────────────────────────
export type Benefit = { title: string; text: string; icon: IconName };

export const benefits: Benefit[] = [
  {
    title: 'Fortalece la identidad',
    text: 'Cuenta quién es tu municipio y lo que lo hace único con una narrativa propia.',
    icon: 'shield',
  },
  {
    title: 'Promueve el turismo',
    text: 'Convierte tus lugares, rutas y tradiciones en destinos que la gente quiere visitar.',
    icon: 'pin',
  },
  {
    title: 'Aumenta la visibilidad',
    text: 'Lleva tu territorio a millones de personas dentro y fuera del país.',
    icon: 'chart',
  },
  {
    title: 'Posiciona a los líderes',
    text: 'Dale rostro y voz a alcaldes, emprendedores y referentes de la comunidad.',
    icon: 'users',
  },
  {
    title: 'Genera orgullo local',
    text: 'Crea contenido que la gente comparte porque se siente parte de la historia.',
    icon: 'sparkles',
  },
  {
    title: 'Impulsa la economía',
    text: 'Más visitantes y clientes para el comercio, la gastronomía y los servicios locales.',
    icon: 'bolt',
  },
  {
    title: 'Atrae inversión',
    text: 'Un territorio que se muestra bien atrae nuevos proyectos y oportunidades.',
    icon: 'target',
  },
];

// ── Opciones del formulario ──────────────────────────────────
export const promoteOptions = [
  'Turismo',
  'Gastronomía',
  'Cultura',
  'Evento',
  'Empresarios',
  'Municipio completo',
  'Otro',
];

export const packageOptions = [
  'Ruta Local Básico',
  'Ruta Local Plus',
  'Ruta Local Premium',
  'No estoy seguro',
];
