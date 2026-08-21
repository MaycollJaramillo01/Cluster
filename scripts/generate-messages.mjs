import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { esPart2 } from './messages-es-part2.mjs';
import { esPart3 } from './messages-es-part3.mjs';
import { esPart4 } from './messages-es-part4.mjs';
import {
  translationPairs,
  translateTree,
  applyEnOverrides,
} from './messages-en-translate.mjs';
import { enSiteOverrides } from './messages-en-site.mjs';
import { enPageOverrides } from './messages-en-pages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(root, 'messages'), { recursive: true });

/** @type {Record<string, unknown>} */
const es = {};

/** Deep-merge source into target */
function merge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      target[key] = target[key] ?? {};
      merge(target[key], value);
    } else {
      target[key] = value;
    }
  }
}

merge(es, {
  Meta: {
    titleDefault: 'Cluster Media | Comunicación digital que conecta con tu audiencia',
    titleTemplate: '%s | Cluster Media',
    description:
      'Construimos marcas, contenido, campañas, websites y automatizaciones para conectar con audiencias reales y generar crecimiento.',
    keywords: [
      'comunicación digital para marcas',
      'contenido para redes sociales',
      'agencia de marketing digital para hispanos',
      'marketing digital para negocios hispanos',
      'marketing digital en Estados Unidos',
      'agencia de redes sociales para negocios',
      'campañas de Google Ads para negocios',
      'campañas de Meta Ads para negocios',
      'websites para negocios hispanos',
      'edición audiovisual para marcas',
      'fotografía y podcast para marcas',
      'funnels y email marketing',
      'automatización de WhatsApp para negocios',
      'agentes IA para negocios',
      'branding para negocios',
      'agencia digital en Miami',
      'marketing para negocios latinos',
    ],
  },
  Common: {
    skipToContent: 'Saltar al contenido',
    scheduleCall: 'Agendar llamada',
    whatsapp: 'WhatsApp',
    learnMore: 'Ver más',
    viewPlans: 'Ver planes',
    contactUs: 'Contactar',
    getStarted: 'Empezar',
    recommended: 'Recomendado',
    monthly: 'Mensual',
    from: 'Desde',
    readMore: 'Leer más',
    allRights: 'Todos los derechos reservados.',
    navAria: 'Principal',
    mobileNavAria: 'Móvil',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    showServices: 'Mostrar servicios',
    whatsappDefaultMessage: 'Hola Cluster Media, quiero más información.',
    whatsappServicesMessage:
      'Hola Cluster Media, quiero más información sobre sus servicios.',
    whatsappWriteUs: 'Escríbenos',
    whatsappWriteUsAria: 'Escríbenos por WhatsApp',
    scroll: 'Scroll',
    requestInfo: 'Solicitar información',
    seeCase: 'Ver caso',
    seePlan: 'Ver plan {name}',
    seeService: 'Ver servicio',
    hireNow: 'Contratar ahora',
    seeQuestions: 'Ver preguntas',
    comparePlans: 'Compara y elige el nivel correcto.',
    next: 'Siguiente',
    back: 'Volver',
    backAria: 'Volver',
    sendMessage: 'Enviar mensaje',
    openWhatsapp: 'Abrir WhatsApp',
    perMonth: '/mes',
    usd: 'USD',
    noContracts: 'Sin contratos.',
    cancelAnytime: 'Cancela cuando quieras.',
    choosePlan: 'Elegir plan',
    choosePlanName: 'Elegir {name}',
    auditNow: 'Auditar ahora',
    viewCalendar: 'Ver calendario',
    featured: 'Destacado',
    readArticle: 'Leer artículo',
    read: 'Leer',
    readingTime: '{time} de lectura',
    important: 'Importante:',
    legal: 'Legal',
    lastUpdated: 'Última actualización: {date}',
    email: 'Email',
    location: 'Ubicación',
    articleNotFound: 'Artículo no encontrado',
    planNotFound: 'Plan no encontrado',
    playVideo: 'Reproducir {label}',
    previousVideo: 'Video anterior',
    nextVideo: 'Video siguiente',
    goToVideo: 'Ir a {label}',
    financingNote: '* Financiación en cuotas mensuales',
    monthlyFee: 'cuota /mes',
    oneTimePayment: 'pago único',
    adSpendNotIncluded: 'inversión no incluida',
    adSpendNotIncludedLabel: 'Inversión publicitaria no incluida',
    managementFrom: 'gestión',
    suggestedCommitment: 'Compromiso sugerido:',
    months6: '6 meses',
    popular: 'Más popular',
    requestPlan: 'Solicitar {name}',
    contract: 'Contratar',
    tipQuick: 'Tip rápido',
    seoScore: 'SEO Score',
    result: 'Resultado',
    status: 'Status',
    words: 'Palabras',
    imagesMissingAlt: 'Imagenes sin alt',
    impact: 'Impacto {value}',
    effort: 'Esfuerzo {value}',
    selectService: 'Selecciona un servicio',
    serviceInterest: 'Servicio de interés',
    message: 'Mensaje',
    name: 'Nombre',
    company: 'Empresa',
    country: 'País',
    city: 'Ciudad',
    phone: 'Teléfono',
    consentContact:
      'Al enviar aceptas que Cluster Media te contacte sobre tu solicitud.',
    consentContactCluster:
      'Al enviar aceptas que Cluster te contacte sobre tu solicitud.',
    thankYou: '¡Gracias por escribirnos!',
    thankYouForm:
      'Hemos preparado tu mensaje. Si no se abrió WhatsApp automáticamente, escríbenos directamente y te responderemos lo antes posible.',
    thankYouRutaLocal: '¡Gracias por su interés!',
    thankYouRutaLocalText:
      'Nuestro equipo revisará su solicitud y le contactará pronto para conversar sobre cómo llevar Ruta Local a su municipio.',
    formSentWhatsapp: 'Hola, acabo de llenar el formulario en su website.',
    quizDoneTitle: '¡Listo! Vamos a por tu plan.',
    quizDoneText:
      'Preparamos tu recomendación con base en tus respuestas. Si WhatsApp no se abrió solo, escríbenos y te enviamos un plan adaptado a tu situación.',
    quizDoneWhatsapp: 'Hola, acabo de completar el diagnóstico en su website.',
    receiveRecommendation: 'Recibir recomendación',
    privacyPolicy: 'Privacy Policy',
    termsConditions: 'Terms and Conditions',
    home: 'Inicio',
    breadcrumbPlans: 'Planes',
    breadcrumbBlog: 'Blog',
    seeAllServices: 'Ver todos los servicios',
    seeAllCases: 'Ver todos los casos',
    aboutCluster: 'Sobre Cluster',
    reviewMySystem: 'Revisar mi sistema',
    diagnosticLink: '¿No sabes cuál elegir? Haz el diagnóstico',
    teamCarouselAria: 'Carrusel del equipo Cluster Media',
    webCasesCarouselAria: 'Carrusel de casos de éxito web',
    websiteOf: 'Website de {name}',
    memberAlt: '{name}, {role}',
    chooseLevel: 'Elige tu nivel',
    featureColumn: 'Característica',
    marketingAdviceNote: '(con nuestro director)',
    starter: 'Starter',
    advance: 'Advance',
    seeWebPlans: 'Ver planes web',
    seePackage: 'Ver paquete',
    seeFaq: 'Ver preguntas frecuentes',
    wantThisPackage: 'Quiero este paquete',
    requestProposal: 'Solicitar propuesta',
    scheduleWhatsapp: 'Agendar llamada por WhatsApp',
    views: 'visualizaciones',
    monthlyAverage: '*Promedio mensual',
    newFollowersLabel: 'seguidores nuevos',
    growingCommunity:
      'Comunidad creciente que sigue las historias de cada municipio.',
    hondurasExecuted: 'Honduras · Municipios ejecutados',
    productionAlt: 'Producción audiovisual y podcast en locación',
    coverageAlt: 'Cobertura de cultura y comunidad en el municipio',
    rutaLocalProductionAlt: 'Producción de Ruta Local en {name}',
    noteLabel: 'Nota:',
    templateNote:
      'este es un artículo de plantilla listo para que el equipo de contenido complete con el texto SEO definitivo.',
    backToBlog: 'Volver al blog',
    keepReading: 'Sigue leyendo',
    readArticleAria: 'Leer {title}',
    analyzing: 'Analizando...',
    generateAudit: 'Generar auditoria',
    auditFormAria: 'Formulario de auditoria SEO',
    auditError: 'No se pudo generar la auditoria.',
    scoreSolid: 'Solido',
    scoreImprove: 'Mejorable',
    scoreUrgent: 'Urgente',
    statusOk: 'Bien',
    statusWarning: 'Revisar',
    statusCritical: 'Critico',
    theChallenge: 'El reto',
    theSolution: 'La solución',
    whatsIncluded: 'Qué incluye',
    forWhom: 'Para quién es',
    faq: 'Preguntas frecuentes',
    otherPlans: 'Otros planes',
    otherWebPlans: 'Otros planes web',
    includesWith: 'Todo lo que viene con {name}.',
    planFitsIf: '{name} encaja si tu negocio está en esta etapa.',
    planFitsDescription:
      'Si te reconoces en alguno de estos perfiles, este plan es un buen punto de partida.',
    faqAboutPlan: 'Dudas sobre el plan {name}',
    startWithPlan: 'Empecemos con el plan {name}.',
    planCtaText:
      'Contrata {name} con Stripe o escríbenos por WhatsApp si tienes dudas. Te confirmamos el siguiente paso para tu etapa.',
    webPlanCtaText:
      'Agenda una llamada para contratar {name} o escríbenos por WhatsApp si tienes dudas. Te confirmamos el siguiente paso.',
    compareOtherMonthly:
      'Si necesitas más o menos alcance, revisa las otras opciones mensuales.',
    compareOtherWeb:
      'Si necesitas más o menos alcance, revisa las otras opciones de desarrollo y mantenimiento.',
    seeRealCases: 'Ver casos reales',
    selectOption: 'Selecciona una opción',
    selectPackage: 'Selecciona un paquete',
    additionalMessage: 'Mensaje adicional',
    fullName: 'Nombre completo',
    role: 'Cargo',
    municipalityOrg: 'Municipio / Organización',
    socialWebsite: 'Redes sociales / website',
    whatToPromote: '¿Qué desea promover?',
    whichPackage: '¿Qué paquete le interesa?',
    businessName: 'Nombre de tu negocio',
    whatsappWithCountry: 'WhatsApp (con código de país)',
    websiteOptional: 'Website (opcional)',
    socialOptional: '@usuario en Instagram / TikTok (opcional)',
    countryExample: 'Ej. Estados Unidos',
    cityExample: 'Ej. Miami',
    phoneExample: '+1 ...',
    roleExample: 'Ej. Alcalde, director de turismo',
    municipalityExample: 'Ej. Alcaldía de Santa Rosa',
    socialExample: '@usuario o tudominio.com',
    messagePlaceholder: 'Cuéntanos sobre tu negocio y qué necesitas...',
    rutaLocalMessagePlaceholder:
      'Cuéntanos sobre tu municipio, evento o iniciativa...',
    contactPlaceholder: 'tu@email.com',
    namePlaceholder: 'Tu nombre',
    companyPlaceholder: 'Nombre del negocio',
    businessPlaceholder: 'Nombre de tu negocio',
    urlPlaceholder: 'https://tusitio.com',
    businessTypePlaceholder: 'Ej. roofing, clinica, restaurante',
    siteUrl: 'URL del sitio',
    businessType: 'Tipo de negocio',
    contactTalk: 'Contacto · Hablemos',
    scheduleEyebrow: 'Agenda',
  },
});

merge(es, esPart2);
merge(es, esPart3);
merge(es, esPart4);

/** Deep clone plain objects/arrays */
function deepClone(obj) {
  if (Array.isArray(obj)) return obj.map(deepClone);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = deepClone(v);
    }
    return out;
  }
  return obj;
}

/** Count string leaves in a nested object */
function countStrings(obj) {
  let n = 0;
  for (const v of Object.values(obj)) {
    if (typeof v === 'string') n++;
    else if (Array.isArray(v)) v.forEach((i) => typeof i === 'string' && n++);
    else if (v && typeof v === 'object') n += countStrings(v);
  }
  return n;
}

/** Collect key paths for tree comparison */
function keyTree(obj, prefix = '') {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return prefix ? [prefix] : [];
  }
  return Object.keys(obj)
    .sort()
    .flatMap((k) => {
      const path = prefix ? `${prefix}.${k}` : k;
      const val = obj[k];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        return keyTree(val, path);
      }
      return [path];
    });
}

const en = applyEnOverrides(translateTree(deepClone(es), translationPairs));
merge(en, enSiteOverrides);
merge(en, enPageOverrides);

const esPath = join(root, 'messages', 'es.json');
const enPath = join(root, 'messages', 'en.json');

writeFileSync(esPath, JSON.stringify(es, null, 2), 'utf8');
writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');

const esKeys = keyTree(es);
const enKeys = keyTree(en);
const missingInEn = esKeys.filter((k) => !enKeys.includes(k));
const missingInEs = enKeys.filter((k) => !esKeys.includes(k));

if (missingInEn.length || missingInEs.length) {
  console.error('Key tree mismatch!');
  if (missingInEn.length) console.error('Missing in en:', missingInEn.slice(0, 20));
  if (missingInEs.length) console.error('Missing in es:', missingInEs.slice(0, 20));
  process.exit(1);
}

const namespaces = Object.keys(es);
console.log('Namespaces:', namespaces.join(', '));
console.log('String counts — es:', countStrings(es), '| en:', countStrings(en));
console.log('Wrote', esPath, 'and', enPath);
