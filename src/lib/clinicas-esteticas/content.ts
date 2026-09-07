import type {
  LandingBenefit,
  LandingHeroContent,
  LandingProblem,
  LandingSectionCopy,
  LandingStep,
} from '@/lib/landings/types';

export const landingMeta = {
  title: 'Qué puede hacer la IA para una clínica estética | Cluster Media',
  description:
    'Sistema automatizado para organizar respuestas, citas y seguimiento comercial en clínicas de medicina estética.',
  lastUpdated: '2026-08-22',
} as const;

export const heroCopy: LandingHeroContent = {
  eyebrow: 'Clínicas de medicina estética',
  headline: '¿Qué puede hacer la IA para una clínica estética?',
  headlineHighlight: 'clínica estética',
  subheadline:
    'Un sistema automatizado organiza la respuesta y el seguimiento desde WhatsApp, Instagram, Meta y tu web hasta que el paciente reserva, asiste y avanza a tratamiento.',
  impactStat:
    'En promedio, la sistematización y automatización de los canales aumentan al menos el 18% el cierre de las ventas.',
  impactStatHighlight: 'ventas',
  calculatorLinkLabel: 'Haz el cálculo del impacto',
  sideCaption: 'Más citas y tratamientos con el mismo equipo.',
};

export const sections: LandingSectionCopy = {
  video: {
    eyebrow: 'Así se ve en acción',
    title: 'El sistema trabajando por tu clínica.',
    description:
      'Respuesta, seguimiento y orden comercial — sin depender de que alguien esté siempre disponible.',
  },
  problem: {
    eyebrow: 'El problema',
    title: 'Inviertes en publicidad, pero el seguimiento no acompaña.',
    description:
      'No es falta de interés: es falta de orden comercial después de la primera consulta.',
  },
  solution: {
    eyebrow: 'La solución',
    title: 'Que tus ventas dependan menos de personas y más de tu sistema.',
    description:
      'Sin cambiar tu software clínico. Nos enfocamos en captación, citas y seguimiento comercial.',
  },
  cases: {
    eyebrow: 'Prueba social',
    title: 'Casos de éxito',
    description:
      'Resultados reales de clientes de Cluster en salud, retail y generación de oportunidades.',
  },
  steps: {
    eyebrow: 'Cómo funciona',
    title: 'Proceso fácil y ágil',
    description: 'Cuatro fases claras. Sin tecnicismos innecesarios.',
  },
  pricing: {
    eyebrow: 'Próximo paso',
    title: 'Empezamos con un diagnóstico de dónde se pierden tus ventas.',
    description:
      'Grandes o pequeñas: primero entendemos tu proceso. Luego diseñamos el sistema a tu medida — sin publicar precios genéricos.',
  },
  contact: {
    eyebrow: 'Contacto',
    title: 'Hablemos de tu clínica.',
    description: 'WhatsApp, llamada o formulario breve. Tú eliges.',
  },
};

export const problems: readonly LandingProblem[] = [
  {
    title: 'Consultas que nadie responde a tiempo',
    text: 'Llegan fuera de horario por Instagram o WhatsApp y la respuesta llega al día siguiente. Para entonces el paciente ya contactó otra clínica.',
  },
  {
    title: 'Citas que no se confirman',
    text: 'Reservan valoración pero no asisten. Sin recordatorios ni recuperación, pierdes huecos en agenda y revenue.',
  },
  {
    title: 'Presupuestos sin seguimiento',
    text: 'El paciente recibe la propuesta y desaparece. Nadie retoma la conversación con un proceso claro.',
  },
];

export const benefits: readonly LandingBenefit[] = [
  {
    title: 'Respuesta rápida y ordenada',
    text: 'Cada consulta entra en un flujo visible: quién respondió, en qué etapa está y qué sigue.',
    highlight: 'Menos leads perdidos',
  },
  {
    title: 'Más citas confirmadas',
    text: 'Recordatorios y seguimiento antes y después de la valoración para reducir no-shows.',
    highlight: 'Agenda más llena',
  },
  {
    title: 'Menos carga en recepción',
    text: 'Automatizamos lo repetitivo. Tu equipo interviene cuando hace falta una persona.',
    highlight: 'Tiempo optimizado',
  },
];

export const howItWorks: readonly LandingStep[] = [
  {
    n: '01',
    title: 'Diagnóstico',
    text: 'Revisamos cómo entran las consultas hoy y dónde se pierden citas o tratamientos.',
  },
  {
    n: '02',
    title: 'Diseño',
    text: 'Definimos mensajes, etapas y reglas que tu equipo entiende sin manual técnico.',
  },
  {
    n: '03',
    title: 'Implementación',
    text: 'Conectamos canales, probamos escenarios reales y capacitamos a recepción.',
  },
  {
    n: '04',
    title: 'Optimización',
    text: 'Medimos consultas → citas → tratamientos y ajustamos lo que no convierte.',
  },
];

export const pricingBullets = [
  'Mapa de dónde se caen tus consultas y citas',
  'Prioridades claras según tu volumen y canales',
  'Propuesta de sistema a la medida (sin precio genérico)',
  'Siguiente paso concreto para sistematizar ventas',
] as const;

export const caseStudySlugs = [
  'clinicas-medicas-ojine',
  'ink-express',
  'car-depot',
] as const;

export const calculatorNudge =
  '¿No sabes estos datos? Esa sería la primera señal de que necesitas sistematizar tus ventas.';

export const faqs = [
  {
    q: '¿Reemplaza nuestro software clínico?',
    a: 'No. Trabajamos la capa comercial: consultas, citas y seguimiento. La historia clínica sigue en tu sistema.',
  },
  {
    q: '¿Mi equipo puede seguir respondiendo por WhatsApp?',
    a: 'Sí. Recepción o comercial pueden tomar cualquier conversación cuando lo necesiten.',
  },
  {
    q: '¿Sirve si ya invertimos en Meta o Google?',
    a: 'Sí. Está pensado para clínicas que ya captan consultas y necesitan convertirlas mejor.',
  },
  {
    q: '¿La IA responde temas médicos?',
    a: 'No sustituye criterio médico. Las preguntas clínicas se derivan al personal correspondiente.',
  },
  {
    q: '¿Cuánto tarda el diagnóstico?',
    a: 'Tras la primera conversación te confirmamos alcance y tiempos. El objetivo es claridad rápida, no un proyecto eterno.',
  },
] as const;

export const pipelineStages = [
  'Consulta',
  'Cita',
  'Asistencia',
  'Tratamiento',
] as const;
