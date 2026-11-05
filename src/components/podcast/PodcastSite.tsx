'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { AnalyticsTags } from '@/components/clinicas-esteticas/AnalyticsTags';
import { BookingWidget } from '@/components/blocks/BookingWidget';
import { Icon } from '@/components/ui/Icon';
import { trackEvent } from '@/lib/analytics';
import {
  PODCAST_BUSINESS_CATEGORIES,
  PODCAST_BUSINESS_STAGES,
  PODCAST_DESCRIPTION_MAX,
  PODCAST_OFFER_MAX,
  podcastLogoError,
} from '@/lib/podcast-editorial';
import { podcastParticipantPlanList, resolvePodcastParticipantPlan, type PodcastParticipantPlanId } from '@/lib/podcast-plans';
import { site, whatsappLink } from '@/lib/site';
import styles from './PodcastSite.module.css';

type LeadKind = 'editorial' | 'commercial-evaluation' | 'commercial-request' | 'sponsor';
type LeadPayload = Record<string, string | string[] | boolean | undefined>;

const guests = [
  'Marvin Ponce',
  'Salvador Nasralla',
  'Rambo de León',
  'Alejandra Fuentes',
  'Ramón Maradiaga',
  'Lani Pastor',
  'Karlen Pérez',
  'Miguel Caballero',
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
  ['¿Qué sucede si no soy seleccionado?', 'Puedes volver a postularte o asegurar tu entrevista por un valor comercial.'],
  ['¿Puedo asegurar mi entrevista?', 'Sí. Puedes agendar una entrevista mediante nuestra modalidad comercial.'],
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
  const result = await response.json().catch(() => null) as { ok?: boolean } | null;
  if (!response.ok || !result?.ok) throw new Error('submit_failed');
  return result;
}

async function postEditorialLead(data: FormData) {
  data.set('kind', 'editorial');
  data.set('attribution', JSON.stringify(getAttribution()));
  data.set('path', window.location.pathname);
  data.set('referrer', document.referrer);
  const response = await fetch('/api/podcast-lead', { method: 'POST', body: data });
  const result = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;
  if (!response.ok || !result?.ok) throw new Error(result?.error || 'submit_failed');
  return result;
}

function editorialErrorMessage(code: string) {
  switch (code) {
    case 'invalid_email':
      return 'Ingresa un correo válido.';
    case 'invalid_phone':
      return 'Ingresa un WhatsApp válido, con código de país.';
    case 'description_too_long':
      return 'La descripción admite máximo 300 caracteres.';
    case 'offer_too_long':
      return 'La respuesta sobre productos o servicios admite máximo 300 caracteres.';
    case 'logo_too_large':
      return 'El logotipo debe pesar menos de 2 MB.';
    case 'invalid_logo_type':
      return 'El logotipo debe ser PNG, JPG o WebP.';
    case 'consent_required':
      return 'Necesitamos tu consentimiento para tratar los datos de la postulación.';
    case 'missing_required_fields':
      return 'Completa los campos obligatorios. El nombre de la empresa es necesario si ya tienes un negocio.';
    case 'logo_storage_unavailable':
    case 'logo_upload_failed':
      return 'No pudimos guardar el logotipo. Inténtalo nuevamente o envía la postulación sin imagen.';
    default:
      return 'No pudimos enviar tu información. Inténtalo nuevamente o escríbenos por WhatsApp.';
  }
}

function markInvalid(event: FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, message = 'Completa este campo.') {
  const field = event.currentTarget;
  if (field.validity.customError) return;
  if (field.validity.valueMissing) field.setCustomValidity(message);
  else if (field.validity.typeMismatch) field.setCustomValidity('Ingresa un correo válido.');
  else if (field.validity.tooLong) field.setCustomValidity('El texto supera el máximo permitido.');
  else field.setCustomValidity('Revisa este campo.');
}

function clearInvalid(event: FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  event.currentTarget.setCustomValidity('');
}

function PodcastChrome({ children, whatsappMessage, className = '' }: { children: ReactNode; whatsappMessage: string; className?: string }) {
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
    <div className={`${styles.root} ${className}`.trim()}>
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

function Hero({ eyebrow, title, lead, image, imageAlt = 'Grabación de una conversación en Cluster Podcast', imagePosition = 'center', children }: { eyebrow: string; title: string; lead: string; image: string; imageAlt?: string; imagePosition?: string; children: ReactNode }) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroImage}><Image src={image} alt={imageAlt} fill sizes="100vw" priority style={{ objectPosition: imagePosition }} /></div>
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
          <Image src="/assets/podcast/conversation-studio.webp" alt="Invitado conversando durante una producción de Cluster Podcast" fill sizes="(max-width: 900px) 100vw, 42vw" style={{ objectPosition: '72% center' }} />
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

function fieldList(root: ParentNode) {
  return [...root.querySelectorAll('input, textarea, select')].filter((field): field is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement => (
    field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement
  ));
}

function validateFields(root: ParentNode) {
  const phone = root.querySelector('input[name="telefono"]');
  if (phone instanceof HTMLInputElement) {
    const digits = phone.value.replace(/\D/g, '');
    const invalid = phone.value.trim().length > 0 && (digits.length < 8 || digits.length > 15);
    phone.setCustomValidity(invalid ? 'Ingresa un WhatsApp válido, con código de país.' : '');
  }
  for (const field of fieldList(root)) {
    if (!field.willValidate) continue;
    if (!field.reportValidity()) return false;
  }
  return true;
}

function EditorialForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [sinEmpresa, setSinEmpresa] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const focusStep = useRef<1 | 2 | null>(null);

  useEffect(() => {
    const next = focusStep.current;
    if (!next) return;
    focusStep.current = null;
    const id = next === 1 ? 'editorial-name' : 'editorial-business';
    document.getElementById('editorial-form')?.scrollIntoView({ block: 'start' });
    document.getElementById(id)?.focus();
  }, [step]);

  function showStep(next: 1 | 2) {
    focusStep.current = next;
    setStep(next);
    setError('');
  }

  function continueToBusiness() {
    const section = document.getElementById('editorial-step-1');
    if (!section || !validateFields(section)) return;
    showStep(2);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError('');
    const business = document.getElementById('editorial-step-2');
    const story = document.getElementById('editorial-step-1');
    if (!business || !validateFields(business)) return;
    if (!story || !validateFields(story)) {
      showStep(1);
      return;
    }
    const data = new FormData(form);
    const phone = String(data.get('telefono') || '');
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      const phoneInput = form.elements.namedItem('telefono');
      if (phoneInput instanceof HTMLInputElement) {
        phoneInput.setCustomValidity('Ingresa un WhatsApp válido, con código de país.');
        phoneInput.reportValidity();
      }
      return;
    }
    const logo = data.get('logotipo');
    if (logo instanceof File && logo.size > 0) {
      const problem = podcastLogoError(logo);
      if (problem) {
        setStatus('error');
        setError(editorialErrorMessage(problem));
        return;
      }
    }
    setStatus('sending');
    data.set('sinEmpresa', sinEmpresa ? 'true' : 'false');
    data.set('consentimientoDatos', data.get('consentimientoDatos') ? 'true' : 'false');
    data.set('aceptaOportunidades', data.get('aceptaOportunidades') ? 'true' : 'false');
    try {
      await postEditorialLead(data);
      trackEvent('submit_editorial');
      setStatus('success');
      form.reset();
    } catch (submitError) {
      setStatus('error');
      setError(editorialErrorMessage(submitError instanceof Error ? submitError.message : 'submit_failed'));
    }
  }

  if (status === 'success') {
    return <div className={styles.form}><h3>Gracias por compartir tu historia.</h3><p className={styles.success}>Cada mes seleccionamos 2 emprendedores. Si tu historia es seleccionada, nuestro equipo se pondrá en contacto contigo. También guardamos los datos de tu emprendimiento para preparar tu perfil en Cluster.</p><a className={styles.buttonSecondary} href={site.social.youtube} target="_blank" rel="noreferrer">Ver Cluster Podcast</a></div>;
  }

  return (
    <form className={styles.form} id="editorial-form" onSubmit={submit} noValidate>
      <div className={styles.progress} aria-live="polite">
        <span>Etapa {step} de 2</span>
        <div className={styles.progressLine}><span style={{ width: `${step * 50}%` }} /></div>
      </div>
      <p className={styles.helper}>Los campos con * son obligatorios.</p>
      <section className={styles.formBlock} id="editorial-step-1" hidden={step !== 1}>
        <h3>Tu historia</h3>
        <div className={inputClass}>
          <label htmlFor="editorial-name">Nombre *</label>
          <input id="editorial-name" name="nombre" autoComplete="name" required maxLength={120} onInvalid={markInvalid} onInput={clearInvalid} />
        </div>
        <div className={inputClass}>
          <label htmlFor="editorial-email">Correo *</label>
          <input id="editorial-email" name="email" type="email" autoComplete="email" inputMode="email" required maxLength={254} onInvalid={markInvalid} onInput={clearInvalid} />
        </div>
        <div className={inputClass}>
          <label htmlFor="editorial-phone">WhatsApp *</label>
          <input id="editorial-phone" name="telefono" type="tel" autoComplete="tel" inputMode="tel" required maxLength={40} placeholder="Código de país + número" onInvalid={markInvalid} onInput={clearInvalid} />
        </div>
        <div className={inputClass}>
          <label htmlFor="editorial-story">Cuéntanos brevemente tu historia *</label>
          <textarea id="editorial-story" name="historia" required maxLength={900} rows={5} onInvalid={markInvalid} onInput={clearInvalid} />
        </div>
      </section>

      <section className={styles.formBlock} id="editorial-step-2" hidden={step !== 2}>
        <h3>Tu emprendimiento</h3>
        <p className={styles.helper}>Así conocemos tu negocio y podemos preparar tu perfil en Cluster.</p>
        <label className={styles.choice}>
          <input
            type="checkbox"
            name="sinEmpresa"
            checked={sinEmpresa}
            onChange={(event) => {
              setSinEmpresa(event.target.checked);
              const company = document.getElementById('editorial-business');
              if (company instanceof HTMLInputElement) company.setCustomValidity('');
            }}
          />
          <span>Todavía no tengo una empresa, estoy construyendo mi emprendimiento.</span>
        </label>
        <div className={inputClass}>
          <label htmlFor="editorial-business">Nombre de la empresa o emprendimiento{sinEmpresa ? '' : ' *'}</label>
          <input id="editorial-business" name="empresa" autoComplete="organization" required={!sinEmpresa} maxLength={160} onInvalid={markInvalid} onInput={clearInvalid} />
        </div>
        <div className={inputClass}>
          <label htmlFor="editorial-category">Categoría o sector *</label>
          <select id="editorial-category" name="categoria" required defaultValue="" onInvalid={markInvalid} onInput={clearInvalid}>
            <option value="" disabled>Selecciona una categoría</option>
            {PODCAST_BUSINESS_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
        <p className={styles.helper} id="editorial-location-hint">Ciudad y departamento donde opera tu emprendimiento.</p>
        <div className={styles.fieldPair}>
          <div className={inputClass}>
            <label htmlFor="editorial-city">Ciudad *</label>
            <input id="editorial-city" name="ciudad" autoComplete="address-level2" required maxLength={80} aria-describedby="editorial-location-hint" onInvalid={markInvalid} onInput={clearInvalid} />
          </div>
          <div className={inputClass}>
            <label htmlFor="editorial-region">Departamento *</label>
            <input id="editorial-region" name="departamento" autoComplete="address-level1" required maxLength={80} aria-describedby="editorial-location-hint" onInvalid={markInvalid} onInput={clearInvalid} />
          </div>
        </div>
        <div className={inputClass}>
          <label htmlFor="editorial-description">¿A qué se dedica tu empresa? *</label>
          <textarea
            id="editorial-description"
            name="descripcion"
            required
            maxLength={PODCAST_DESCRIPTION_MAX}
            rows={4}
            value={descripcion}
            aria-describedby="editorial-description-count"
            onChange={(event) => setDescripcion(event.target.value)}
            onInvalid={markInvalid}
            onInput={clearInvalid}
          />
          <p className={styles.counter} id="editorial-description-count" data-full={descripcion.length >= PODCAST_DESCRIPTION_MAX}>{descripcion.length}/{PODCAST_DESCRIPTION_MAX}</p>
        </div>
        <div className={`${inputClass} ${styles.fieldShort}`}>
          <label htmlFor="editorial-offer">¿Qué productos o servicios ofrece? *</label>
          <textarea id="editorial-offer" name="productos" required maxLength={PODCAST_OFFER_MAX} rows={3} placeholder="Respuesta breve" onInvalid={markInvalid} onInput={clearInvalid} />
        </div>
        <div className={inputClass}>
          <label htmlFor="editorial-social">Redes sociales</label>
          <input id="editorial-social" name="redesSociales" inputMode="url" maxLength={300} placeholder="Instagram, Facebook, TikTok u otra" />
        </div>
        <div className={inputClass}>
          <label htmlFor="editorial-website">Sitio web</label>
          <input id="editorial-website" name="sitioWeb" inputMode="url" maxLength={300} placeholder="https://" />
        </div>
        <div className={inputClass}>
          <label htmlFor="editorial-logo">Logotipo de la empresa</label>
          <input id="editorial-logo" name="logotipo" type="file" accept="image/png,image/jpeg,image/webp" />
          <p className={styles.helper}>Opcional. PNG, JPG o WebP, máximo 2 MB.</p>
        </div>
        <div className={inputClass}>
          <label htmlFor="editorial-stage">¿En qué etapa está tu emprendimiento? *</label>
          <select id="editorial-stage" name="etapa" required defaultValue="" onInvalid={markInvalid} onInput={clearInvalid}>
            <option value="" disabled>Selecciona una etapa</option>
            {PODCAST_BUSINESS_STAGES.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
          </select>
        </div>
        <div className={styles.consents}>
        <div className={styles.legal}>
          <label className={styles.consent} htmlFor="editorial-consent">
            <input id="editorial-consent" name="consentimientoDatos" type="checkbox" value="true" required onInvalid={(event) => markInvalid(event, 'Necesitamos tu consentimiento para tratar estos datos.')} onInput={clearInvalid} />
            <span>Acepto el tratamiento de mis datos para evaluar mi postulación al podcast y preparar mi perfil en Cluster.</span>
          </label>
          <Link className={styles.privacyLink} href="/privacidad">Ver política de privacidad</Link>
        </div>
        <label className={styles.consent} htmlFor="editorial-opportunities">
          <input id="editorial-opportunities" name="aceptaOportunidades" type="checkbox" value="true" />
          <span>Quiero recibir información sobre futuras oportunidades de Cluster. Esta autorización es opcional y no afecta tu postulación.</span>
        </label>
      </div>
      </section>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.formNav}>
        {step === 2 && <button className={styles.buttonSecondary} type="button" onClick={() => showStep(1)}>Atrás</button>}
        {step === 1
          ? <button className={styles.button} type="button" onClick={continueToBusiness}>Continuar</button>
          : <button className={styles.button} type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Enviando...' : 'Postular mi historia'}</button>}
      </div>
    </form>
  );
}

export function EditorialLanding() {
  const wa = 'Hola, vi la convocatoria de Cluster Podcast y quisiera conocer más.';
  return (
    <PodcastChrome whatsappMessage={wa}>
      <Hero eyebrow="Cluster Podcast" title="Tu historia merece ser escuchada." lead="Cada mes seleccionamos a 2 emprendedores para participar sin costo en Cluster Podcast." image="/assets/podcast/conversation-guest.webp" imagePosition="74% center">
        <a className={styles.button} href="#postula" onClick={() => trackEvent('click_postular')}>Postular mi historia</a>
        <Link className={styles.buttonSecondary} href="/participa/asegura-tu-participacion" onClick={() => trackEvent('click_commercial_path')}>Asegura tu participación</Link>
      </Hero>

      <section className={styles.section}>
        <div className={styles.shell}>
          <SectionHeading title="Voces que han pasado por Cluster." />
          <div className={styles.mediaGrid}>
            <div className={styles.featureImage}><Image src="/assets/podcast/conversation-couch-wide.webp" alt="Conversación con un invitado de Cluster Podcast" fill sizes="(max-width: 900px) 100vw, 66vw" style={{ objectPosition: 'center 45%' }} /></div>
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

      <section className={`${styles.section} ${styles.sectionCompact}`} id="postula">
        <div className={`${styles.shell} ${styles.formWrap}`}>
          <div>
            <SectionHeading title="Cuéntanos tu historia." lead="Son dos etapas. Primero tu historia y después lo esencial de tu emprendimiento. Con eso evaluamos tu postulación y preparamos tu perfil en Cluster." />
            <Link className={styles.formAlternative} href="/participa/asegura-tu-participacion">No quiero postularme. Quiero asegurar mi participación.</Link>
          </div>
          <EditorialForm />
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.shell} ${styles.ctaGroup}`}>
          <div className={styles.bridge}><div><h2>¿Prefieres no esperar la selección?</h2><p>Solicita una participación comercial en Cluster Podcast y conoce la modalidad disponible para ti.</p></div><Link className={styles.button} href="/participa/asegura-tu-participacion">Asegurar mi participación</Link></div>
          <div className={`${styles.bridge} ${styles.bridgeBrand}`}><div><p className={styles.eyebrow}>Para empresas</p><h2>¿Representas a una marca?</h2><p>Integra tu marca a las conversaciones y contenidos de Cluster Podcast.</p></div><Link className={styles.buttonSecondary} href="/patrocinios">Explorar patrocinios</Link></div>
        </div>
      </section>
      <section className={`${styles.section} ${styles.sectionSoft}`}><div className={styles.shell}><SectionHeading title="Preguntas frecuentes" /><Faq items={editorialFaqs} /></div></section>
    </PodcastChrome>
  );
}

type EvaluationData = {
  participantType: PodcastParticipantPlanId | '';
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

const emptyEvaluation: EvaluationData = { participantType: '', businessType: '', businessAge: '', storyTypes: [], story: '', nombre: '', empresa: '', telefono: '', email: '', instagram: '', consent: false };
const includedItems = ['Episodio completo', 'Producción profesional', 'Distribución multiplataforma', '5 clips publicados por Cluster'];

function ParticipationPrice({ planId, size = 'card' }: { planId: PodcastParticipantPlanId; size?: 'card' | 'hero' }) {
  const plan = resolvePodcastParticipantPlan(planId);
  if (!plan) return null;
  const discounted = Boolean(plan.originalDisplay);
  return (
    <p className={`${styles.participationPrice} ${size === 'hero' ? styles.participationPriceHero : ''} ${discounted ? styles.participationPriceSale : ''}`}>
      {plan.originalDisplay ? <span className={styles.priceWas}>{plan.originalDisplay}</span> : null}
      <strong>{plan.display} USD</strong>
    </p>
  );
}

async function createPodcastCheckout(data: LeadPayload, returnPath: string) {
  const response = await fetch('/api/podcast-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, returnPath }),
  });
  const result = await response.json().catch(() => null) as { url?: string } | null;
  if (!response.ok || !result?.url) throw new Error('checkout_failed');
  return result.url;
}

function PlanSelector({ value, onSelect }: { value: PodcastParticipantPlanId | ''; onSelect: (planId: PodcastParticipantPlanId) => void }) {
  return (
    <div className={styles.participantOptions} role="radiogroup" aria-label="Tipo de participación">
      {podcastParticipantPlanList.map((plan) => (
        <button type="button" className={styles.participantOption} data-selected={value === plan.id} role="radio" aria-checked={value === plan.id} key={plan.id} onClick={() => onSelect(plan.id)}>
          <span className={styles.participantOptionLabel}>{plan.label}</span>
          <span className={styles.participantOptionDetail}>{plan.detail}</span>
        </button>
      ))}
    </div>
  );
}

function CommercialEvaluation() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<EvaluationData>(emptyEvaluation);
  const [phase, setPhase] = useState<'form' | 'processing' | 'result' | 'success'>('form');
  const [error, setError] = useState('');
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const selected = resolvePodcastParticipantPlan(data.participantType);
  const canContinue = useMemo(() => step === 1 ? Boolean(data.businessType && data.businessAge && data.storyTypes.length > 0) : Boolean(data.nombre && data.empresa && data.telefono && data.email && data.consent), [data, step]);

  function toggleStory(value: string) {
    setData((current) => ({ ...current, storyTypes: current.storyTypes.includes(value) ? current.storyTypes.filter((item) => item !== value) : [...current.storyTypes, value] }));
  }

  function selectPlan(planId: PodcastParticipantPlanId) {
    setData((current) => ({ ...current, participantType: planId }));
    trackEvent('commercial_plan_selected', { plan: planId });
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
    if (!selected) return;
    setError('');
    try {
      await postLead('commercial-request', { ...data, aporte: selected.display });
      trackEvent('commercial_submit', { plan: selected.id });
      setPhase('success');
    } catch {
      setError('No pudimos enviar tu solicitud. Inténtalo nuevamente o escríbenos por WhatsApp.');
    }
  }

  async function payAndSchedule() {
    if (!selected) return;
    setError('');
    setCheckoutBusy(true);
    try {
      const url = await createPodcastCheckout(data, window.location.pathname);
      trackEvent('commercial_checkout_start', { plan: selected.id, amount: selected.display });
      window.location.assign(url);
    } catch {
      setCheckoutBusy(false);
      setError('No pudimos abrir el pago. Inténtalo nuevamente o escríbenos por WhatsApp.');
    }
  }

  if (phase === 'processing') return <div className={`${styles.evaluation} ${styles.processing}`}><div><div className={styles.processingMark} /><p className={styles.sectionLead}>Preparando tu participación...</p></div></div>;

  if (phase === 'success' && selected) {
    return (
      <div className={styles.evaluation}>
        <h3 className={styles.question}>Gracias. Recibimos tu solicitud.</h3>
        <p className={styles.sectionLead}>Tu siguiente paso es agendar y completar el pago seguro de tu entrevista.</p>
        <div className={styles.successPayment}>
          <p className={styles.priceLabel}>Inversión de participación</p>
          <ParticipationPrice planId={selected.id} size="hero" />
          <button className={styles.button} type="button" onClick={payAndSchedule} disabled={checkoutBusy}>{checkoutBusy ? 'Abriendo pago seguro…' : 'Quiero agendar y pagar ahora'}</button>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <div className={styles.evaluation}>
        <div className={styles.resultGrid}>
          <div>
            <h3 className={styles.question}>Tu participación en Cluster Podcast</h3>
            <ul className={styles.included}>{includedItems.map((item) => <li key={item}><Icon name="check" size={18} />{item}</li>)}</ul>
          </div>
          <div className={styles.pricePanel}>
            <p className={styles.priceLabel}>¿Cómo participas?</p>
            <PlanSelector value={data.participantType} onSelect={selectPlan} />
            {selected ? (
              <>
                <p className={styles.priceLabel}>Valor de participación</p>
                <ParticipationPrice planId={selected.id} size="hero" />
                {selected.originalDisplay ? <p className={styles.helper}>Tarifa para emprendedores con apoyo de Cluster.</p> : null}
              </>
            ) : <p className={styles.helper}>Elige una opción para ver el valor.</p>}
            {error && <p className={styles.error}>{error}</p>}
            <button className={styles.button} type="button" disabled={!selected} onClick={submitRequest}>Solicitar mi participación</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.evaluation} id="evaluacion">
      <div className={styles.progress}><span>{step} de 2</span><div className={styles.progressLine}><span style={{ width: `${step * 50}%` }} /></div></div>
      {step === 1 && (
        <>
          <h3 className={styles.question}>Cuéntanos tu historia.</h3>
          <p className={styles.legend}>¿Qué describe mejor tu empresa o proyecto?</p>
          <div className={styles.options}>{['Negocios', 'Política', 'Medios', 'Servicios', 'Creación de contenido', 'Otro'].map((item) => <button type="button" className={styles.option} data-selected={data.businessType === item} key={item} onClick={() => setData((current) => ({ ...current, businessType: item }))}>{item}</button>)}</div>
          <p className={styles.legend}>¿Cuánto tiempo llevas desarrollándolo?</p>
          <div className={styles.options}>{['Menos de 1 año', '1-3 años', '4-7 años', '8+ años'].map((item) => <button type="button" className={styles.option} data-selected={data.businessAge === item} key={item} onClick={() => setData((current) => ({ ...current, businessAge: item }))}>{item}</button>)}</div>
          <p className={styles.legend}>¿Qué te gustaría contar?</p>
          <div className={styles.options}>{['Cómo nació mi empresa o proyecto', 'Mi trayectoria profesional', 'Una historia de superación', 'Un proyecto que quiero dar a conocer', 'Otro'].map((item) => <button type="button" className={styles.option} data-selected={data.storyTypes.includes(item)} key={item} onClick={() => toggleStory(item)}>{item}</button>)}</div>
          <div className={inputClass}><label htmlFor="commercial-story">Cuéntanos en una frase qué hace especial tu historia</label><textarea id="commercial-story" maxLength={250} value={data.story} onChange={(event) => setData((current) => ({ ...current, story: event.target.value }))} /></div>
        </>
      )}
      {step === 2 && (
        <>
          <h3 className={styles.question}>Tus datos</h3>
          <div className={styles.evaluationFields}>
            <div className={inputClass}><label htmlFor="commercial-name">Nombre *</label><input id="commercial-name" autoComplete="name" value={data.nombre} onChange={(event) => setData((current) => ({ ...current, nombre: event.target.value }))} /></div>
            <div className={inputClass}><label htmlFor="commercial-business">Empresa o proyecto *</label><input id="commercial-business" autoComplete="organization" value={data.empresa} onChange={(event) => setData((current) => ({ ...current, empresa: event.target.value }))} /></div>
            <div className={inputClass}><label htmlFor="commercial-phone">Teléfono *</label><input id="commercial-phone" type="tel" autoComplete="tel" value={data.telefono} onChange={(event) => setData((current) => ({ ...current, telefono: event.target.value }))} /></div>
            <div className={inputClass}><label htmlFor="commercial-email">Email *</label><input id="commercial-email" type="email" autoComplete="email" value={data.email} onChange={(event) => setData((current) => ({ ...current, email: event.target.value }))} /></div>
            <div className={inputClass}><label htmlFor="commercial-social">Instagram o red social</label><input id="commercial-social" value={data.instagram} onChange={(event) => setData((current) => ({ ...current, instagram: event.target.value }))} /></div>
          </div>
          <label className={styles.consent}><input type="checkbox" checked={data.consent} onChange={(event) => setData((current) => ({ ...current, consent: event.target.checked }))} /><span>Acepto que Cluster use estos datos para evaluar mi solicitud y contactarme.</span></label>
        </>
      )}
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>{step > 1 && <button className={styles.buttonSecondary} type="button" onClick={() => setStep((value) => value - 1)}>Atrás</button>}<button className={styles.button} type="button" disabled={!canContinue} onClick={() => { if (step === 1) { setStep(2); trackEvent('commercial_evaluation_start', { step }); } else revealPrice(); }}>{step === 1 ? 'Continuar' : 'Ver valor de participación'}</button></div>
    </div>
  );
}

export function CommercialLanding() {
  const wa = 'Hola, vi la opción para asegurar una participación en Cluster Podcast y quisiera información.';
  return (
    <PodcastChrome whatsappMessage={wa} className={styles.commercial}>
      <Hero eyebrow="Participación comercial" title="Cuéntanos tu historia." lead="La participación es pagada, agenda ya tu entrevista." image="/assets/podcast/conversation-studio.webp" imagePosition="25% center">
        <a className={styles.button} href="#evaluacion">Agendar entrevista</a><a className={styles.buttonSecondary} href={whatsappLink(wa)} target="_blank" rel="noreferrer">Hablar por WhatsApp</a>
      </Hero>
      <section className={styles.section}><div className={styles.shell}><SectionHeading title="Tu episodio sigue circulando." /><div className={styles.distribution}><article className={styles.distributionItem}><h3>Episodio completo</h3></article><article className={styles.distributionItem}><h3>Producción profesional</h3><p>Grabación cuidada de principio a fin.</p></article><article className={styles.distributionItem}><h3>Distribución multiplataforma</h3><p>La conversación vive en los canales de Cluster.</p></article><article className={styles.distributionItem}><h3>5 clips</h3><p>Publicados por Cluster Podcast.</p></article><article className={styles.distributionItem}><h3>Una historia</h3><p>Contada con espacio, ritmo y una producción a su altura.</p></article></div></div></section>
      <section className={`${styles.section} ${styles.sectionSoft}`}><div className={styles.shell}><SectionHeading title="Tu conversación, en cifras." lead="El alcance combinado de Cluster Podcast lleva cada episodio a una audiencia activa en varias plataformas." /><PodcastMetrics /></div></section>
      <section className={`${styles.section} ${styles.sectionCompact}`}><div className={styles.shell}><SectionHeading title="Agendemos la fecha." lead="Completa tus datos para solicitar la entrevista y continuar al pago seguro." /><CommercialEvaluation /></div></section>
    </PodcastChrome>
  );
}

export function CommercialPaymentConfirmation({ paid, returnPath, formData }: { paid: boolean; returnPath: string; formData: Record<string, string> | null }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function retryPayment() {
    if (!formData) return;
    setBusy(true);
    setError('');
    try {
      const url = await createPodcastCheckout({ ...formData, consent: true }, returnPath);
      window.location.assign(url);
    } catch {
      setBusy(false);
      setError('No pudimos abrir el pago. Inténtalo nuevamente o escríbenos por WhatsApp.');
    }
  }

  const wa = 'Hola, realicé el pago para mi entrevista de Cluster Podcast.';
  return <PodcastChrome whatsappMessage={wa}><main className={`${styles.shell} ${styles.paymentConfirmation}`}>
    {paid ? <><p className={styles.eyebrow}>Cluster Podcast</p><h1>Pago confirmado.</h1><p className={styles.sectionLead}>Gracias por asegurar tu participación. Agenda la fecha de tu entrevista en el calendario.</p><div className={styles.calendar}><BookingWidget /></div></> : <><p className={styles.eyebrow}>Cluster Podcast</p><h1>Pago pendiente.</h1><p className={styles.sectionLead}>No encontramos un pago completado para esta sesión. Puedes intentarlo nuevamente o volver a la página de participación.</p><div className={styles.actions}>{formData ? <button className={styles.button} type="button" onClick={retryPayment} disabled={busy}>{busy ? 'Abriendo pago seguro…' : 'Intentar el pago nuevamente'}</button> : null}<Link className={styles.buttonSecondary} href="/participa/asegura-tu-participacion">Volver a la participación</Link></div>{error && <p className={styles.error}>{error}</p>}</>}
  </main></PodcastChrome>;
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
      <Hero eyebrow="Patrocinios" title="Tu marca en la conversación." lead="Conecta con la audiencia de Cluster Podcast mediante integraciones naturales y presencia multiplataforma." image="/assets/podcast/conversation-karlen-perez.webp" imageAlt="Karlen Pérez conversando con el anfitrión de Cluster Podcast" imagePosition="30% center"><a className={styles.button} href="#planes">Conocer patrocinios</a><a className={styles.buttonSecondary} href={whatsappLink(wa)} target="_blank" rel="noreferrer">Hablar por WhatsApp</a></Hero>
      <section className={styles.section}><div className={styles.shell}><SectionHeading title="La audiencia ya está aquí." lead="Cada cifra conserva su ventana de medición para que el alcance sea claro y comparable." /><PodcastMetrics /></div></section>
      <section className={`${styles.section} ${styles.sectionSoft}`}><div className={styles.shell}><SectionHeading title="Una audiencia activa y conectada." /><div className={styles.audience}><div className={styles.featureImage}><Image src="/assets/podcast/conversation-couch-wide.webp" alt="Conversación entre anfitrión e invitado de Cluster Podcast" fill sizes="(max-width: 900px) 100vw, 46vw" style={{ objectPosition: '62% center' }} /></div><div className={styles.audienceStats}><div className={styles.audienceStat}><strong>44.4%</strong><span>de la audiencia de Instagram tiene entre 35 y 54 años.</span></div><div className={styles.audienceStat}><strong>57.5%</strong><span>hombres y 42.5% mujeres en Instagram.</span></div><div className={styles.audienceStat}><strong>22.7%</strong><span>Honduras, seguido por Estados Unidos con 21.7% y México con 7.9%.</span></div></div></div></div></section>
      <section className={`${styles.section} ${styles.sectionCompact}`}>
        <div className={styles.shell}>
          <SectionHeading title="Presencia que se siente natural." lead="Diseñamos integraciones con presencia en el episodio y en las piezas que continúan circulando." />
          <div className={`${styles.distribution} ${styles.distributionSponsor}`}>
            <div className={styles.distributionVisual} role="img" aria-label="Conversación entre anfitrión e invitado de Cluster Podcast" />
            <div className={styles.distributionDetails}>
              <h3 className={styles.distributionTitle}>Una conversación. Múltiples puntos de contacto.</h3>
              <div className={styles.distributionPoints}>
                <article className={styles.distributionItem}><h3>Mención de apertura</h3></article>
                <article className={styles.distributionItem}><h3>Integración orgánica</h3></article>
                <article className={styles.distributionItem}><h3>Presencia visual</h3></article>
                <article className={styles.distributionItem}><h3>Clips multiplataforma</h3></article>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className={`${styles.section} ${styles.sectionCompact}`}><div className={styles.shell}><BrandIntegration /></div></section>
      <section className={`${styles.section} ${styles.sectionSoft} ${styles.sectionCompact}`} id="planes"><div className={styles.shell}><SectionHeading title="Elige tu nivel de presencia." /><div className={styles.plans}>{plans.map((plan) => <article className={`${styles.plan} ${plan.featured ? styles.planFeatured : ''}`} key={plan.name}><h3>{plan.name}</h3><p className={styles.planPrice}>{plan.price}</p><p>{plan.note} Precios más impuestos.</p><ul>{plan.items.map((item) => <li key={item}>{item}</li>)}</ul><a className={plan.featured ? styles.button : styles.buttonSecondary} href="#contacto" onClick={() => trackEvent(plan.featured ? 'sponsor_official_partner_click' : plan.name === 'Partner' ? 'sponsor_partner_click' : 'sponsor_episode_click')}>{plan.cta}</a></article>)}</div><div className={`${styles.bridge} ${styles.planBridge}`}><div><h2>¿Necesitas exclusividad de categoría?</h2><p>Podemos desarrollar propuestas personalizadas según la marca, período y alcance.</p></div><a className={styles.buttonSecondary} href="#contacto">Hablar con nuestro equipo</a></div></div></section>
      <section className={`${styles.section} ${styles.sectionCompact}`} id="contacto"><div className={`${styles.shell} ${styles.formWrap}`}><div><SectionHeading title="Hablemos de tu marca." lead="Déjanos tus datos. Al enviar podrás reservar una reunión sin volver a completar la información básica." /></div><SponsorForm /></div></section>
      <section className={styles.section}><div className={styles.shell}><SectionHeading title="Preguntas frecuentes" /><Faq items={sponsorFaqs} /></div></section>
      <section className={styles.finalVisual}><div className={styles.shell}><h2>Convierte atención en presencia de marca.</h2><div className={styles.actions}><a className={styles.button} href="#contacto">Solicitar contacto</a><a className={styles.buttonWhatsApp} href={whatsappLink(wa)} target="_blank" rel="noreferrer">WhatsApp</a></div></div></section>
    </PodcastChrome>
  );
}
