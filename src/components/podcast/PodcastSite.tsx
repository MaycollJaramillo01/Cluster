'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { AnalyticsTags } from '@/components/clinicas-esteticas/AnalyticsTags';
import { BookingWidget } from '@/components/blocks/BookingWidget';
import { Icon } from '@/components/ui/Icon';
import { trackEvent } from '@/lib/analytics';
import { site, whatsappLink } from '@/lib/site';
import styles from './PodcastSite.module.css';

type LeadKind = 'editorial' | 'commercial-evaluation' | 'commercial-request' | 'sponsor';
type LeadPayload = Record<string, string | string[] | boolean | undefined>;

const guests = [
  'Salvador Nasralla',
  'Rambo de León',
  'Alejandra Fuentes',
  'Ramón Maradiaga',
  'Lani Pastor',
  'Karlen Pérez',
];

const podcastMetrics = [
  { platform: 'Facebook', value: '16M', detail: 'visualizaciones en los últimos 90 días. 5.3M espectadores y 91% de vistas de no seguidores.' },
  { platform: 'TikTok', value: '9.5M', detail: 'visualizaciones en 60 días. 4.7M espectadores y 123K+ seguidores.' },
  { platform: 'Instagram', value: '4.48M', detail: 'visualizaciones en 90 días. 1.85M espectadores.' },
  { platform: 'YouTube', value: '10.7K', detail: 'suscriptores. 77.8K vistas en 28 días.' },
  { platform: 'TikTok', value: '89.6%', detail: 'del tráfico proviene de Para ti.' },
];

const editorialFaqs = [
  ['¿Tiene algún costo postularme?', 'No. La postulación y la participación de las 2 historias seleccionadas cada mes no tienen costo.'],
  ['¿Cuándo seleccionan las historias?', 'Nuestro equipo realiza una selección cada mes.'],
  ['¿Qué sucede si no soy seleccionado?', 'Puedes volver a postularte o conocer nuestra modalidad de participación comercial.'],
  ['¿Puedo asegurar mi participación?', 'Sí. Existe una modalidad comercial sujeta a aprobación y disponibilidad.'],
];

const sponsorFaqs = [
  ['¿Puedo patrocinar solamente un episodio?', 'Sí. Puedes comenzar con un patrocinio puntual desde $675 más impuestos.'],
  ['¿Puedo elegir el episodio?', 'Está sujeto a disponibilidad y compatibilidad de la marca con el contenido.'],
  ['¿Los planes mensuales tienen permanencia?', 'Partner y Official Partner tienen un período mínimo de 3 meses.'],
  ['¿Puedo solicitar exclusividad de categoría?', 'Sí. Se cotiza de forma independiente según categoría y período.'],
  ['¿Pueden crear una integración personalizada?', 'Sí. Podemos desarrollar activaciones específicas según los objetivos de la marca.'],
];

const inputClass = styles.field;

function getAttribution() {
  if (typeof window === 'undefined') return {};
  const query = new URLSearchParams(window.location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  const current = Object.fromEntries(keys.map((key) => [key, query.get(key) || '']));
  try {
    const previous = JSON.parse(sessionStorage.getItem('cluster_podcast_utm') || '{}');
    const merged = { ...previous, ...Object.fromEntries(Object.entries(current).filter(([, value]) => value)) };
    sessionStorage.setItem('cluster_podcast_utm', JSON.stringify(merged));
    return merged;
  } catch {
    return current;
  }
}

async function postLead(kind: LeadKind, data: LeadPayload) {
  const response = await fetch('/api/podcast-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      kind,
      data,
      attribution: getAttribution(),
      path: window.location.pathname,
      referrer: document.referrer,
    }),
  });
  if (!response.ok) throw new Error('submit_failed');
  return response.json() as Promise<{ ok: boolean }>;
}

function PodcastChrome({ children, whatsappMessage }: { children: ReactNode; whatsappMessage: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getAttribution();
    setOpen(false);
  }, [pathname]);

  const items = [
    { href: '/participa', label: 'Participa' },
    { href: '/participa/asegura-tu-participacion', label: 'Asegura tu participación' },
    { href: '/patrocinios', label: 'Patrocina' },
  ];

  return (
    <div className={styles.root}>
      <AnalyticsTags />
      <header className={styles.header}>
        <div className={`${styles.shell} ${styles.headerInner}`}>
          <Link href="/participa" className={styles.brand} aria-label="Cluster Podcast">
            <Image src="/assets/logo-white.webp" width={400} height={222} alt="Cluster" priority />
            <span className={styles.brandText}><strong>Cluster</strong><span>Podcast</span></span>
          </Link>
          <nav className={styles.nav} data-open={open} aria-label="Navegación de Cluster Podcast">
            {items.map((item) => (
              <Link key={item.href} href={item.href} data-active={pathname === item.href}>
                {item.label}
              </Link>
            ))}
            <a href={whatsappLink(whatsappMessage)} target="_blank" rel="noreferrer">WhatsApp</a>
          </nav>
          <button className={styles.menuButton} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Cerrar menú' : 'Abrir menú'}>
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </header>
      {children}
      <a className={styles.waFloat} href={whatsappLink(whatsappMessage)} target="_blank" rel="noreferrer" aria-label="Hablar con Cluster Podcast por WhatsApp" onClick={() => trackEvent('whatsapp_click', { path: pathname })}>
        <Icon name="whatsapp" size={25} />
      </a>
      <footer className={styles.footer}>
        <div className={`${styles.shell} ${styles.footerInner}`}>
          <span>© {new Date().getFullYear()} Cluster Podcast</span>
          <span>Una producción de Cluster Media</span>
        </div>
      </footer>
    </div>
  );
}

function Hero({ eyebrow, title, lead, image, children }: { eyebrow: string; title: string; lead: string; image: string; children: ReactNode }) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroImage}><Image src={image} alt="Grabación de una conversación en un estudio de podcast" fill sizes="100vw" priority /></div>
      <div className={`${styles.shell} ${styles.heroBody}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1>{title}</h1>
          <p className={styles.heroLead}>{lead}</p>
          <div className={styles.heroActions}>{children}</div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ title, lead }: { title: string; lead?: string }) {
  return <><h2 className={styles.sectionTitle}>{title}</h2>{lead && <p className={styles.sectionLead}>{lead}</p>}</>;
}

function PodcastMetrics() {
  return (
    <div className={styles.metrics}>
      {podcastMetrics.map((metric) => (
        <article className={styles.metric} key={`${metric.platform}-${metric.value}`}>
          <span className={styles.metricPlatform}>{metric.platform}</span>
          <strong className={styles.metricValue}>{metric.value}</strong>
          <p>{metric.detail}</p>
        </article>
      ))}
    </div>
  );
}

function GuestShowcase() {
  return (
    <div className={styles.guestPanel} aria-label="Invitados destacados">
      <p className={styles.guestLabel}>Invitados destacados</p>
      <div className={styles.guestGrid}>
        {guests.map((guest) => (
          <div className={styles.guestCard} key={guest}>
            <span aria-hidden="true">{guest.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}</span>
            <strong>{guest}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrandIntegration() {
  const steps = [
    ['Conversamos contigo', 'Definimos el enfoque y el lugar natural de tu marca.'],
    ['Diseñamos la integración', 'Elegimos episodios, temas y momentos que encajen.'],
    ['Producimos el contenido', 'Grabamos la conversación y las piezas para cada plataforma.'],
    ['Amplificamos', 'Distribuimos la integración en el ecosistema del podcast.'],
  ];

  return (
    <div className={styles.integrationBlock}>
      <div className={styles.integrationGrid}>
        <div className={styles.integrationImage}>
          <Image src="/assets/podcast/podcast-guest.webp" alt="Producción de una conversación para integrar una marca" fill sizes="(max-width: 900px) 100vw, 42vw" />
        </div>
        <div className={styles.integrationCopy}>
          <p className={styles.eyebrow}>No hacemos anuncios tradicionales</p>
          <SectionHeading title="Integramos tu marca en conversaciones reales." lead="Creamos una presencia natural que acompaña la experiencia y fortalece la conexión con la audiencia." />
          <div className={styles.integrationSteps}>
            {steps.map(([title, detail]) => (
              <article className={styles.integrationStep} key={title}>
                <h3>{title}</h3>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.integrationProof}>
        <strong>Más atención. Más recuerdo. Más conexión.</strong>
        <p>La marca no interrumpe. Forma parte de la experiencia.</p>
      </div>
    </div>
  );
}

function Faq({ items }: { items: string[][] }) {
  return <div className={styles.faq}>{items.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>;
}

function EditorialForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus('sending');
    const data = new FormData(form);
    try {
      await postLead('editorial', {
        nombre: String(data.get('nombre') || ''),
        empresa: String(data.get('empresa') || ''),
        telefono: String(data.get('telefono') || ''),
        instagram: String(data.get('instagram') || ''),
        historia: String(data.get('historia') || ''),
      });
      trackEvent('submit_editorial');
      setStatus('success');
      form.reset();
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return <div className={styles.form}><h3>Gracias por compartir tu historia.</h3><p className={styles.success}>Cada mes seleccionamos 2 emprendedores. Si tu historia es seleccionada, nuestro equipo se pondrá en contacto contigo.</p><a className={styles.buttonSecondary} href={site.social.youtube} target="_blank" rel="noreferrer">Ver Cluster Podcast</a></div>;
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={inputClass}><label htmlFor="editorial-name">Nombre *</label><input id="editorial-name" name="nombre" autoComplete="name" required /></div>
      <div className={inputClass}><label htmlFor="editorial-business">Emprendimiento o empresa *</label><input id="editorial-business" name="empresa" autoComplete="organization" required /></div>
      <div className={inputClass}><label htmlFor="editorial-phone">Teléfono o WhatsApp *</label><input id="editorial-phone" name="telefono" type="tel" autoComplete="tel" required /></div>
      <div className={inputClass}><label htmlFor="editorial-social">Instagram o red social</label><input id="editorial-social" name="instagram" inputMode="url" /></div>
      <div className={inputClass}><label htmlFor="editorial-story">Cuéntanos brevemente tu historia *</label><textarea id="editorial-story" name="historia" required maxLength={900} /></div>
      {status === 'error' && <p className={styles.error}>No pudimos enviar tu información. Inténtalo nuevamente o escríbenos por WhatsApp.</p>}
      <button className={styles.button} type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Enviando...' : 'Postular mi historia'}</button>
    </form>
  );
}

export function EditorialLanding() {
  const wa = 'Hola, vi la convocatoria de Cluster Podcast y quisiera conocer más.';
  return (
    <PodcastChrome whatsappMessage={wa}>
      <Hero eyebrow="Cluster Podcast" title="Tu historia merece ser escuchada." lead="Cada mes seleccionamos a 2 emprendedores para participar sin costo en Cluster Podcast." image="/assets/podcast/podcast-hero.webp">
        <a className={styles.button} href="#postula" onClick={() => trackEvent('click_postular')}>Postular mi historia</a>
        <Link className={styles.buttonSecondary} href="/participa/asegura-tu-participacion" onClick={() => trackEvent('click_commercial_path')}>Asegura tu participación</Link>
      </Hero>

      <section className={styles.section}>
        <div className={styles.shell}>
          <SectionHeading title="Voces que han pasado por Cluster." />
          <div className={styles.mediaGrid}>
            <div className={styles.featureImage}><Image src="/assets/podcast/podcast-production.webp" alt="Producción profesional de Cluster Podcast" fill sizes="(max-width: 900px) 100vw, 66vw" /></div>
            <GuestShowcase />
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionSoft}`}>
        <div className={styles.shell}>
          <SectionHeading title="El alcance de cada conversación." lead="Una comunidad multiplataforma que descubre, comparte y sigue las historias de Cluster Podcast." />
          <PodcastMetrics />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.shell}>
          <SectionHeading title="Buscamos historias que conectan." />
          <div className={styles.asymGrid}>
            <article className={styles.storyLarge}><h3>Emprendimiento</h3><p>Personas construyendo negocios, proyectos e ideas.</p></article>
            <article className={styles.storySmall}><h3>Trayectoria</h3><p>Experiencias profesionales o personales que dejan algo que contar.</p></article>
            <article className={styles.storySmall}><h3>Historias</h3><p>Caminos, aprendizajes y momentos que pueden conectar con otros.</p></article>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionSoft}`}>
        <div className={styles.shell}>
          <SectionHeading title="Así funciona." />
          <div className={styles.steps}>
            <article className={styles.step}><span className={styles.stepNumber}>01</span><h3>Cuéntanos tu historia</h3><p>Completa una postulación breve.</p></article>
            <article className={styles.step}><span className={styles.stepNumber}>02</span><h3>Seleccionamos 2 cada mes</h3><p>Nuestro equipo revisa las historias recibidas.</p></article>
            <article className={styles.step}><span className={styles.stepNumber}>03</span><h3>Conversamos</h3><p>Si eres seleccionado, coordinamos tu participación sin costo.</p></article>
          </div>
        </div>
      </section>

      <section className={styles.section} id="postula">
        <div className={`${styles.shell} ${styles.formWrap}`}>
          <div><SectionHeading title="Cuéntanos tu historia." lead="La postulación es breve. Solo pedimos la información necesaria para conocer lo que quieres compartir." /></div>
          <EditorialForm />
        </div>
      </section>

      <section className={styles.section}><div className={styles.shell}><div className={styles.bridge}><div><h2>¿Prefieres no esperar la selección?</h2><p>Solicita una participación comercial en Cluster Podcast y conoce la modalidad disponible para ti.</p></div><Link className={styles.button} href="/participa/asegura-tu-participacion">Asegurar mi participación</Link></div></div></section>
      <section className={styles.section}><div className={styles.shell}><div className={`${styles.bridge} ${styles.bridgeBrand}`}><div><p className={styles.eyebrow}>Para empresas</p><h2>¿Representas a una marca?</h2><p>Integra tu marca a las conversaciones y contenidos de Cluster Podcast.</p></div><Link className={styles.buttonSecondary} href="/patrocinios">Explorar patrocinios</Link></div></div></section>
      <section className={`${styles.section} ${styles.sectionSoft}`}><div className={styles.shell}><SectionHeading title="Preguntas frecuentes" /><Faq items={editorialFaqs} /></div></section>
    </PodcastChrome>
  );
}

type EvaluationData = {
  businessType: string;
  businessAge: string;
  storyTypes: string[];
  story: string;
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  instagram: string;
  consent: boolean;
};

const emptyEvaluation: EvaluationData = { businessType: '', businessAge: '', storyTypes: [], story: '', nombre: '', empresa: '', telefono: '', email: '', instagram: '', consent: false };

function CommercialEvaluation() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<EvaluationData>(emptyEvaluation);
  const [phase, setPhase] = useState<'form' | 'processing' | 'result' | 'success'>('form');
  const [support, setSupport] = useState(false);
  const [error, setError] = useState('');

  const canContinue = useMemo(() => step === 1 ? Boolean(data.businessType && data.businessAge) : step === 2 ? data.storyTypes.length > 0 : Boolean(data.nombre && data.empresa && data.telefono && data.email && data.consent), [data, step]);

  function toggleStory(value: string) {
    setData((current) => ({ ...current, storyTypes: current.storyTypes.includes(value) ? current.storyTypes.filter((item) => item !== value) : [...current.storyTypes, value] }));
  }

  async function revealPrice() {
    if (!canContinue) return;
    setError('');
    setPhase('processing');
    trackEvent('commercial_evaluation_complete');
    try {
      await postLead('commercial-evaluation', { ...data, estado: 'evaluación completada' });
      window.setTimeout(() => { setPhase('result'); trackEvent('commercial_price_view'); }, 950);
    } catch {
      setPhase('form');
      setError('No pudimos guardar tu evaluación. Inténtalo nuevamente o escríbenos por WhatsApp.');
    }
  }

  async function submitRequest() {
    setError('');
    try {
      await postLead('commercial-request', { ...data, apoyo: support, aporte: support ? '$300' : '$600' });
      trackEvent('commercial_submit', { support });
      setPhase('success');
    } catch {
      setError('No pudimos enviar tu solicitud. Inténtalo nuevamente o escríbenos por WhatsApp.');
    }
  }

  if (phase === 'processing') return <div className={`${styles.evaluation} ${styles.processing}`}><div><div className={styles.processingMark} /><p className={styles.sectionLead}>Preparando tu participación...</p></div></div>;
  if (phase === 'success') return <div className={styles.evaluation}><h3 className={styles.question}>Gracias. Recibimos tu solicitud{support ? ' de participación y apoyo' : ''}.</h3><p className={styles.sectionLead}>Nuestro equipo revisará tu información y se pondrá en contacto contigo.</p><div className={styles.actions}><a className={styles.buttonWhatsApp} href={whatsappLink('Hola, envié mi solicitud de participación en Cluster Podcast y quisiera conversar.')} target="_blank" rel="noreferrer">Hablar por WhatsApp</a></div></div>;

  if (phase === 'result') {
    return (
      <div className={styles.evaluation}>
        <div className={styles.resultGrid}>
          <div><h3 className={styles.question}>Tu participación en Cluster Podcast</h3><ul className={styles.included}>{['Episodio completo', 'Producción profesional', 'Distribución multiplataforma', '5 clips publicados por Cluster'].map((item) => <li key={item}><Icon name="check" size={18} />{item}</li>)}</ul></div>
          <div className={styles.pricePanel}>
            <p className={styles.priceLabel}>Valor de participación</p>
            <p className={`${styles.price} ${support ? styles.priceSupported : ''}`}>{support ? '$300' : '$600'}</p>
            <label className={styles.consent}><input type="checkbox" checked={support} onChange={(event) => { setSupport(event.target.checked); trackEvent('commercial_support_selected', { selected: event.target.checked }); }} /><span>Quiero solicitar apoyo de Cluster para mi participación</span></label>
            {support && <><div className={styles.supportLine}><span>Valor</span><span>$600</span></div><div className={styles.supportLine}><span>Apoyo Cluster</span><strong>- $300</strong></div><p className={styles.helper}>Solicitud de apoyo sujeta a aprobación de Cluster.</p></>}
            {error && <p className={styles.error}>{error}</p>}
            <button className={styles.button} type="button" onClick={submitRequest}>{support ? 'Enviar solicitud de apoyo' : 'Solicitar mi participación'}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.evaluation} id="evaluacion">
      <div className={styles.progress}><span>{step} de 3</span><div className={styles.progressLine}><span style={{ width: `${step * 33.333}%` }} /></div></div>
      {step === 1 && <><h3 className={styles.question}>Cuéntanos sobre tu negocio.</h3><p className={styles.legend}>¿Qué describe mejor lo que haces?</p><div className={styles.options}>{['Servicios', 'Productos', 'Comercio', 'Tecnología', 'Gastronomía', 'Otro'].map((item) => <button type="button" className={styles.option} data-selected={data.businessType === item} key={item} onClick={() => setData({ ...data, businessType: item })}>{item}</button>)}</div><p className={styles.legend}>¿Cuánto tiempo llevas desarrollándolo?</p><div className={styles.options}>{['Menos de 1 año', '1-3 años', '4-7 años', '8+ años'].map((item) => <button type="button" className={styles.option} data-selected={data.businessAge === item} key={item} onClick={() => setData({ ...data, businessAge: item })}>{item}</button>)}</div></>}
      {step === 2 && <><h3 className={styles.question}>¿Qué te gustaría contar?</h3><div className={styles.options}>{['Cómo nació mi negocio', 'Mi trayectoria como emprendedor', 'Una historia de superación', 'Mi producto o servicio', 'Un proyecto que quiero dar a conocer', 'Otro'].map((item) => <button type="button" className={styles.option} data-selected={data.storyTypes.includes(item)} key={item} onClick={() => toggleStory(item)}>{item}</button>)}</div><div className={inputClass}><label htmlFor="commercial-story">Cuéntanos en una frase qué hace especial tu historia</label><textarea id="commercial-story" maxLength={250} value={data.story} onChange={(event) => setData({ ...data, story: event.target.value })} /></div></>}
      {step === 3 && <><h3 className={styles.question}>Tus datos</h3><div className={styles.evaluationFields}><div className={inputClass}><label htmlFor="commercial-name">Nombre *</label><input id="commercial-name" autoComplete="name" value={data.nombre} onChange={(event) => setData({ ...data, nombre: event.target.value })} /></div><div className={inputClass}><label htmlFor="commercial-business">Empresa o emprendimiento *</label><input id="commercial-business" autoComplete="organization" value={data.empresa} onChange={(event) => setData({ ...data, empresa: event.target.value })} /></div><div className={inputClass}><label htmlFor="commercial-phone">Teléfono *</label><input id="commercial-phone" type="tel" autoComplete="tel" value={data.telefono} onChange={(event) => setData({ ...data, telefono: event.target.value })} /></div><div className={inputClass}><label htmlFor="commercial-email">Email *</label><input id="commercial-email" type="email" autoComplete="email" value={data.email} onChange={(event) => setData({ ...data, email: event.target.value })} /></div><div className={inputClass}><label htmlFor="commercial-social">Instagram o red social</label><input id="commercial-social" value={data.instagram} onChange={(event) => setData({ ...data, instagram: event.target.value })} /></div></div><label className={styles.consent}><input type="checkbox" checked={data.consent} onChange={(event) => setData({ ...data, consent: event.target.checked })} /><span>Acepto que Cluster use estos datos para evaluar mi solicitud y contactarme.</span></label></>}
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>{step > 1 && <button className={styles.buttonSecondary} type="button" onClick={() => setStep((value) => value - 1)}>Atrás</button>}<button className={styles.button} type="button" disabled={!canContinue} onClick={() => { if (step < 3) { setStep((value) => value + 1); trackEvent('commercial_evaluation_start', { step }); } else revealPrice(); }}>{step < 3 ? 'Continuar' : 'Ver valor de participación'}</button></div>
    </div>
  );
}

export function CommercialLanding() {
  const wa = 'Hola, vi la opción para asegurar una participación en Cluster Podcast y quisiera información.';
  return (
    <PodcastChrome whatsappMessage={wa}>
      <Hero eyebrow="Participación comercial" title="Asegura tu participación." lead="Cuéntanos tu historia y descubre la modalidad de participación que tenemos para ti." image="/assets/podcast/podcast-hero.webp">
        <a className={styles.button} href="#evaluacion">Evaluar mi participación</a><a className={styles.buttonSecondary} href={whatsappLink(wa)} target="_blank" rel="noreferrer">Hablar por WhatsApp</a>
      </Hero>
      <section className={styles.section}><div className={styles.shell}><SectionHeading title="Tu episodio sigue circulando." /><div className={styles.distribution}><article className={styles.distributionItem}><h3>Episodio completo</h3></article><article className={styles.distributionItem}><h3>Producción profesional</h3><p>Grabación cuidada de principio a fin.</p></article><article className={styles.distributionItem}><h3>Distribución multiplataforma</h3><p>La conversación vive en los canales de Cluster.</p></article><article className={styles.distributionItem}><h3>5 clips</h3><p>Publicados por Cluster Podcast.</p></article><article className={styles.distributionItem}><h3>Una historia</h3><p>Contada con espacio, ritmo y una producción a su altura.</p></article></div></div></section>
      <section className={`${styles.section} ${styles.sectionSoft}`}><div className={styles.shell}><SectionHeading title="Tu conversación, en cifras." lead="El alcance combinado de Cluster Podcast lleva cada episodio a una audiencia activa en varias plataformas." /><PodcastMetrics /></div></section>
      <section className={styles.section}><div className={styles.shell}><SectionHeading title="Conoce tu modalidad." lead="Tres pasos breves. Sin tarjeta, sin checkout y sin formularios interminables." /><CommercialEvaluation /></div></section>
    </PodcastChrome>
  );
}

function SponsorForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    const data = new FormData(event.currentTarget);
    try {
      await postLead('sponsor', { nombre: String(data.get('nombre') || ''), empresa: String(data.get('empresa') || ''), cargo: String(data.get('cargo') || ''), telefono: String(data.get('telefono') || ''), email: String(data.get('email') || ''), interes: String(data.get('interes') || '') });
      trackEvent('sponsor_form_submit');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }
  if (status === 'success') return <div><div className={styles.form}><h3>Gracias. Hablemos de tu marca.</h3><p className={styles.success}>Puedes reservar ahora una hora para conversar con nuestro equipo.</p></div><div className={styles.calendar}><BookingWidget /></div></div>;
  return <form className={styles.form} onSubmit={submit}><div className={inputClass}><label htmlFor="sponsor-name">Nombre *</label><input id="sponsor-name" name="nombre" autoComplete="name" required /></div><div className={inputClass}><label htmlFor="sponsor-company">Empresa *</label><input id="sponsor-company" name="empresa" autoComplete="organization" required /></div><div className={inputClass}><label htmlFor="sponsor-role">Cargo</label><input id="sponsor-role" name="cargo" autoComplete="organization-title" /></div><div className={inputClass}><label htmlFor="sponsor-phone">Teléfono *</label><input id="sponsor-phone" name="telefono" type="tel" autoComplete="tel" required /></div><div className={inputClass}><label htmlFor="sponsor-email">Email *</label><input id="sponsor-email" name="email" type="email" autoComplete="email" required /></div><div className={inputClass}><label htmlFor="sponsor-interest">¿Qué te interesa? *</label><select id="sponsor-interest" name="interes" required defaultValue=""><option value="" disabled>Selecciona una opción</option><option>Patrocinar un episodio</option><option>Partner mensual</option><option>Official Partner</option><option>Aún no estoy seguro</option></select></div>{status === 'error' && <p className={styles.error}>No pudimos enviar tu información. Inténtalo nuevamente o escríbenos por WhatsApp.</p>}<button className={styles.button} type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Enviando...' : 'Solicitar contacto'}</button></form>;
}

const plans = [
  { name: 'Patrocina un episodio', price: '$675', note: 'Para una integración puntual.', items: ['1 episodio patrocinado', 'Mención natural al inicio y cierre', 'Integración orgánica', 'Presencia visual de marca', 'Presencia en clips seleccionados', 'Distribución multiplataforma'], cta: 'Patrocinar un episodio' },
  { name: 'Partner', price: '$1,300', note: 'Presencia recurrente. Mínimo 3 meses.', items: ['2 episodios patrocinados por mes', 'Mención al inicio y cierre', '4 clips con presencia de marca', '2 historias dedicadas', 'Presencia visual y en copies'], cta: 'Quiero ser Partner' },
  { name: 'Official Partner', price: '$1,850', note: 'Máxima integración. Mínimo 3 meses.', items: ['4 episodios patrocinados al mes', '8 clips con presencia de marca', '4 historias dedicadas', '1 Reel comercial dedicado', 'Derecho de reutilización del Reel', 'Prioridad para activaciones especiales'], cta: 'Quiero ser Official Partner', featured: true },
];

export function SponsorsLanding() {
  const wa = 'Hola, quisiera conocer las opciones de patrocinio de Cluster Podcast.';
  return (
    <PodcastChrome whatsappMessage={wa}>
      <Hero eyebrow="Patrocinios" title="Tu marca en la conversación." lead="Conecta con la audiencia de Cluster Podcast mediante integraciones naturales y presencia multiplataforma." image="/assets/podcast/podcast-production.webp"><a className={styles.button} href="#planes">Conocer patrocinios</a><a className={styles.buttonSecondary} href={whatsappLink(wa)} target="_blank" rel="noreferrer">Hablar por WhatsApp</a></Hero>
      <section className={styles.section}><div className={styles.shell}><SectionHeading title="La audiencia ya está aquí." lead="Cada cifra conserva su ventana de medición para que el alcance sea claro y comparable." /><PodcastMetrics /></div></section>
      <section className={`${styles.section} ${styles.sectionSoft}`}><div className={styles.shell}><SectionHeading title="Una audiencia activa y conectada." /><div className={styles.audience}><div className={styles.featureImage}><Image src="/assets/podcast/podcast-hero.webp" alt="Conversación de negocios en Cluster Podcast" fill sizes="(max-width: 900px) 100vw, 46vw" /></div><div className={styles.audienceStats}><div className={styles.audienceStat}><strong>44.4%</strong><span>de la audiencia de Instagram tiene entre 35 y 54 años.</span></div><div className={styles.audienceStat}><strong>57.5%</strong><span>hombres y 42.5% mujeres en Instagram.</span></div><div className={styles.audienceStat}><strong>22.7%</strong><span>Honduras, seguido por Estados Unidos con 21.7% y México con 7.9%.</span></div></div></div></div></section>
      <section className={styles.section}><div className={styles.shell}><SectionHeading title="Presencia que se siente natural." lead="Diseñamos integraciones con presencia en el episodio y en las piezas que continúan circulando." /><div className={styles.distribution}><article className={styles.distributionItem}><h3>Una conversación. Múltiples puntos de contacto.</h3></article><article className={styles.distributionItem}><h3>Mención de apertura</h3></article><article className={styles.distributionItem}><h3>Integración orgánica</h3></article><article className={styles.distributionItem}><h3>Presencia visual</h3></article><article className={styles.distributionItem}><h3>Clips multiplataforma</h3></article></div></div></section>
      <section className={`${styles.section} ${styles.sectionSoft}`} id="planes"><div className={styles.shell}><SectionHeading title="Elige tu nivel de presencia." /><div className={styles.plans}>{plans.map((plan) => <article className={`${styles.plan} ${plan.featured ? styles.planFeatured : ''}`} key={plan.name}><h3>{plan.name}</h3><p className={styles.planPrice}>{plan.price}</p><p>{plan.note} Precios más impuestos.</p><ul>{plan.items.map((item) => <li key={item}>{item}</li>)}</ul><a className={plan.featured ? styles.button : styles.buttonSecondary} href="#contacto" onClick={() => trackEvent(plan.featured ? 'sponsor_official_partner_click' : plan.name === 'Partner' ? 'sponsor_partner_click' : 'sponsor_episode_click')}>{plan.cta}</a></article>)}</div><div className={styles.bridge}><div><h2>¿Necesitas exclusividad de categoría?</h2><p>Podemos desarrollar propuestas personalizadas según la marca, período y alcance.</p></div><a className={styles.buttonSecondary} href="#contacto">Hablar con nuestro equipo</a></div></div></section>
      <section className={styles.section}><div className={styles.shell}><BrandIntegration /></div></section>
      <section className={`${styles.section} ${styles.sectionSoft}`} id="contacto"><div className={`${styles.shell} ${styles.formWrap}`}><div><SectionHeading title="Hablemos de tu marca." lead="Déjanos tus datos. Al enviar podrás reservar una reunión sin volver a completar la información básica." /></div><SponsorForm /></div></section>
      <section className={styles.section}><div className={styles.shell}><SectionHeading title="Preguntas frecuentes" /><Faq items={sponsorFaqs} /></div></section>
      <section className={styles.finalVisual}><div className={styles.shell}><h2>Convierte atención en presencia de marca.</h2><div className={styles.actions}><a className={styles.button} href="#contacto">Solicitar contacto</a><a className={styles.buttonWhatsApp} href={whatsappLink(wa)} target="_blank" rel="noreferrer">WhatsApp</a></div></div></section>
    </PodcastChrome>
  );
}
