import Image from 'next/image';
import type { CSSProperties } from 'react';
import { AnalyticsTags } from '@/components/clinicas-esteticas/AnalyticsTags';
import { Icon } from '@/components/ui/Icon';
import { whatsappLink } from '@/lib/site';
import { DeferredBooking, HeroVideo, PageLayer } from './ParticipacionClient';
import base from './PodcastSite.module.css';
import s from './Participacion.module.css';

// Private proposal for prospects the sales team already contacted. Deliberately
// standalone: no links to the editorial, commercial-evaluation or sponsor funnels.

const PRICE = 'L8,000';
const STUDIO = 'Grabación en nuestro estudio en San Pedro Sula.';
const WHATSAPP = whatsappLink('Hola, recibí información sobre la participación para emprendedores en Cluster Podcast y quisiera conocer más.');
const photo = (name: string) => `/assets/podcast/${name}.webp`;

const clipFrames = [
  ['conversation-studio', '90% center'],
  ['conversation-karlen-perez', '12% center'],
  ['conversation-guest', '90% center'],
  ['conversation-couch-close', '82% center'],
  ['historias-que-conectan', '93% center'],
];

const included = [
  ['Grabación profesional', 'Entrevista grabada en nuestro estudio en San Pedro Sula.'],
  ['Producción audiovisual', 'Producción completa del episodio por el equipo de Cluster Podcast.'],
  ['Episodio completo', 'Publicación de la conversación completa en el canal oficial de YouTube de Cluster Podcast.'],
  ['Contenido corto', 'Edición y publicación de un mínimo de 5 clips derivados de la entrevista.'],
  ['Distribución', 'Los clips seleccionados serán publicados desde las cuentas de Cluster Podcast en TikTok, Instagram y Facebook.'],
];

// Each platform keeps its own measurement window: never add these together.
const platforms = [
  { name: 'TikTok', value: '9.5M', label: 'Visualizaciones', period: 'Últimos 60 días', stats: [['4.7M', 'espectadores'], ['123K+', 'seguidores']], insight: ['89.6%', 'del tráfico proviene de “Para ti”.'] },
  { name: 'Facebook', value: '16M', label: 'Visualizaciones', period: 'Últimos 90 días', stats: [['5.3M', 'espectadores']], insight: ['91%', 'de las visualizaciones provienen de personas que todavía no siguen nuestra página.'] },
  { name: 'Instagram', value: '4.48M', label: 'Visualizaciones', period: 'Últimos 90 días', stats: [['1.85M', 'espectadores'], ['38.9K', 'seguidores']] },
  { name: 'YouTube', value: '10.7K', label: 'Suscriptores', period: 'Canal oficial', stats: [['77.8K', 'vistas en 28 días'], ['2.2K', 'horas de reproducción en 28 días']] },
];

const countries: [string, number][] = [['Honduras', 22.7], ['Estados Unidos', 21.7], ['México', 7.9]];

// ponytail: guests without a photo render a typographic card. Add each episode
// frame as `image` (+ `position` to frame the face) when the team sends them.
const guests: { name: string; image?: string; position?: string }[] = [
  { name: 'Salvador Nasralla' },
  { name: 'Rambo de León' },
  { name: 'Alejandra Fuentes' },
  { name: 'Ramón Maradiaga' },
  { name: 'Lani Pastor' },
  { name: 'Karlen Pérez', image: photo('conversation-karlen-perez'), position: '12% center' },
];

const steps = [
  ['Agendamos', 'Coordinamos contigo la fecha y hora de grabación.'],
  ['Conversamos', 'Grabamos el episodio en nuestro estudio en San Pedro Sula.'],
  ['Producimos', 'Editamos la entrevista y seleccionamos los mejores momentos de la conversación.'],
  ['Publicamos', 'El episodio completo se publica en YouTube y los clips seleccionados se distribuyen en TikTok, Instagram y Facebook.'],
];

const investIncludes = [
  'Grabación en nuestro estudio de San Pedro Sula',
  'Producción completa del episodio',
  'Episodio completo publicado en YouTube',
  'Mínimo de 5 clips',
  'Publicación de clips en TikTok, Instagram y Facebook',
];

const benefits = [
  ['Autoridad', 'Presenta tu experiencia, empresa y trayectoria en un formato de conversación más profundo que un anuncio tradicional.'],
  ['Contenido', 'Una conversación genera un episodio completo y diferentes momentos preparados para plataformas de contenido corto.'],
  ['Descubrimiento', 'Gran parte del alcance de Cluster proviene de usuarios que todavía no siguen nuestras cuentas, permitiendo que el contenido continúe encontrando nuevas audiencias.'],
];

const faqs = [
  ['¿Dónde se realiza la grabación?', 'La participación de L8,000 contempla grabación en nuestro estudio en San Pedro Sula.'],
  ['¿Pueden grabar fuera de San Pedro Sula?', 'Sí. Si nuestro equipo debe desplazarse fuera de San Pedro Sula se aplica un cargo adicional de L3,000, sujeto a coordinación y condiciones de producción.'],
  ['¿Dónde se publica la entrevista?', 'El episodio completo se publica en el canal de YouTube de Cluster Podcast. Los clips seleccionados se distribuyen desde nuestras cuentas de TikTok, Instagram y Facebook.'],
  ['¿Cuántos clips incluye?', 'La participación garantiza la publicación de un mínimo de cinco clips. Dependiendo del material obtenido, Cluster puede decidir publicar contenidos adicionales.'],
  ['¿Puedo recibir contenido para mis propias redes?', 'Sí. Existe un paquete opcional de 5 clips adicionales por L3,500, editados y entregados para uso del cliente.'],
  ['¿La participación es automática después de pagar?', 'Las participaciones están sujetas a aprobación y disponibilidad de agenda. Nuestro equipo coordina previamente los detalles de la conversación y producción.'],
];

function PriceTag({ eyebrow, note = STUDIO }: { eyebrow: string; note?: string }) {
  return (
    <div className={s.priceTag}>
      <p className={s.priceEyebrow}>{eyebrow}</p>
      <p className={s.priceValue}>{PRICE}</p>
      <p className={s.priceNote}>{note}</p>
    </div>
  );
}

function BookLink({ at }: { at: string }) {
  return <a className={base.button} href="#agenda" data-track="participacion_agendar_click" data-track-location={at}>Agendar mi participación</a>;
}

function WhatsAppLink({ at, label = 'Hablar por WhatsApp', className = base.buttonSecondary }: { at: string; label?: string; className?: string }) {
  return (
    <a className={className} href={WHATSAPP} target="_blank" rel="noreferrer" data-track="participacion_whatsapp_click" data-track-location={at}>
      <Icon name="whatsapp" size={18} />{label}
    </a>
  );
}

function Heading({ title, lead }: { title: string; lead?: string }) {
  return <><h2 className={base.sectionTitle}>{title}</h2>{lead && <p className={base.sectionLead}>{lead}</p>}</>;
}

export function ParticipacionLanding() {
  return (
    <div className={base.root}>
      <AnalyticsTags />
      <header className={base.header}>
        <div className={`${base.shell} ${base.headerInner}`}>
          <a href="#inicio" className={base.brand} aria-label="Cluster Podcast">
            <Image src="/assets/logo-white.webp" width={400} height={222} alt="Cluster" priority />
            <span className={base.brandText}><strong>Cluster</strong><span>Podcast</span></span>
          </a>
          <a className={s.headerCta} href="#agenda" data-track="participacion_agendar_click" data-track-location="header">Agendar</a>
        </div>
      </header>

      {/* 01 Hero */}
      <section className={s.hero} id="inicio">
        <div className={s.heroMedia}>
          <Image src={photo('conversation-studio')} alt="" fill priority sizes="100vw" />
          <HeroVideo />
        </div>
        <div className={base.shell}>
          <div className={s.heroCopy}>
            <p className={base.eyebrow}>Cluster Podcast</p>
            <h1 className={s.heroTitle}>Convierte tu historia en una conversación que pueda llegar a miles de personas.</h1>
            <p className={s.heroLead}>Participa en Cluster Podcast y presenta tu experiencia, empresa o proyecto en un episodio producido y distribuido desde nuestras plataformas.</p>
            <div className={s.heroDeal}>
              <PriceTag eyebrow="Participación para emprendedores y empresas medianas" />
              <div className={s.ctaRow} data-wa-hide><BookLink at="hero" /><WhatsAppLink at="hero" /></div>
            </div>
            <p className={s.heroNote}>Participación sujeta a aprobación y disponibilidad de agenda.</p>
          </div>
        </div>
      </section>

      {/* 02 Qué recibe */}
      <section className={base.section} id="que-recibe">
        <div className={base.shell}>
          <Heading title="No es solo una entrevista." lead="Una conversación se convierte en contenido distribuido desde las plataformas de Cluster Podcast." />
          <div className={s.receive}>
            <article className={s.receiveCard}>
              <div className={s.episodeFrame}>
                <Image src={photo('conversation-couch-wide')} alt="Episodio completo de Cluster Podcast" fill sizes="(min-width: 1024px) 45vw, 100vw" />
                <span className={s.episodeBadge}><Icon name="youtube" size={16} />YouTube</span>
              </div>
              <h3 className={s.receiveTitle}><span>1</span> episodio completo</h3>
              <p>Publicado en <strong>YouTube — Cluster Podcast</strong>.</p>
            </article>
            <div className={s.receiveArrow} aria-hidden="true"><Icon name="arrow-right" size={34} /></div>
            <article className={s.receiveCard}>
              <ul className={s.clips} aria-hidden="true">
                {clipFrames.map(([name, position]) => (
                  <li className={s.clip} key={name}><Image src={photo(name)} alt="" fill sizes="(min-width: 1024px) 8vw, 20vw" style={{ objectPosition: position }} /></li>
                ))}
              </ul>
              <h3 className={s.receiveTitle}>Mínimo <span>5</span> clips</h3>
              <p>Publicados desde las cuentas oficiales de Cluster Podcast en:</p>
              <ul className={s.platformList}><li>TikTok</li><li>Instagram</li><li>Facebook</li></ul>
            </article>
          </div>
          <p className={s.receiveNote}>Dependiendo del contenido obtenido durante la conversación, Cluster podrá publicar piezas adicionales según criterio editorial.</p>
        </div>
      </section>

      {/* 03 Qué incluye */}
      <section className={`${base.section} ${base.sectionSoft}`} id="incluye">
        <div className={base.shell}>
          <Heading title="Todo lo que incluye tu participación" />
          <div className={s.includeLayout}>
            <ol className={s.includeList}>
              {included.map(([title, detail], i) => (
                <li className={s.includeItem} key={title}>
                  <span className={s.index}>0{i + 1}</span>
                  <div><h3>{title}</h3><p>{detail}</p></div>
                </li>
              ))}
            </ol>
            <div className={s.priceCard}>
              <PriceTag eyebrow="Inversión" note="Tarifa especial para emprendedores y empresas medianas." />
              <div className={s.ctaRow} data-wa-hide><BookLink at="incluye" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* 04 Audiencia */}
      <section className={base.section} id="audiencia">
        <div className={base.shell}>
          <Heading title="Tu historia entra a un ecosistema que ya tiene audiencia." lead="Cluster Podcast distribuye sus conversaciones en TikTok, Facebook, Instagram y YouTube. Cada cifra corresponde a su propio período de medición." />
          <div className={s.metricGrid}>
            {platforms.map((platform) => (
              <article className={s.metricCard} key={platform.name}>
                <div className={s.metricHead}><h3>{platform.name}</h3><span>{platform.period}</span></div>
                <div>
                  <p className={s.metricValue}>{platform.value}</p>
                  <p className={s.metricLabel}>{platform.label}</p>
                </div>
                <dl className={s.metricStats}>
                  {platform.stats.map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
                </dl>
                {platform.insight && <p className={s.metricInsight}><strong>{platform.insight[0]}</strong>{platform.insight[1]}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 05 Perfil de audiencia */}
      <section className={`${base.section} ${base.sectionSoft}`} id="perfil">
        <div className={base.shell}>
          <Heading title="Una audiencia adulta dentro y fuera de Honduras." />
          <div className={s.profile}>
            <div className={s.profileStat}>
              <strong>44.4%</strong>
              <p>de la audiencia analizada se encuentra entre los 35 y 54 años.</p>
            </div>
            <div>
              <p className={s.label}>Principales países</p>
              <ul className={s.countries}>
                {countries.map(([country, share]) => (
                  <li className={s.country} key={country}>
                    <span>{country}</span><strong>{share}%</strong>
                    <i aria-hidden="true" style={{ '--share': `${(share / countries[0][1]) * 100}%` } as CSSProperties} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className={s.profileNote}>Datos demográficos correspondientes a la audiencia de Instagram analizada.</p>
        </div>
      </section>

      {/* 06 Invitados */}
      <section className={base.section} id="invitados">
        <div className={base.shell}>
          <Heading title="Personas que ya han pasado por Cluster Podcast" />
          <ul className={s.guests} tabIndex={0} aria-label="Invitados de Cluster Podcast">
            {guests.map((guest) => (
              <li className={s.guest} key={guest.name}>
                {guest.image
                  ? <Image src={guest.image} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 76vw" style={{ objectPosition: guest.position }} />
                  : <span className={s.guestInitials} aria-hidden="true">{guest.name.split(' ').filter((word) => word[0] === word[0].toUpperCase()).map((word) => word[0]).join('').slice(0, 2)}</span>}
                <span className={s.guestName}>{guest.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 07 Cómo funciona */}
      <section className={`${base.section} ${base.sectionSoft}`} id="como-funciona">
        <div className={base.shell}>
          <Heading title="Así funciona tu participación" />
          <ol className={s.steps}>
            {steps.map(([title, detail], i) => (
              <li className={s.step} key={title}><span className={s.index}>0{i + 1}</span><h3>{title}</h3><p>{detail}</p></li>
            ))}
          </ol>
          <div className={`${s.ctaRow} ${s.sectionCta}`} data-wa-hide><BookLink at="como-funciona" /></div>
        </div>
      </section>

      {/* 08 Inversión */}
      <section className={s.invest} id="inversion">
        <div className={`${base.shell} ${s.investGrid}`}>
          <div>
            <p className={s.label}>Participación en Cluster Podcast</p>
            <h2 className={s.investTitle}>Convierte tu historia en contenido.</h2>
            <div className={s.investAmount}>
              <p className={s.label}>Inversión</p>
              <p className={s.investPrice}>{PRICE}</p>
              <p className={s.investCaption}>Tarifa especial para emprendedores y empresas medianas.</p>
            </div>
          </div>
          <div>
            <p className={s.label}>Incluye</p>
            <ul className={s.investList}>
              {investIncludes.map((item) => <li key={item}><Icon name="check" size={20} />{item}</li>)}
            </ul>
            <div className={s.ctaRow} data-wa-hide>
              <BookLink at="inversion" />
              <WhatsAppLink at="inversion" label="Tengo una pregunta por WhatsApp" className={`${base.buttonSecondary} ${s.onLight}`} />
            </div>
          </div>
        </div>
      </section>

      {/* 09 Opcionales */}
      <section className={base.section} id="opcionales">
        <div className={base.shell}>
          <Heading title="Opcionales" lead={`${PRICE} es el paquete completo. Lo siguiente es opcional y solo se agrega si lo necesitas.`} />
          <div className={s.optionals}>
            <article className={s.optional}>
              <span className={s.optionalTag}>Opcional</span>
              <h3>Clips para tus propias redes</h3>
              <p>Si tu emprendimiento o empresa quiere disponer de contenido editado para publicar directamente desde sus propias cuentas.</p>
              <div className={s.optionalPrice}><strong>+ L3,500</strong><span>5 clips adicionales</span></div>
              <ul>
                <li>Son adicionales a los clips publicados por Cluster.</li>
                <li>Se editan para ser entregados al cliente.</li>
                <li>Pueden utilizarse desde tus propias redes sociales.</li>
              </ul>
              <p className={s.optionalNote}>Los cinco clips incluidos en la participación se publican desde Cluster Podcast. Estos cinco clips opcionales se entregan al cliente para uso propio.</p>
            </article>
            <article className={s.optional}>
              <span className={s.optionalTag}>Opcional</span>
              <h3>Grabación fuera de San Pedro Sula</h3>
              <p>La inversión de {PRICE} contempla grabación en nuestro estudio en San Pedro Sula. Si la producción requiere que el equipo de Cluster Podcast se movilice fuera de San Pedro Sula:</p>
              <div className={s.optionalPrice}><strong>+ L3,000</strong><span>Producción fuera de San Pedro Sula</span></div>
              <p className={s.optionalNote}>Sujeto a coordinación previa y a condiciones especiales de desplazamiento cuando corresponda.</p>
            </article>
          </div>
        </div>
      </section>

      {/* 10 Por qué participar */}
      <section className={`${base.section} ${base.sectionSoft}`} id="beneficios">
        <div className={base.shell}>
          <Heading title="Una buena historia puede seguir trabajando después de la entrevista." />
          <ul className={s.benefits}>
            {benefits.map(([title, detail], i) => (
              <li className={s.benefit} key={title}><span className={s.index}>0{i + 1}</span><h3>{title}</h3><p>{detail}</p></li>
            ))}
          </ul>
        </div>
      </section>

      {/* 11 FAQ */}
      <section className={base.section} id="preguntas">
        <div className={base.shell}>
          <Heading title="Preguntas frecuentes" />
          <div className={`${base.faq} ${s.faqWrap}`}>
            {faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
          </div>
        </div>
      </section>

      {/* 12 CTA final + agenda */}
      <section className={s.finalCta}>
        <div className={s.finalMedia}>
          <Image src={photo('conversation-guest')} alt="" fill sizes="100vw" />
        </div>
        <div className={base.shell}>
          <h2 className={s.finalTitle}>Tu historia ya existe. Hagamos que más personas la conozcan.</h2>
          <div className={s.heroDeal}>
            <PriceTag eyebrow="Participación para emprendedores" />
            <div className={s.ctaRow} data-wa-hide><BookLink at="cta-final" /><WhatsAppLink at="cta-final" /></div>
          </div>
        </div>
      </section>

      <section className={`${base.section} ${base.sectionSoft}`} id="agenda" data-wa-hide>
        <div className={base.shell}>
          <Heading title="Agenda tu participación" lead="Elige la fecha y hora que mejor te funcione. Nuestro equipo confirmará contigo los detalles de la conversación y la producción." />
          <p className={s.agendaAlt}>¿Prefieres conversar antes? <a href={WHATSAPP} target="_blank" rel="noreferrer" data-track="participacion_whatsapp_click" data-track-location="agenda">Escríbenos por WhatsApp</a>.</p>
          <div className={`${base.calendar} ${s.agendaFrame}`}><DeferredBooking /></div>
        </div>
      </section>

      <footer className={base.footer}>
        <div className={`${base.shell} ${base.footerInner}`}>
          <span>© {new Date().getFullYear()} Cluster Podcast</span>
          <span>Una producción de Cluster Media</span>
        </div>
      </footer>
      <PageLayer whatsappHref={WHATSAPP} />
    </div>
  );
}
