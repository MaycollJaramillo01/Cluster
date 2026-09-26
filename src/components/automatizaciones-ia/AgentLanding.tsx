'use client';

import { useEffect, useRef, useState, type ReactNode, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { animate, stagger } from 'animejs';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/ui/Logo';
import { Icon, type IconName } from '@/components/ui/Icon';
import { whatsappLink } from '@/lib/site';
import type { AgentContent } from './content';
import s from './AgentLanding.module.css';

const benefitIcons: IconName[] = ['clock', 'target', 'link', 'calendar'];
const capabilityIcons: IconName[] = ['whatsapp', 'target', 'clock', 'users', 'calendar', 'chart', 'link', 'arrow-right'];

function Arrow() { return <Icon name="arrow-right" size={17} strokeWidth={2} />; }

function Action({ children, href, light = false }: { children: ReactNode; href: string; light?: boolean }) {
  return <a className={`${s.button} ${light ? s.buttonLight : ''}`} href={href} target={href.startsWith('https:') ? '_blank' : undefined} rel={href.startsWith('https:') ? 'noopener noreferrer' : undefined}>{children}<Arrow /></a>;
}

function Chat({ en, stage = 0, compact = false }: { en: boolean; stage?: number; compact?: boolean }) {
  const conversations = en ? [
    ["Hi! I'd like information.", 'Of course. What service are you interested in?', 'Building a house.', 'Great. In which city would you like to build?'],
    ["I'm still reviewing the details.", 'Take your time. I can help with any questions.', 'Can we talk about the project?', 'Of course. Would you like to schedule a call?'],
    ["I'd like to schedule a call.", 'Does tomorrow at 10:00 a.m. work for you?', 'Yes, that works.', 'Done. Your appointment is scheduled. See you tomorrow.'],
  ] : [
    ['Hola, quisiera información.', '¡Claro! ¿Qué servicio te interesa?', 'Construcción de una casa.', 'Perfecto. ¿En qué ciudad sería el proyecto?'],
    ['Todavía estoy revisando los detalles.', 'Tomate tu tiempo. Te ayudo si tenés alguna duda.', '¿Podemos hablar del proyecto?', '¡Claro! ¿Te gustaría que coordinemos una llamada?'],
    ['Quisiera agendar una llamada.', '¿Te queda bien mañana a las 10:00 a. m.?', 'Sí, perfecto.', 'Listo. Tu cita está agendada. Nos vemos mañana.'],
  ];
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!body.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animation = animate(body.current.children, { opacity: [0, 1], translateY: [8, 0], delay: stagger(125), duration: 500, ease: 'outCubic' });
    return () => { animation.revert(); };
  }, [stage]);
  return <div className={`${s.chat} ${compact ? s.chatCompact : ''}`}>
    <div className={s.chatHeader}>
      <span className={s.chatBrand}><Icon name="whatsapp" size={20} fill="currentColor" strokeWidth={0} /></span>
      <div><b>{en ? 'Your business assistant' : 'Asistente de tu negocio'}</b><span>{en ? 'AI agent on WhatsApp' : 'Agente IA en WhatsApp'}</span></div>
      <span className={s.chatMenu} aria-hidden="true">•••</span>
    </div>
    <div className={s.chatMessages} ref={body}>
      <span className={s.chatDate}>{en ? 'SAMPLE CONVERSATION' : 'CONVERSACIÓN DE EJEMPLO'}</span>
      {conversations[stage].map((text, index) => <div className={index % 2 ? s.bubbleAgent : s.bubblePerson} key={`${stage}-${index}`}><p>{text}</p><small>{index % 2 ? <span aria-label={en ? 'Agent' : 'Agente'}>IA <span aria-hidden="true">✓✓</span></span> : (en ? 'Prospect' : 'Prospecto')}</small></div>)}
    </div>
    <div className={s.chatComposer} aria-hidden="true"><span>+</span><span>{en ? 'Your next conversation starts here' : 'Tu próxima conversación empieza acá'}</span><Arrow /></div>
  </div>;
}

export function AgentLanding({ content: c }: { content: AgentContent }) {
  const en = c.locale === 'en';
  const root = useRef<HTMLDivElement>(null);
  const industryButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const [stage, setStage] = useState(0);
  const [industry, setIndustry] = useState(0);
  const demoUrl = whatsappLink(en ? "Hi Cluster Media, I'd like a demo of an AI agent for my business." : 'Hola Cluster Media, quiero una demostración de un Agente IA para mi negocio.');
  const automateUrl = whatsappLink(en ? 'Hi, I want to automate my WhatsApp and follow up with my prospects.' : 'Hola, quiero automatizar mi WhatsApp y el seguimiento de mis prospectos.');
  const demoText = en ? 'Request a demo' : 'Solicitar demo';
  const activeIndustry = c.industries[industry];
  const stages = en ? ['Respond', 'Follow up', 'Schedule'] : ['Responde', 'Da seguimiento', 'Agenda'];
  const stageDetails = en ? [
    ['Every conversation has a starting point.', 'The agent answers questions and asks what it needs to understand the project. Your team gets the context.'],
    ['A pause does not have to be the end.', 'Configure the timing and tone of follow-up messages to resume conversations and keep opportunities moving.'],
    ['From interest to a scheduled call.', 'Connect your calendar so the agent can suggest available times and confirm the next step.'],
  ] : [
    ['Cada conversación tiene un punto de partida.', 'El agente responde consultas y hace las preguntas necesarias para entender el proyecto. Tu equipo recibe el contexto.'],
    ['Una pausa no tiene que ser el final.', 'Definimos los tiempos y el tono del seguimiento para retomar conversaciones y mantener activa cada oportunidad.'],
    ['Del interés a una llamada agendada.', 'Conectamos tu calendario para que el agente proponga horarios disponibles y confirme el siguiente paso.'],
  ];

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations: ReturnType<typeof animate>[] = [];
    let observer: IntersectionObserver | undefined;
    const stop = () => { observer?.disconnect(); animations.forEach(animation => animation.revert()); animations.length = 0; };
    const start = () => {
      stop();
      if (media.matches) return;
      animations.push(animate(element.querySelectorAll('[data-intro]'), { opacity: [0, 1], translateY: [12, 0], delay: stagger(80), duration: 650, ease: 'outCubic' }));
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animations.push(animate(entry.target, { opacity: [0, 1], translateY: [12, 0], duration: 650, ease: 'outCubic' }));
        observer?.unobserve(entry.target);
      }), { threshold: 0.08 });
      element.querySelectorAll('[data-reveal]').forEach(node => observer?.observe(node));
    };
    start();
    media.addEventListener('change', start);
    return () => { stop(); media.removeEventListener('change', start); };
  }, []);

  function changeIndustry(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % c.industries.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + c.industries.length - 1) % c.industries.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = c.industries.length - 1;
    else return;
    event.preventDefault();
    setIndustry(next);
    industryButtons.current[next]?.focus();
  }

  return <div className={s.page} ref={root}>
    <section className={`${s.container} ${s.hero}`} aria-labelledby="agent-title">
      <div className={s.heroCopy}>
        <p className={s.eyebrow} data-intro><Icon name="whatsapp" size={16} strokeWidth={0} fill="currentColor" />{c.hero.eyebrow}</p>
        <h1 id="agent-title" data-intro>{c.hero.title[0]}<br /><em>{c.hero.title[1]}</em></h1>
        <p className={s.heroDescription} data-intro>{c.hero.description}</p>
        <div className={s.heroActions} data-intro><Action href={automateUrl}>{c.hero.primary}</Action><a className={s.textLink} href="#como-funciona"><Icon name="play" size={15} fill="currentColor" strokeWidth={0} />{c.hero.secondary}</a></div>
        <p className={s.heroNote} data-intro>{c.hero.note}</p>
      </div>
      <div className={s.heroVisual} data-intro>
        <div className={s.modelBackdrop} aria-hidden="true" />
        <div className={s.phoneModel}><div className={s.phoneTop} aria-hidden="true"><span>9:41</span><span>••• ▰</span></div><Chat en={en} compact /><div className={s.phoneBottom} aria-hidden="true" /></div>
        <div className={s.followNote}><span className={s.noteIcon}><Icon name="calendar" size={20} strokeWidth={2} /></span><div><b>{en ? 'The conversation continues.' : 'La conversación sigue.'}</b><span>{en ? 'Follow-up is part of the process.' : 'El seguimiento es parte del proceso.'}</span></div><span className={s.noteCheck}>✓</span></div>
        <p className={s.demoLabel}>{en ? 'Illustrative demo. No real customer data.' : 'Demostración ilustrativa. Sin datos de clientes.'}</p>
      </div>
    </section>

    <section className={`${s.container} ${s.benefitBar}`} aria-label={en ? 'Benefits at a glance' : 'Beneficios principales'}>{c.benefits.map((benefit, index) => <div className={s.benefit} key={benefit.title}><Icon name={benefitIcons[index]} size={22} strokeWidth={2.2} /><div><h2>{benefit.title}</h2><p>{benefit.text}</p></div></div>)}</section>

    <section id="como-funciona" className={`${s.container} ${s.section}`} aria-labelledby="demo-title">
      <div className={s.centerHeading} data-reveal><p className={s.eyebrow}>{en ? 'A CONVERSATION THAT MOVES FORWARD' : 'UNA CONVERSACIÓN QUE AVANZA'}</p><h2 id="demo-title">{en ? 'From the first hello' : 'Del primer hola'}<br /><em>{en ? 'to the next step.' : 'al siguiente paso.'}</em></h2><p>{en ? 'Explore an example of how your agent responds, follows up and schedules.' : 'Explorá un ejemplo de cómo tu agente responde, da seguimiento y agenda.'}</p></div>
      <div className={s.demoBoard} data-reveal>
        <div className={s.demoExplanation}><div className={s.stageTabs} role="group" aria-label={en ? 'Conversation stage' : 'Etapa de la conversación'}>{stages.map((label, index) => <button key={label} type="button" aria-pressed={stage === index} onClick={() => setStage(index)}><span>{index + 1}</span>{label}</button>)}</div><div className={s.stageCopy} aria-live="polite"><span className={s.stageCount}>0{stage + 1} / 03</span><h3>{stageDetails[stage][0]}</h3><p>{stageDetails[stage][1]}</p></div><p className={s.demoDisclaimer}>{en ? 'Illustrative conversation. Each agent is configured for your business.' : 'Conversación ilustrativa. Cada agente se configura para tu negocio.'}</p><Action href={demoUrl}>{demoText}</Action></div>
        <div className={s.demoChat}><Chat en={en} stage={stage} /></div>
      </div>
    </section>

    <section className={s.softSection} aria-labelledby="problem-title"><div className={`${s.container} ${s.section}`}>
      <div className={s.sectionHeading} data-reveal><p className={s.eyebrow}>{en ? 'EVERY OPPORTUNITY COUNTS' : 'CADA OPORTUNIDAD CUENTA'}</p><h2 id="problem-title">{en ? 'Your prospects' : 'Tus prospectos'} <em>{en ? "won't wait." : 'no esperan.'}</em></h2></div>
      <div className={s.problemGrid}>{c.problems.map((problem, index) => <article key={problem.title} data-reveal><span className={s.problemSymbol} aria-hidden="true">{['↗', '…', '≋', '↺'][index]}</span><h3>{problem.title}</h3><p>{problem.text}</p></article>)}</div>
      <p className={s.problemConclusion}>{en ? "You don't always need more leads." : 'No siempre necesitás más leads.'}<br /><strong>{en ? 'You need to make more of the ones you already have.' : 'Necesitás aprovechar mejor los que ya tenés.'}</strong></p>
    </div></section>

    <section className={`${s.container} ${s.section} ${s.followSection}`} aria-labelledby="follow-title">
      <div className={s.followCopy} data-reveal><p className={s.eyebrow}>{en ? 'THE FOLLOW-UP MAKES THE DIFFERENCE' : 'EL DIFERENCIAL ESTÁ EN EL SEGUIMIENTO'}</p><h2 id="follow-title">{en ? 'A quick reply helps.' : 'Responder rápido ayuda.'}<br /><em>{en ? 'Following up sells.' : 'Dar seguimiento vende.'}</em></h2><p>{en ? 'A first conversation is often just the beginning. Your agent can keep the opportunity moving until your prospect is ready.' : 'Una primera conversación suele ser solo el comienzo. Tu agente puede mantener activa la oportunidad hasta que el prospecto esté listo.'}</p><a className={s.textLink} href="#precio">{en ? 'See the plan' : 'Conocé el plan'}<Arrow /></a></div>
      <ol className={s.journey} data-reveal>{(en ? ['New prospect', 'Immediate response', 'Qualification', 'Follow-up', 'Ongoing conversation', 'Appointment', 'Sales opportunity'] : ['Nuevo prospecto', 'Respuesta inmediata', 'Calificación', 'Seguimiento', 'Conversación activa', 'Agenda', 'Oportunidad de venta']).map((step, index) => <li key={step} className={index === 3 ? s.journeyFocus : ''}><span className={s.journeyMarker}>{index < 3 ? '✓' : String(index + 1).padStart(2, '0')}</span><span>{step}</span>{index === 3 && <small>{en ? 'Your agent keeps working' : 'Tu agente sigue trabajando'}</small>}</li>)}</ol>
    </section>

    <section id="beneficios" className={`${s.container} ${s.section} ${s.capabilitySection}`} aria-labelledby="benefits-title">
      <div className={s.sectionHeading} data-reveal><p className={s.eyebrow}>{en ? 'PART OF YOUR TEAM' : 'PARTE DE TU EQUIPO'}</p><h2 id="benefits-title">{en ? 'You focus on the business.' : 'Vos te enfocás en tu negocio.'}<br /><em>{en ? 'Your agent handles the conversation.' : 'Tu agente, en la conversación.'}</em></h2></div>
      <div className={s.capabilities}>{c.capabilities.map((capability, index) => <article key={capability.title} data-reveal><span className={s.capabilityIcon}><Icon name={capabilityIcons[index]} size={22} strokeWidth={2} /></span><h3>{capability.title}</h3><p>{capability.text}</p></article>)}</div>
    </section>

    <section className={s.softSection} aria-labelledby="comparison-title"><div className={`${s.container} ${s.section} ${s.comparisonLayout}`}>
      <div className={s.sectionHeading} data-reveal><p className={s.eyebrow}>{en ? 'SUPPORT FOR YOUR TEAM' : 'UN REFUERZO PARA TU EQUIPO'}</p><h2 id="comparison-title">{en ? 'More consistency.' : 'Más constancia.'}<br /><em>{en ? 'Less repetitive work.' : 'Menos tareas repetitivas.'}</em></h2><p>{en ? 'Let your agent take care of routine conversations so people can focus on the decisions that need them.' : 'Tu agente se encarga de las conversaciones repetitivas para que las personas se concentren donde más aportan.'}</p><Action href={demoUrl}>{demoText}</Action></div>
      <div className={s.comparison} data-reveal><table><caption className={s.srOnly}>{en ? 'AI agent and traditional support comparison' : 'Comparación de agente IA y atención tradicional'}</caption><thead><tr><th scope="col">{en ? 'Day to day' : 'En el día a día'}</th><th scope="col">{en ? 'AI agent' : 'Agente IA'}<small>{en ? 'From US$120/mo' : 'Desde US$120/mes'}</small></th><th scope="col">{en ? 'Traditional' : 'Tradicional'}</th></tr></thead><tbody>{c.comparison.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.ai}</td><td>{row.traditional}</td></tr>)}</tbody></table><p>{en ? 'Capabilities depend on the agreed configuration. The agent can hand over to your team.' : 'Las funciones dependen de la configuración acordada. El agente puede transferir la conversación a tu equipo.'}</p></div>
    </div></section>

    <section id="industrias" className={`${s.container} ${s.section}`} aria-labelledby="industry-title">
      <div className={s.centerHeading} data-reveal><p className={s.eyebrow}>{en ? 'YOUR BUSINESS, YOUR WAY' : 'TU NEGOCIO, TU FORMA DE ATENDER'}</p><h2 id="industry-title">{en ? 'Same technology.' : 'La misma tecnología.'}<br /><em>{en ? 'A process that fits you.' : 'Un proceso hecho para vos.'}</em></h2><p>{en ? 'Select your industry and see how an agent could support your business.' : 'Elegí tu industria y descubrí cómo puede ayudarte un agente.'}</p></div>
      <div className={s.industryBoard} data-reveal><div className={s.industryTabs} role="tablist" aria-label={en ? 'Industries' : 'Industrias'} aria-orientation="vertical">{c.industries.map((item, index) => <button ref={node => { industryButtons.current[index] = node; }} key={item.title} role="tab" id={`industry-tab-${index}`} aria-controls="industry-panel" aria-selected={index === industry} tabIndex={index === industry ? 0 : -1} onClick={() => setIndustry(index)} onKeyDown={event => changeIndustry(event, index)}><span>{item.title}</span><Arrow /></button>)}</div>
      <div className={s.industryPanel} id="industry-panel" role="tabpanel" aria-labelledby={`industry-tab-${industry}`} tabIndex={0}><p className={s.eyebrow}>{en ? 'EXAMPLE OF APPLICATION' : 'EJEMPLO DE APLICACIÓN'}</p><h3>{activeIndustry.title}</h3><p>{activeIndustry.description}</p><ul>{activeIndustry.questions.map(question => <li key={question}><Icon name="check" size={16} strokeWidth={2.5} />{question}</li>)}</ul><div className={s.industryOutcome}><Icon name="calendar" size={22} /><div><small>{en ? 'The next step' : 'El siguiente paso'}</small><b>{activeIndustry.outcome}</b></div></div><a className={s.textLink} href={whatsappLink(en ? `I'd like to learn about an AI agent for ${activeIndustry.title}.` : `Quiero conocer la solución de Agentes IA para ${activeIndustry.title}.`)} target="_blank" rel="noopener noreferrer">{en ? 'Talk about my business' : 'Hablemos de mi negocio'}<Arrow /></a></div></div>
    </section>

    <section className={`${s.container} ${s.caseSection}`} aria-labelledby="case-title" data-reveal>
      <div className={s.caseLogo}><Image src="/assets/logos/ink-express-transparent.png" alt="Ink Express" width={225} height={100} /></div><div className={s.caseCopy}><p className={s.eyebrow}>{en ? 'A CLUSTER MEDIA PROJECT' : 'UN PROYECTO DE CLUSTER MEDIA'}</p><h2 id="case-title">{en ? 'Conversations in order.' : 'Conversaciones en orden.'}</h2><p>{en ? 'For Ink Express, we worked on WhatsApp automation, CRM and follow-up to organize a high volume of inquiries.' : 'Para Ink Express, trabajamos automatización de WhatsApp, CRM y seguimiento para organizar un alto volumen de consultas.'}</p><Link className={s.textLink} href="/casos-de-exito">{en ? 'Explore our projects' : 'Conocé nuestros proyectos'}<Arrow /></Link></div>
    </section>

    <section className={`${s.container} ${s.section}`} aria-labelledby="implementation-title"><div className={s.sectionHeading} data-reveal><p className={s.eyebrow}>{en ? 'WE TAKE CARE OF THE SETUP' : 'NOS ENCARGAMOS DE PONERLO EN MARCHA'}</p><h2 id="implementation-title">{en ? 'Your business knowledge.' : 'El conocimiento de tu negocio.'}<br /><em>{en ? 'Our implementation.' : 'La implementación de nuestro lado.'}</em></h2></div><div className={s.steps}>{c.steps.map((step, index) => <article key={step.title} data-reveal><span>{String(index + 1).padStart(2, '0')}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div></section>

    <section id="precio" className={s.softSection} aria-labelledby="price-title"><div className={`${s.container} ${s.section} ${s.priceLayout}`}>
      <div className={s.priceHeading} data-reveal><p className={s.eyebrow}>{en ? 'A CLEAR STARTING POINT' : 'UN PUNTO DE PARTIDA CLARO'}</p><h2 id="price-title">{en ? 'Make room for' : 'Dale espacio a'}<br /><em>{en ? 'your next sale.' : 'tu próxima venta.'}</em></h2><p>{en ? 'Start with a dedicated agent for your business, connected to WhatsApp and ready to help your team.' : 'Empezá con un agente para tu negocio, conectado a WhatsApp y preparado para acompañar a tu equipo.'}</p><div className={s.priceNote}><Icon name="link" size={20} /><p>{en ? 'Implementation is quoted separately according to your business needs.' : 'La implementación se cotiza por separado según las necesidades de tu negocio.'}</p></div></div>
      <article className={s.priceCard} data-reveal><div className={s.priceCardHeader}><span>{en ? 'Your first AI agent' : 'Tu primer Agente IA'}</span><span className={s.planTag}>WhatsApp</span></div><div className={s.price}><small>{en ? 'From' : 'Desde'}</small><p><span>US$</span>120<small>{en ? '/month' : '/mes'}</small></p></div><ul>{c.planFeatures.map(feature => <li key={feature}><Icon name="check" size={17} strokeWidth={2.5} />{feature}</li>)}</ul><div className={s.planExtra}><span>Facebook + Instagram</span><b>+US$30<small>{en ? '/mo' : '/mes'}</small></b></div><Action href={demoUrl}>{demoText}</Action><p className={s.planFootnote}>{en ? 'We review your business before setting everything up.' : 'Revisamos tu negocio antes de configurar el agente.'}</p></article>
    </div></section>

    <section className={`${s.container} ${s.section} ${s.faqLayout}`} aria-labelledby="faq-title"><div className={s.sectionHeading} data-reveal><p className={s.eyebrow}>{en ? 'FREQUENTLY ASKED QUESTIONS' : 'PREGUNTAS FRECUENTES'}</p><h2 id="faq-title">{en ? 'Before' : 'Antes de'}<br /><em>{en ? 'we begin.' : 'empezar.'}</em></h2></div><div className={s.faqs} data-reveal>{c.faqs.map(faq => <details key={faq.q}><summary>{faq.q}<span className={s.faqPlus} aria-hidden="true" /></summary><p>{faq.a}</p></details>)}</div></section>

    <section className={`${s.container} ${s.final}`} aria-labelledby="final-title" data-reveal><p className={s.eyebrow}>{en ? 'YOUR NEXT CONVERSATION COUNTS' : 'TU PRÓXIMA CONVERSACIÓN CUENTA'}</p><h2 id="final-title">{en ? 'If someone reaches out,' : 'Si alguien escribe,'}<br /><em>{en ? 'someone responds.' : 'alguien responde.'}</em></h2><p>{en ? 'And if the conversation pauses, your agent follows up.' : 'Y si deja de responder, tu agente da seguimiento.'}</p><div className={s.finalActions}><Action href={demoUrl}>{demoText}</Action><a className={s.textLink} href={automateUrl} target="_blank" rel="noopener noreferrer">{en ? 'Talk on WhatsApp' : 'Hablar por WhatsApp'}<Arrow /></a></div></section>
    <footer className={`${s.container} ${s.footer}`}><div className={s.footerTop}><Logo variant="dark" /><p>{en ? 'Technology that takes care of your opportunities.' : 'Tecnología que trabaja tus oportunidades.'}</p><a className={s.backTop} href="#agent-title">{en ? 'Back to top' : 'Volver arriba'}<span aria-hidden="true">↑</span></a></div><div className={s.footerBottom}><span>© {new Date().getFullYear()} Cluster Media</span><div><Link href="/privacidad">{en ? 'Privacy policy' : 'Privacidad'}</Link><Link href="/terminos">{en ? 'Terms and conditions' : 'Términos y condiciones'}</Link><Link href="/contacto">{en ? 'Contact' : 'Contacto'}</Link></div></div></footer>
  </div>;
}
