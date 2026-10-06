// Landings verticalizadas "Sistema de crecimiento con garantía" → /crecimiento/[slug]
//
// Una sola landing maestra (GrowthLanding.tsx) + un objeto por industria.
// Para sumar una vertical: agregue un objeto a `verticals`. No hay que tocar el diseño.
// Para probar otra variante de copy (A/B): cambie los textos aquí o use `hero.headline` en la vertical.
//
// No va en estas páginas: US$120, planes Start/Growth/Performance, precios ni calculadora.

export type HeadlineLine = { text: string; strong?: boolean };

/** Video de fondo del hero: mp4 liviano, sin audio, con su primer cuadro como póster. */
export type HeroVideo = { src: string; poster: string };

/** Foto del hero: tiene que leerse a primera vista como la industria de la landing. */
export type HeroImage = {
  src: string;
  alt: string;
  /** Punto de enfoque para el recorte vertical de escritorio (CSS object-position). */
  position?: string;
};

export type ChatMessage = {
  /** `note` es una línea de contexto ("El prospecto deja de responder"), no un mensaje. */
  from: 'prospect' | 'alex' | 'followup' | 'note';
  text: string;
};

export type GrowthVideo = {
  src: string;
  poster: string;
  title: string;
  description: string;
  /** Archivo .vtt de subtítulos. */
  captions?: string;
  /** true = video vertical 9:16 (formato reel). */
  portrait?: boolean;
};

export type GrowthCase = {
  industry: string;
  client: string;
  problem: string;
  work: string;
  result: string;
};

export type GrowthVertical = {
  /** URL: /crecimiento/<slug> */
  slug: string;
  industryName: string;
  industryShortName: string;
  /** Tag de GoHighLevel. Viaja en el mensaje precargado de WhatsApp. */
  campaignId: string;
  meta: { title: string; description: string };
  /** El hero muestra `industryName` como etiqueta grande: no lleva otro texto encima del titular. */
  hero: {
    image: HeroImage;
    /** Opcional: reemplaza el titular base (variantes A/B). */
    headline?: HeadlineLine[];
    subheadline?: string;
    /** Opcional: video de fondo propio de la industria. Sin él se usa `base.hero.video`. */
    video?: HeroVideo;
  };
  pain: { examples: string[]; highlight: string };
  /** Video de la industria que se muestra en el segundo bloque de la página. */
  video: GrowthVideo;
  conversation: { messages: ChatMessage[]; outcome: string[]; note?: string };
  useCases: string[];
  /** Ejemplo de alerta que recibe el equipo (momento humano). */
  alert: string;
  faqs: { q: string; a: string }[];
  cases: GrowthCase[];
  whatsappMessage: string;
};

// ─────────────────────────────────────────────────────────────
// Copy compartido por todas las verticales
// ─────────────────────────────────────────────────────────────
export const base = {
  nav: [
    { label: 'Cómo funciona', href: '#como-funciona' },
    { label: 'Garantía', href: '#garantia' },
    { label: 'Casos', href: '#casos' },
    { label: 'Preguntas', href: '#preguntas' },
  ],
  cta: {
    primary: 'Ver si mi negocio califica',
    qualify: 'Quiero saber si mi negocio califica',
    final: 'Evaluar mi negocio',
    sticky: 'Ver si califico',
  },
  hero: {
    headline: [
      { text: 'Aumentamos sus ventas' },
      { text: 'hasta un 20%.', strong: true },
      { text: 'Garantizado por escrito.*' },
    ] as HeadlineLine[],
    subheadline:
      'Diseñamos y operamos un sistema que combina publicidad, automatización, inteligencia artificial y seguimiento para convertir en ventas a más de los prospectos de su negocio.',
    exclusivity: 'No todos los negocios califican.',
    microcopy: 'Alex le hará solamente 3 preguntas.',
    legal:
      '*La garantía, porcentaje y condiciones aplicables se determinan después de analizar cada negocio.',
    // El mismo fondo de la landing de Agentes IA. Cada vertical puede reemplazarlo con `hero.video`.
    video: {
      src: '/assets/videos/services/automatizacion.mp4',
      poster: '/assets/videos/agent-ia/hero-automation-poster.webp',
    } as HeroVideo,
  },
  pain: {
    eyebrow: 'El problema no siempre es conseguir más prospectos',
    title: ['Muchos negocios ya tienen oportunidades.', 'El problema es cuántas se pierden.'],
    lead: 'Personas preguntan, cotizan, comparan, dejan de responder o simplemente quedan olvidadas después de la primera conversación.',
    cards: [
      {
        title: 'Respuesta tardía',
        text: 'El prospecto pregunta cuando tiene interés. Si la respuesta tarda demasiado, sigue buscando.',
      },
      {
        title: 'Poco seguimiento',
        text: 'Una conversación termina y nadie vuelve a contactar al prospecto.',
      },
      {
        title: 'Falta de calificación',
        text: 'El equipo dedica tiempo a conversaciones que todavía no están listas para avanzar.',
      },
      {
        title: 'Oportunidades olvidadas',
        text: 'Prospectos que estuvieron cerca de comprar quedan perdidos entre mensajes, vendedores o conversaciones anteriores.',
      },
    ],
    examplesLabel: '¿Le suena conocido?',
  },
  idea: {
    eyebrow: 'Una idea importante',
    title: 'No necesitamos convertir a todos.',
    lead: 'Necesitamos mejorar lo suficiente lo que ya está pasando dentro de su proceso comercial.',
    rows: ['Prospectos', 'Ventas actuales', 'Una parte importante no compra'],
    recovered: 'Una fracción adicional recuperada',
    conclusion:
      'Si logramos recuperar solamente una fracción adicional de esas oportunidades, el impacto económico puede ser significativo.',
    note: 'Ilustración conceptual. No representa una proyección de resultados.',
  },
  system: {
    eyebrow: 'El sistema',
    title: 'Del primer mensaje a la oportunidad de venta.',
    lead: 'Conectamos publicidad, atención, inteligencia artificial, seguimiento y su equipo comercial dentro de un mismo proceso.',
    steps: [
      { title: 'Atraer', text: 'Publicidad y canales digitales generan oportunidades.' },
      { title: 'Responder', text: 'Cada prospecto recibe atención rápidamente.' },
      {
        title: 'Calificar',
        text: 'El sistema identifica qué necesita y qué tan preparado está para avanzar.',
      },
      {
        title: 'Dar seguimiento',
        text: 'La conversación continúa cuando el prospecto todavía no está listo.',
      },
      { title: 'Agendar / cotizar', text: 'Cuando corresponde, se genera el siguiente paso.' },
      {
        title: 'Intervención humana',
        text: 'El equipo comercial entra cuando realmente importa.',
      },
      { title: 'Venta', text: 'El humano continúa el cierre.' },
    ],
    principle: 'La tecnología mejora el proceso. El humano continúa haciendo la venta.',
    secondary: 'Leer la garantía',
  },
  video: {
    eyebrow: 'Véalo funcionando',
    title: 'Así podría funcionar en su negocio.',
    lead: 'Un ejemplo sencillo de cómo el sistema responde, califica y ayuda a mantener activa una oportunidad.',
  },
  conversation: {
    eyebrow: 'Una conversación realista',
    title: 'Así se ve el sistema desde el punto de vista del prospecto.',
    disclaimer: 'Conversación ilustrativa. Cada sistema se configura para su negocio.',
  },
  features: {
    eyebrow: 'Qué hace el sistema',
    title: ['Su equipo se enfoca en vender.', 'El sistema ayuda a que menos oportunidades se pierdan.'],
    cards: [
      { title: 'Respuesta', text: 'Atiende consultas rápidamente.' },
      { title: 'Calificación', text: 'Hace preguntas para entender al prospecto.' },
      { title: 'Seguimiento', text: 'Retoma oportunidades que aún pueden avanzar.' },
      {
        title: 'Organización',
        text: 'Mantiene las conversaciones dentro de un proceso comercial.',
      },
      { title: 'Reactivación', text: 'Permite volver a trabajar oportunidades anteriores.' },
      { title: 'Agenda', text: 'Ayuda a coordinar citas, reuniones o llamadas.' },
      {
        title: 'Alerta al equipo',
        text: 'Cuando detecta intención de compra, avisa a una persona.',
      },
    ],
    useCasesLabel: 'Dónde se aplica',
  },
  human: {
    eyebrow: 'La tecnología no reemplaza el cierre',
    title: 'Cuando el prospecto está listo, entra su equipo.',
    lead: 'El sistema puede responder, calificar y dar seguimiento. Cuando detecta intención de compra, solicitud de llamada o una oportunidad importante, el equipo recibe una alerta para continuar la conversación.',
    chain: ['IA / automatización', 'Identifica la oportunidad', 'Alerta', 'Humano', 'Cierre'],
    alertLabel: 'Alerta para su equipo',
    alertTitle: 'Oportunidad lista para atención',
  },
  ai: {
    eyebrow: 'La tecnología detrás',
    title: 'Todo el mundo habla de inteligencia artificial por una razón.',
    lead: 'No es solamente una tendencia. Está cambiando la forma en que las empresas responden, organizan y dan seguimiento a sus prospectos.',
    stance:
      'En Cluster no instalamos inteligencia artificial solo por utilizar tecnología. La utilizamos cuando puede mejorar una parte concreta del proceso comercial.',
    contrast: [
      {
        label: 'IA como producto de moda',
        text: 'Se instala porque todos hablan de ella, sin tener claro qué parte del negocio debe mejorar.',
      },
      {
        label: 'IA como herramienta',
        text: 'Se aplica en un punto concreto del proceso: responder, calificar, dar seguimiento u organizar.',
      },
    ],
  },
  growth: {
    eyebrow: 'Por qué puede generar crecimiento',
    title: 'Vender más no siempre significa conseguir el doble de leads.',
    blocks: [
      {
        title: 'velocidad',
        text: 'El prospecto recibe respuesta cuando todavía tiene intención.',
      },
      {
        title: 'seguimiento',
        text: 'Las conversaciones no terminan después del primer intercambio.',
      },
      {
        title: 'control',
        text: 'El negocio puede entender qué ocurre con sus oportunidades.',
      },
      {
        title: 'recuperación',
        text: 'Prospectos anteriores pueden volver a entrar en conversación cuando corresponde.',
      },
    ],
  },
  guarantee: {
    eyebrow: 'Nuestro compromiso',
    title: ['Hasta 20% de aumento en ventas.', 'Respaldado por escrito.*'],
    lead: 'Cuando un negocio cumple las condiciones necesarias, podemos establecer un objetivo de crecimiento y respaldarlo mediante una garantía contractual.',
    note: '*El porcentaje garantizado, período de medición, condiciones y alcance se definen individualmente después del análisis del negocio.',
    reasonsTitle: '¿Por qué podemos ofrecer una garantía?',
    reasons: [
      {
        title: 'Analizamos antes de aceptar',
        text: 'No garantizamos resultados a cualquier negocio.',
      },
      {
        title: 'Trabajamos sobre todo el proceso',
        text: 'No dependemos únicamente de un anuncio o una herramienta. Analizamos captación, atención, seguimiento y conversión.',
      },
      {
        title: 'Nuestro incentivo está alineado',
        text: 'La garantía nos obliga a seleccionar cuidadosamente los negocios con los que asumimos ese compromiso.',
      },
    ],
  },
  qualify: {
    eyebrow: 'Primero tenemos que conocer su negocio',
    title: 'No todos los negocios califican.',
    lead: 'Para asumir una garantía responsablemente necesitamos comprobar que existe una oportunidad real de mejora y que su empresa tiene capacidad para aprovecharla.',
    criteriaLabel: 'Criterios generales',
    criteria: [
      'Negocio activo',
      'Producto o servicio con valor suficiente',
      'Capacidad para atender nuevos clientes',
      'Volumen razonable de oportunidades',
      'Proceso que pueda medirse',
      'Disposición para utilizar el sistema acordado',
    ],
    microcopy: 'Son solamente 3 preguntas iniciales.',
  },
  trust: {
    eyebrow: 'Quiénes están detrás del sistema',
    title: 'Tecnología, publicidad y experiencia comercial bajo un mismo equipo.',
    lead: 'Cluster Media es una empresa de servicios digitales con operación internacional y experiencia en publicidad, desarrollo, automatización, contenido e inteligencia artificial.',
    points: [
      'Empresa registrada en Estados Unidos',
      'Equipo especializado',
      'Clientes en diferentes mercados',
      'Experiencia en Meta Ads y Google',
      'Desarrollo de sistemas',
      'Automatización',
      'Producción de contenido',
    ],
  },
  cases: {
    eyebrow: 'Experiencia previa de Cluster',
    title: 'Lo que ya hemos hecho para otros negocios.',
    labels: { problem: 'Problema', work: 'Qué hicimos', result: 'Resultado' },
    note: 'Proyectos anteriores de Cluster Media. No corresponden a la oferta con garantía.',
  },
  faq: {
    eyebrow: 'Preguntas frecuentes',
    title: ['Antes de', 'escribirnos.'],
    items: [
      {
        q: '¿Todas las empresas reciben una garantía del 20%?',
        a: 'No. Primero analizamos el negocio. El porcentaje y las condiciones se determinan según cada caso.',
      },
      {
        q: '¿Qué significa “hasta 20%”?',
        a: 'Es el máximo de crecimiento que puede formar parte de la oferta. La garantía concreta depende de los números y condiciones de cada negocio.',
      },
      {
        q: '¿Necesito saber de inteligencia artificial?',
        a: 'No. Nosotros configuramos e implementamos el sistema.',
      },
      {
        q: '¿La IA reemplaza a mi equipo?',
        a: 'No necesariamente. El sistema está diseñado para automatizar tareas repetitivas y ayudar a que su equipo intervenga en los momentos de mayor valor.',
      },
      {
        q: '¿Necesito hacer publicidad?',
        a: 'Depende del negocio. Algunas empresas necesitan generar más prospectos y otras necesitan convertir mejor los que ya reciben.',
      },
      {
        q: '¿Qué pasa si no califico para la garantía?',
        a: 'Podemos recomendar una solución diferente que se adapte mejor al momento actual de su empresa.',
      },
      {
        q: '¿Cuánto cuesta?',
        a: 'Depende del nivel de implementación y del sistema que necesite su negocio. Primero analizamos el caso y después recomendamos la solución adecuada.',
      },
    ],
  },
  final: {
    eyebrow: 'El siguiente paso',
    title: 'Descubra si su negocio puede calificar.',
    lead: 'Alex le hará tres preguntas rápidas para entender mejor su negocio y determinar cuál debería ser el siguiente paso.',
    microcopy: 'Sin compromiso.',
    next: ['Se abre WhatsApp', 'Alex le hace 3 preguntas', 'Definimos el siguiente paso'],
  },
  footer: {
    tagline: 'Sistema de crecimiento con garantía para negocios que califiquen.',
  },
};

// ─────────────────────────────────────────────────────────────
// Casos: experiencia previa real de Cluster (no son casos de la garantía)
// ─────────────────────────────────────────────────────────────
const carDepot: GrowthCase = {
  industry: 'Automotriz · Estados Unidos',
  client: 'Car Depot',
  problem: 'Necesitaba un flujo constante de prospectos para la venta de vehículos.',
  work: 'Campañas publicitarias, redes sociales y seguimiento comercial.',
  result: 'Alrededor de 20 prospectos diarios después de dos meses de trabajo.',
};

const inkExpress: GrowthCase = {
  industry: 'Retail',
  client: 'Ink Express',
  problem:
    'Un alto volumen de mensajes dificultaba atender bien y ordenar las oportunidades comerciales.',
  work: 'Automatización de WhatsApp, CRM y seguimiento.',
  result: 'Consultas y oportunidades organizadas dentro de un mismo proceso.',
};

const ojine: GrowthCase = {
  industry: 'Salud',
  client: 'Clínicas Médicas Ojíne',
  problem: 'Necesitaba comunicar mejor sus servicios y conectar con pacientes potenciales.',
  work: 'Redes sociales, contenido, diseño y estrategia.',
  result: 'Presencia digital más sólida y una comunicación más clara de sus servicios.',
};

// ─────────────────────────────────────────────────────────────
// Verticales
// Fotos del hero en /public/assets/stock/crecimiento (Unsplash, licencia libre):
//   clinicas-esteticas → Look Studio · inmobiliarias → Tobias Wilden · construccion → Wasif Ali
//   clinicas-odontologicas es un cuadro del video dental propio.
// ─────────────────────────────────────────────────────────────
export const verticals: GrowthVertical[] = [
  {
    slug: 'clinicas-esteticas',
    industryName: 'Clínicas estéticas',
    industryShortName: 'Clínica estética',
    campaignId: 'campaign-garantia-clinica-estetica',
    meta: {
      title: 'Sistema de crecimiento para clínicas estéticas | Cluster Media',
      description:
        'Un sistema que combina publicidad, automatización, IA y seguimiento para convertir en pacientes a más de los prospectos de su clínica estética. Con garantía para negocios que califiquen.',
    },
    hero: {
      image: {
        src: '/assets/stock/crecimiento/clinicas-esteticas.jpg',
        alt: 'Tratamiento facial en una clínica estética',
        position: '75% center',
      },
    },
    pain: {
      examples: [
        'Pregunta el precio y desaparece',
        'Consulta sobre un procedimiento',
        'Compara varias clínicas',
        'Pregunta disponibilidad',
        'Nunca agenda',
        'El equipo no vuelve a escribirle',
      ],
      highlight:
        'En una clínica estética, unas pocas oportunidades recuperadas pueden representar miles de dólares.',
    },
    video: {
      src: '/assets/videos/agent-ia/clinicas-esteticas.mp4',
      poster: '/assets/videos/agent-ia/clinicas-esteticas.webp',
      title: 'Atención para clínicas estéticas',
      description: 'Ejemplo de atención inicial para consultas sobre tratamientos y valoraciones.',
      portrait: true,
    },
    conversation: {
      messages: [
        { from: 'prospect', text: 'Hola, quisiera saber cuánto cuesta el tratamiento de Botox.' },
        {
          from: 'alex',
          text: 'Claro. ¿Es su primera vez realizándose este tratamiento o ya lo ha hecho anteriormente?',
        },
        { from: 'prospect', text: 'Ya me lo he hecho.' },
        {
          from: 'alex',
          text: 'Perfecto. Podemos ayudarle a revisar disponibilidad. ¿Qué día de esta semana le funciona mejor?',
        },
        { from: 'note', text: 'El prospecto deja de responder' },
        {
          from: 'followup',
          text: 'Hola, quedó pendiente su consulta sobre Botox. Si todavía desea agendar, puedo ayudarle a revisar los horarios disponibles.',
        },
      ],
      outcome: ['Respondió', 'Calificó', 'Dio seguimiento', 'Llevó a cita'],
    },
    useCases: [
      'Consultas de precio de tratamientos',
      'Valoraciones por agendar',
      'Personas que compararon y no volvieron',
      'Pacientes anteriores por reactivar',
    ],
    alert: 'Paciente quiere agendar su tratamiento de Botox esta semana y solicita una llamada.',
    faqs: [
      {
        q: '¿Sirve si la mayoría solo pregunta el precio y desaparece?',
        a: 'Es uno de los casos que el sistema trabaja: responde rápido, hace preguntas para entender qué busca la persona y retoma la conversación si deja de responder. El cierre lo sigue haciendo su equipo.',
      },
    ],
    cases: [ojine, inkExpress, carDepot],
    whatsappMessage: 'Hola, quiero saber si mi clínica estética califica.',
  },
  {
    slug: 'clinicas-odontologicas',
    industryName: 'Clínicas odontológicas',
    industryShortName: 'Clínica odontológica',
    campaignId: 'campaign-garantia-clinica-dental',
    meta: {
      title: 'Sistema de crecimiento para clínicas odontológicas | Cluster Media',
      description:
        'Un sistema que combina publicidad, automatización, IA y seguimiento para que más prospectos de su clínica odontológica lleguen a valoración. Con garantía para negocios que califiquen.',
    },
    hero: {
      image: {
        src: '/assets/stock/crecimiento/clinicas-odontologicas.jpg',
        alt: 'Odontóloga atendiendo a una paciente en su consultorio',
        position: '60% center',
      },
      video: {
        src: '/assets/videos/crecimiento/clinicas-odontologicas.mp4',
        poster: '/assets/videos/crecimiento/clinicas-odontologicas.webp',
      },
    },
    pain: {
      examples: [
        'Pregunta por implantes',
        'Consulta por ortodoncia',
        'Pregunta por carillas',
        'Pide información de un tratamiento',
        'Solicita cotización',
        'Pide cita',
        'Nunca confirma',
      ],
      highlight:
        'Un paciente que no termina agendando puede representar cientos o miles de dólares en tratamientos perdidos.',
    },
    video: {
      src: '/assets/videos/agent-ia/clinicas-odontologicas.mp4',
      poster: '/assets/videos/agent-ia/clinicas-odontologicas.webp',
      title: 'Atención para clínicas odontológicas',
      description: 'Ejemplo de atención a consultas sobre tratamientos y citas odontológicas.',
      portrait: true,
    },
    conversation: {
      messages: [
        { from: 'prospect', text: 'Hola, ¿cuánto cuesta un implante dental?' },
        {
          from: 'alex',
          text: 'Con gusto le ayudo. ¿Ya tiene una valoración previa o sería su primera consulta?',
        },
        { from: 'prospect', text: 'Sería la primera.' },
        {
          from: 'alex',
          text: 'Perfecto. Podemos revisar disponibilidad para su valoración. ¿Qué día de esta semana le funciona mejor?',
        },
        { from: 'note', text: 'El prospecto deja de responder' },
        {
          from: 'followup',
          text: 'Hola, quedó pendiente su consulta sobre implantes. Si todavía desea agendar su valoración, puedo ayudarle a revisar los horarios disponibles.',
        },
      ],
      outcome: ['Respondió', 'Calificó', 'Dio seguimiento', 'Llevó a valoración'],
    },
    useCases: [
      'Cotizaciones de implantes y ortodoncia',
      'Valoraciones sin confirmar',
      'Tratamientos que quedaron por decidir',
      'Pacientes anteriores por reactivar',
    ],
    alert: 'Paciente pide su valoración para implantes y solicita que lo llamen.',
    faqs: [
      {
        q: '¿El sistema puede dar precios de tratamientos?',
        a: 'Comparte la información que su clínica decida. Cuando el costo depende de cada caso, orienta al paciente hacia una valoración con el profesional.',
      },
    ],
    cases: [ojine, inkExpress, carDepot],
    whatsappMessage: 'Hola, quiero saber si mi clínica odontológica califica.',
  },
  {
    slug: 'clinicas-medicas',
    industryName: 'Clínicas médicas',
    industryShortName: 'Clínica médica',
    campaignId: 'campaign-garantia-clinica-medica',
    meta: {
      title: 'Sistema de crecimiento para clínicas médicas | Cluster Media',
      description:
        'Un sistema que combina publicidad, automatización, IA y seguimiento para que más personas que consultan a su clínica médica terminen agendando. Con garantía para negocios que califiquen.',
    },
    hero: {
      image: {
        src: '/assets/stock/crecimiento/clinicas-medicas.jpg',
        alt: 'Médica conversa con una paciente en un consultorio luminoso',
        position: '54% center',
      },
    },
    pain: {
      examples: [
        'Pregunta por una consulta',
        'Consulta por un especialista',
        'Pregunta horarios y sede',
        'Pregunta el costo de la consulta',
        'Pide cita',
        'Nunca confirma',
      ],
      highlight:
        'Cada persona que pregunta y no llega a agendar es una consulta que su clínica deja de atender.',
    },
    video: {
      src: '/assets/videos/agent-ia/medicos.mp4',
      poster: '/assets/videos/agent-ia/medicos.webp',
      title: 'Atención para clínicas médicas',
      description: 'Ejemplo de atención a consultas de servicios, horarios y citas médicas.',
      portrait: true,
    },
    conversation: {
      messages: [
        { from: 'prospect', text: 'Hola, quisiera una cita con un especialista.' },
        { from: 'alex', text: 'Claro. ¿Qué especialidad o servicio necesita?' },
        { from: 'prospect', text: 'Cardiología.' },
        {
          from: 'alex',
          text: 'Perfecto. ¿Sería su primera consulta con nosotros? Así le ayudo a revisar los horarios disponibles.',
        },
        { from: 'note', text: 'El prospecto deja de responder' },
        {
          from: 'followup',
          text: 'Hola, quedó pendiente su cita de cardiología. Si todavía desea agendar, puedo ayudarle a revisar los horarios disponibles.',
        },
      ],
      outcome: ['Respondió', 'Orientó', 'Dio seguimiento', 'Llevó a cita'],
      note: 'El sistema atiende consultas administrativas. Las preguntas clínicas pasan al personal de salud.',
    },
    useCases: [
      'Solicitudes de cita',
      'Consultas sobre servicios, horarios y sedes',
      'Citas sin confirmar',
      'Personas que preguntaron y no agendaron',
    ],
    alert: 'Paciente solicita cita de cardiología y pide que lo contacten.',
    faqs: [
      {
        q: '¿El sistema da información médica?',
        a: 'No. Atiende consultas administrativas: servicios, horarios, disponibilidad y citas. Las preguntas clínicas se derivan al personal de salud.',
      },
    ],
    cases: [ojine, inkExpress, carDepot],
    whatsappMessage: 'Hola, quiero saber si mi clínica médica califica.',
  },
  {
    slug: 'inmobiliarias',
    industryName: 'Inmobiliarias',
    industryShortName: 'Inmobiliaria',
    campaignId: 'campaign-garantia-inmobiliaria',
    meta: {
      title: 'Sistema de crecimiento para inmobiliarias | Cluster Media',
      description:
        'Un sistema que combina publicidad, automatización, IA y seguimiento para que más interesados en sus propiedades lleguen a hablar con un asesor. Con garantía para negocios que califiquen.',
    },
    hero: {
      image: {
        src: '/assets/stock/crecimiento/inmobiliarias.jpg',
        alt: 'Edificio de apartamentos con balcones al atardecer',
        position: '85% center',
      },
    },
    pain: {
      examples: [
        'Pregunta por una propiedad',
        'Solicita precio',
        'Pregunta ubicación',
        'Solicita financiamiento',
        'Desaparece',
        'El asesor no vuelve a contactar',
      ],
      highlight:
        'En bienes raíces, una sola oportunidad perdida puede representar miles de dólares en comisión.',
    },
    video: {
      src: '/assets/videos/agent-ia/inmobiliarias.mp4',
      poster: '/assets/videos/agent-ia/inmobiliarias.webp',
      title: 'Atención para inmobiliarias',
      description: 'Ejemplo de seguimiento a personas interesadas en comprar o alquilar una propiedad.',
      portrait: true,
    },
    conversation: {
      messages: [
        { from: 'prospect', text: 'Hola. ¿Todavía está disponible el apartamento que vi?' },
        { from: 'alex', text: 'Sí. ¿Está buscando comprar o alquilar?' },
        { from: 'prospect', text: 'Comprar.' },
        {
          from: 'alex',
          text: 'Perfecto. ¿En qué zona está buscando y aproximadamente qué presupuesto maneja?',
        },
        { from: 'note', text: 'Después de sus respuestas' },
        {
          from: 'alex',
          text: 'Podemos coordinar una llamada con uno de nuestros asesores para mostrarle las opciones más adecuadas.',
        },
      ],
      outcome: ['Respondió', 'Calificó', 'Organizó', 'Pasó al asesor'],
    },
    useCases: [
      'Consultas por una propiedad',
      'Solicitudes de precio y ubicación',
      'Interesados en financiamiento',
      'Prospectos que nadie retomó',
    ],
    alert: 'Busca comprar apartamento. Ya indicó zona y presupuesto y solicita una llamada.',
    faqs: [
      {
        q: '¿Cómo trabaja el sistema con mis asesores?',
        a: 'Durante el análisis revisamos cómo trabaja su equipo y definimos cómo se organizan las consultas y en qué momento pasa cada oportunidad a un asesor. La venta la sigue haciendo el asesor.',
      },
    ],
    cases: [carDepot, inkExpress],
    whatsappMessage: 'Hola, quiero saber si mi inmobiliaria califica.',
  },
  {
    slug: 'construccion',
    industryName: 'Empresas de construcción',
    industryShortName: 'Construcción',
    campaignId: 'campaign-garantia-construccion',
    meta: {
      title: 'Sistema de crecimiento para empresas de construcción | Cluster Media',
      description:
        'Un sistema que combina publicidad, automatización, IA y seguimiento para que menos solicitudes de cotización queden sin retomar. Con garantía para negocios que califiquen.',
    },
    hero: {
      image: {
        src: '/assets/stock/crecimiento/construccion.jpg',
        alt: 'Trabajadores con casco y chaleco en una obra en construcción',
        position: '85% center',
      },
    },
    pain: {
      examples: [
        'Solicita cotización',
        'Envía fotografías',
        'Pregunta precio',
        'Pide visita',
        'La conversación queda detenida',
        'Nadie retoma el proyecto',
      ],
      highlight: 'Una conversación olvidada puede significar perder un proyecto completo.',
    },
    video: {
      src: '/assets/videos/agent-ia/constructora-drone.mp4',
      poster: '/assets/videos/agent-ia/constructora-drone.webp',
      title: 'Una obra vista desde el dron',
      description: 'Toma aérea de una construcción urbana en desarrollo.',
    },
    conversation: {
      messages: [
        { from: 'prospect', text: 'Hola, necesito cotizar una remodelación.' },
        { from: 'alex', text: 'Claro. ¿La remodelación sería residencial o comercial?' },
        { from: 'prospect', text: 'Residencial.' },
        { from: 'alex', text: '¿En qué ciudad está ubicado el proyecto?' },
        { from: 'prospect', text: 'Aquí en la ciudad.' },
        {
          from: 'alex',
          text: '¿Le gustaría coordinar una llamada o visita para revisar el alcance?',
        },
      ],
      outcome: ['Consulta', 'Contexto', 'Calificación', 'Visita / cotización'],
    },
    useCases: [
      'Solicitudes de cotización',
      'Proyectos con fotos o planos enviados',
      'Visitas por coordinar',
      'Proyectos que quedaron detenidos',
    ],
    alert: 'Remodelación residencial. Envió los detalles del proyecto y pide una visita.',
    faqs: [
      {
        q: '¿Sirve si mis proyectos requieren una visita antes de cotizar?',
        a: 'Sí. El sistema reúne el contexto inicial del proyecto y ayuda a coordinar la llamada o la visita. La cotización la sigue haciendo su equipo.',
      },
    ],
    cases: [carDepot, inkExpress],
    whatsappMessage: 'Hola, quiero saber si mi empresa de construcción califica.',
  },
];
