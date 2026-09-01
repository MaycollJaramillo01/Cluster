export type QuizServiceId =
  | 'google-ads'
  | 'redes-sociales'
  | 'websites-seo'
  | 'branding'
  | 'automatizaciones-ia';

export type QuizAnswers = {
  pain: string;
  channel: string;
  stack: string;
  goal: string;
};

export type QuizQuestion = {
  id: keyof QuizAnswers;
  title: string;
  options: { id: string; label: string }[];
};

export type QuizServiceReco = {
  id: QuizServiceId;
  name: string;
  href: string;
  why: string;
};

export type QuizResult = {
  headline: string;
  diagnosis: string;
  help: string;
  services: QuizServiceReco[];
  waSummary: string;
};

const SERVICE: Record<
  QuizServiceId,
  { name: string; href: string }
> = {
  'google-ads': { name: 'Google Ads', href: '/google-ads' },
  'redes-sociales': { name: 'Redes y video', href: '/redes-sociales' },
  'websites-seo': { name: 'Website / SEO', href: '/websites-seo' },
  branding: { name: 'Branding', href: '/branding' },
  'automatizaciones-ia': {
    name: 'IA y seguimiento',
    href: '/automatizaciones-ia',
  },
};

export const clinicasQuizQuestions: QuizQuestion[] = [
  {
    id: 'pain',
    title: '¿Qué te frena más hoy en la clínica?',
    options: [
      { id: 'few_clients', label: 'No llegan suficientes pacientes nuevos' },
      { id: 'lose_leads', label: 'Llegan consultas, pero se pierden en el camino' },
      { id: 'look_amateur', label: 'Online no se ve a la altura de la clínica' },
      { id: 'no_content', label: 'No hay contenido ni video constante' },
      { id: 'no_clarity', label: 'No sabemos qué canal está funcionando' },
    ],
  },
  {
    id: 'channel',
    title: '¿De dónde quieres más pacientes?',
    options: [
      { id: 'google', label: 'Google (cuando ya buscan el tratamiento)' },
      { id: 'social', label: 'Instagram / Facebook' },
      { id: 'whatsapp', label: 'WhatsApp y mensajes que ya llegan' },
      { id: 'website', label: 'La web o landing de la clínica' },
      { id: 'unclear', label: 'Todavía no lo tenemos claro' },
    ],
  },
  {
    id: 'stack',
    title: '¿Qué tienen hoy, de forma real?',
    options: [
      { id: 'has_none', label: 'Casi nada armado (web, ads o redes débiles)' },
      { id: 'has_web', label: 'Web, pero no genera citas' },
      { id: 'has_ads', label: 'Ya invertimos en ads' },
      { id: 'has_social', label: 'Redes activas, poco orden comercial' },
      { id: 'has_messy', label: 'Hay de todo, pero desconectado' },
    ],
  },
  {
    id: 'goal',
    title: '¿Qué quieres ver en los próximos 90 días?',
    options: [
      { id: 'more_bookings', label: 'Más citas y tratamientos cerrados' },
      { id: 'more_content', label: 'Presencia fuerte en redes y video' },
      { id: 'look_better', label: 'Una imagen más profesional' },
      { id: 'organize_sales', label: 'Orden: saber quién respondió y qué cerró' },
    ],
  },
];

export const inmobiliariasQuizQuestions: QuizQuestion[] = [
  {
    id: 'pain',
    title: '¿Qué te frena más hoy en la inmobiliaria?',
    options: [
      { id: 'few_clients', label: 'No llegan suficientes leads nuevos' },
      { id: 'lose_leads', label: 'Llegan leads, pero se enfrían o se duplican' },
      { id: 'look_amateur', label: 'Online no se ve a la altura de las propiedades' },
      { id: 'no_content', label: 'Poco contenido o video de inmuebles' },
      { id: 'no_clarity', label: 'No sabemos qué portal o campaña rinde' },
    ],
  },
  {
    id: 'channel',
    title: '¿De dónde quieres más compradores?',
    options: [
      { id: 'google', label: 'Google (búsqueda de zonas / propiedades)' },
      { id: 'social', label: 'Instagram / Facebook' },
      { id: 'whatsapp', label: 'WhatsApp y leads que ya llegan' },
      { id: 'website', label: 'La web o el inventario online' },
      { id: 'unclear', label: 'Todavía no lo tenemos claro' },
    ],
  },
  {
    id: 'stack',
    title: '¿Qué tienen hoy, de forma real?',
    options: [
      { id: 'has_none', label: 'Casi nada armado (web, ads o redes débiles)' },
      { id: 'has_web', label: 'Web, pero no genera visitas' },
      { id: 'has_ads', label: 'Ya invertimos en ads o portales' },
      { id: 'has_social', label: 'Redes activas, poco orden comercial' },
      { id: 'has_messy', label: 'Hay de todo, pero desconectado' },
    ],
  },
  {
    id: 'goal',
    title: '¿Qué quieres ver en los próximos 90 días?',
    options: [
      { id: 'more_bookings', label: 'Más visitas y cierres' },
      { id: 'more_content', label: 'Presencia fuerte en redes y video' },
      { id: 'look_better', label: 'Una imagen más profesional' },
      { id: 'organize_sales', label: 'Orden: saber quién atendió cada lead' },
    ],
  },
];

function reco(id: QuizServiceId, why: string): QuizServiceReco {
  return { id, ...SERVICE[id], why };
}

function unique(list: QuizServiceReco[]): QuizServiceReco[] {
  const seen = new Set<QuizServiceId>();
  return list.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

/**
 * Combina pain + channel + stack + goal.
 * Orden: si el lead se pierde, primero sistema; si no hay demanda, primero captación; etc.
 */
export function resolveQuiz(
  answers: QuizAnswers,
  vertical: 'clinicas' | 'inmobiliarias',
): QuizResult {
  const { pain, channel, stack, goal } = answers;
  const noun = vertical === 'clinicas' ? 'pacientes' : 'leads';
  const close = vertical === 'clinicas' ? 'citas y tratamientos' : 'visitas y cierres';

  const ads = (why: string) => reco('google-ads', why);
  const social = (why: string) => reco('redes-sociales', why);
  const web = (why: string) => reco('websites-seo', why);
  const brand = (why: string) => reco('branding', why);
  const ia = (why: string) => reco('automatizaciones-ia', why);

  let headline = '';
  let diagnosis = '';
  let help = '';
  let services: QuizServiceReco[] = [];

  const loseDemand =
    pain === 'lose_leads' ||
    goal === 'organize_sales' ||
    channel === 'whatsapp' ||
    stack === 'has_messy';

  const needsLook =
    pain === 'look_amateur' ||
    goal === 'look_better' ||
    stack === 'has_none' ||
    stack === 'has_web';

  const needsContent = pain === 'no_content' || goal === 'more_content';
  const needsDemand =
    pain === 'few_clients' ||
    channel === 'google' ||
    channel === 'social' ||
    channel === 'unclear';

  if (loseDemand && (stack === 'has_ads' || stack === 'has_social' || stack === 'has_messy')) {
    headline = `Ya inviertes en captar ${noun}. El hueco está en el seguimiento.`;
    diagnosis =
      'Las oportunidades llegan, pero no hay un sistema claro de respuesta, asignación y cierre. Por eso sientes que “el canal no funciona”.';
    help =
      'Armamos la capa de IA y seguimiento comercial, y medimos qué anuncio o red sí termina en cierre.';
    services = [
      ia('Respuesta, recordatorios y orden de cada conversación.'),
      stack === 'has_ads' || channel === 'google'
        ? ads('Optimizamos la captación que ya pagas para que no se desperdicie.')
        : social('Ordenamos contenido y campañas para que alimenten el mismo sistema.'),
    ];
    if (channel === 'website' || stack === 'has_web') {
      services.push(web('La web deja de ser un folleto: captura y pasa al seguimiento.'));
    }
  } else if (
    pain === 'lose_leads' ||
    goal === 'organize_sales' ||
    channel === 'whatsapp'
  ) {
    headline = `Los ${noun} llegan (o podrían llegar) y se pierden sin dueño.`;
    diagnosis =
      'El cuello de botella no es solo publicidad: es respuesta, seguimiento y orden comercial.';
    help = `IA y automatización para ${close}, y un canal de captación si el volumen todavía es bajo.`;
    services = [
      ia('Cada consulta o lead tiene respuesta, etapa y siguiente paso.'),
    ];
    if (pain === 'few_clients' || channel === 'google' || stack === 'has_none') {
      services.push(ads('Para que el sistema tenga volumen de entrada.'));
    } else if (channel === 'social' || needsContent) {
      services.push(social('Contenido que alimenta el mismo inbox y seguimiento.'));
    } else {
      services.push(web('La web y los formularios entran al mismo flujo.'));
    }
  } else if (pain === 'few_clients' && channel === 'google') {
    headline = `Te faltan ${noun} que ya están buscando.`;
    diagnosis =
      'El volumen no llega porque no apareces con fuerza cuando alguien busca el servicio ahora.';
    help = `Google Ads para demanda activa + una web/landing que convierta, y seguimiento para no perder ${close}.`;
    services = [
      ads('Apareces cuando ya hay intención de compra o tratamiento.'),
      web('La visita a Google aterriza en una página que pide la cita o visita.'),
    ];
    if (goal === 'organize_sales' || stack === 'has_messy') {
      services.push(ia('Para que cada lead de Google tenga dueño y siguiente paso.'));
    }
  } else if (pain === 'few_clients' && channel === 'social') {
    headline = `Te faltan ${noun} y tu canal natural es redes.`;
    diagnosis =
      'Sin contenido constante (y video) es difícil sostener demanda. Sin seguimiento, lo que sí llega se enfría.';
    help = 'Redes y video para atraer, más sistema para convertir mensajes en agenda.';
    services = [
      social('Reels, artes y ritmo de publicación pensados para tu vertical.'),
      ia('WhatsApp e Instagram inbox con respuesta y seguimiento.'),
    ];
  } else if (pain === 'few_clients' && (channel === 'website' || stack === 'has_web')) {
    headline = 'Tienes (o quieres) web, pero no está vendiendo.';
    diagnosis =
      'El sitio no está armado para convertir ni para aparecer cuando te buscan.';
    help = 'Website/SEO para captar y convertir, más Google si ya hay búsquedas del servicio.';
    services = [
      web('Estructura, SEO y formularios pensados para generar contacto.'),
      ads('Refuerzo de demanda mientras el orgánico toma fuerza.'),
    ];
  } else if (pain === 'few_clients') {
    headline = `El problema de fondo es captación de ${noun}.`;
    diagnosis =
      'Todavía no hay un canal claro que traiga volumen. Hay que elegir de dónde van a entrar y cómo se atienden.';
    help =
      channel === 'whatsapp'
        ? 'Ordenamos lo que ya llega por WhatsApp y activamos un canal de captación.'
        : 'Combinamos un canal de captación (Google o redes) con seguimiento para no perder lo que entre.';
    services = [
      channel === 'social' ? social('Captación por contenido y campañas Meta.') : ads('Captación por intención de búsqueda.'),
      ia('Para que cada consulta nueva tenga respuesta y seguimiento.'),
    ];
  } else if (needsLook && stack === 'has_none') {
    headline = 'Primero hay que verse y verse encontrable.';
    diagnosis =
      'Sin base de marca y web, ads y redes gastan más de lo que rinden.';
    help = 'Branding + website/SEO como base. Después sí aceleramos con ads o contenido.';
    services = [
      brand('Identidad clara para que la clínica o agencia se perciba seria.'),
      web('Sitio y SEO para existir cuando te buscan y pedir el contacto.'),
    ];
  } else if (pain === 'look_amateur' || goal === 'look_better') {
    headline = 'La imagen digital está por debajo de lo que ofreces.';
    diagnosis =
      stack === 'has_web'
        ? 'Hay web, pero no transmite el nivel del servicio ni convierte.'
        : 'Falta una base visual y de sitio a la altura.';
    help = 'Branding y website. Si ya hay demanda, conectamos ads o redes encima.';
    services = [
      brand('Marca, tono y piezas para que todo se vea del mismo nivel.'),
      web('Web o rediseño orientado a contacto, no a catálogo estático.'),
    ];
    if (needsDemand) {
      services.push(
        channel === 'social'
          ? social('El contenido sigue la nueva identidad.')
          : ads('La captación aterriza en un sitio que ya se ve profesional.'),
      );
    }
  } else if (needsContent) {
    headline = 'Te falta presencia constante: contenido y video.';
    diagnosis =
      'Sin ritmo de redes, el negocio depende de referidos o de ads sueltos.';
    help = 'Paquete de redes y video. Si también se pierden mensajes, sumamos IA.';
    services = [
      social('Contenido, reels y campañas Meta con calendario real.'),
    ];
    if (loseDemand || channel === 'whatsapp') {
      services.push(ia('Para convertir DMs y WhatsApp en agenda, no en chats muertos.'));
    } else if (pain === 'few_clients' || channel === 'google') {
      services.push(ads('Para no depender solo del orgánico.'));
    }
  } else if (pain === 'no_clarity') {
    headline = 'No tienes un tablero claro: se gasta, pero no se ve el cierre.';
    diagnosis =
      'Hay actividad (ads, redes o web), pero no hay lectura de qué produce citas, visitas o ventas.';
    help =
      'Diagnóstico + medición (Pixel / Analytics) y el canal que más duele: seguimiento o captación.';
    services = [
      ia('Orden comercial y trazabilidad de cada oportunidad.'),
      stack === 'has_ads' || channel === 'google'
        ? ads('Leemos y ajustamos campañas con datos de cierre, no de vanidad.')
        : social('Alineamos contenido con lo que sí trae contacto real.'),
    ];
  } else {
    headline = `Necesitas un sistema que una captación y ${close}.`;
    diagnosis =
      'Hay piezas sueltas. Cluster arma el camino: atraer, responder y medir.';
    help = 'Partimos del diagnóstico y priorizamos el canal + el seguimiento.';
    services = [
      ia('Capa de respuesta y seguimiento.'),
      ads('Canal de demanda para no esperar solo referidos.'),
    ];
  }

  services = unique(services).slice(0, 3);

  const names = services.map((s) => s.name).join(' + ');
  const waSummary = `Prioridad: ${headline} Servicios: ${names}.`;

  return { headline, diagnosis, help, services, waSummary };
}
