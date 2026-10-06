import { Fragment, type CSSProperties, type ReactNode } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Icon, type IconName } from '@/components/ui/Icon';
import { base, type GrowthVertical } from './content';
import {
  Conversation,
  GrowthRuntime,
  HeroVideo,
  QualificationFormCta,
  VerticalVideo,
  type GrowthCtx,
} from './GrowthClient';
import s from './GrowthLanding.module.css';

const featureIcons: IconName[] = ['bolt', 'target', 'clock', 'chart', 'sparkles', 'calendar', 'megaphone'];

const index = (i: number) => String(i + 1).padStart(2, '0');
const order = (i: number) => ({ '--i': i }) as CSSProperties;

function Heading({
  id,
  eyebrow,
  title,
  lead,
  center,
}: {
  id: string;
  eyebrow?: string;
  /** Con dos líneas, la segunda va en verde. */
  title: string | string[];
  lead?: string;
  center?: boolean;
}) {
  const [first, second] = Array.isArray(title) ? title : [title];
  return (
    <div className={`${s.heading} ${center ? s.center : ''}`} data-reveal>
      {eyebrow && <p className={s.eyebrow}>{eyebrow}</p>}
      <h2 id={id}>
        <span>{first}</span>
        {second && <em>{second}</em>}
      </h2>
      {lead && <p className={s.lead}>{lead}</p>}
    </div>
  );
}

function Cta({
  ctx,
  cta,
  children,
  className = '',
}: {
  ctx: GrowthCtx;
  cta: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <QualificationFormCta ctx={ctx} cta={cta} className={`${s.cta} ${className}`}>
      <Icon name="arrow-right" size={19} strokeWidth={2} />
      {children}
    </QualificationFormCta>
  );
}

function Chain({ steps, focus }: { steps: string[]; focus?: number }) {
  return (
    <ol className={s.chain}>
      {steps.map((step, i) => (
        <li className={i === focus ? s.chainFocus : ''} key={step}>
          {step}
        </li>
      ))}
    </ol>
  );
}

export function GrowthLanding({ v }: { v: GrowthVertical }) {
  const ctx: GrowthCtx = {
    slug: v.slug,
    campaignId: v.campaignId,
  };
  const headline = v.hero.headline ?? base.hero.headline;
  const faqs = [...base.faq.items.slice(0, 2), ...v.faqs, ...base.faq.items.slice(2)];
  const highlightIndustry = v.slug === 'clinicas-esteticas' || v.slug === 'clinicas-odontologicas';
  const ideaImage = v.slug === 'clinicas-esteticas'
    ? {
        src: '/assets/stock/aesthetic-clinic-waiting-room.jpg',
        alt: 'Clientes conversan con la recepción en la sala de espera de una clínica estética.',
        position: 'center',
      }
    : v.hero.image;

  return (
    <div className={s.page} id="crecimiento">
      <GrowthRuntime ctx={ctx} />

      <header className={s.header}>
        <div className={`${s.container} ${s.headerInner}`}>
          <a className={s.brand} href="#inicio" aria-label="Cluster Media, volver al inicio de la página">
            <Image src="/assets/logo-white.webp" alt="" width={400} height={222} priority />
            <span>
              Cluster<small>Media</small>
            </span>
          </a>
          <nav className={s.nav} aria-label="Secciones de la página">
            {base.nav.map((item) => (
              <a href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <Cta ctx={ctx} cta="header" className={s.headerCta}>
            {base.cta.primary}
          </Cta>
        </div>
      </header>

      {/* 01 — Hero */}
      <section className={s.hero} id="inicio" aria-labelledby="hero-title" data-hide-sticky>
        <HeroVideo {...(v.hero.video ?? base.hero.video)} />
        <div className={`${s.container} ${s.heroInner}`}>
          <div className={s.heroCopy}>
            <p className={`${s.heroIndustry} ${highlightIndustry ? s.heroIndustryLight : ''}`}>{v.industryName}</p>
            <h1 id="hero-title">
              {headline.map((line) =>
                line.strong ? <em key={line.text}>{line.text}</em> : <span key={line.text}>{line.text}</span>,
              )}
            </h1>
            <p className={s.heroSub}>{v.hero.subheadline ?? base.hero.subheadline}</p>
            <p className={s.heroExclusive}>{base.hero.exclusivity}</p>
            <div className={s.heroActions}>
              <Cta ctx={ctx} cta="hero" className={s.ctaWide}>
                {base.cta.primary}
              </Cta>
              <p className={s.micro}>{base.hero.microcopy}</p>
            </div>
            <p className={s.legal}>{base.hero.legal}</p>
          </div>

          <figure className={s.heroPhoto}>
            <Image
              src={v.hero.image.src}
              alt={v.hero.image.alt}
              fill
              sizes="(min-width: 980px) 420px, 100vw"
              style={{ objectPosition: v.hero.image.position }}
            />
          </figure>
        </div>
      </section>

      {/* 02 — Video de la industria y asistente IA */}
      <section className={`${s.container} ${s.section} ${s.videoSection}`} aria-labelledby="video-title">
        <div className={s.videoLayout}>
          <div className={s.videoIntro}>
            <span className={s.videoRobotMark} aria-hidden="true">
              <Image src="/assets/agent-assistant-mark.png" alt="" width={72} height={72} />
            </span>
            <Heading id="video-title" eyebrow={base.video.eyebrow} title={base.video.title} lead={base.video.lead} />
          </div>
          <figure className={`${s.videoStage} ${v.video.portrait ? s.videoPortrait : ''}`} data-reveal>
            <VerticalVideo ctx={ctx} video={v.video} />
            <figcaption>
              <b>{v.video.title}</b>
              {v.video.description}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 03 — Identificación del problema */}
      <section className={`${s.container} ${s.section}`} aria-labelledby="pain-title">
        <Heading id="pain-title" eyebrow={base.pain.eyebrow} title={base.pain.title} lead={base.pain.lead} />
        <div className={s.cards}>
          {base.pain.cards.map((card, i) => (
            <article className={s.card} key={card.title} data-reveal>
              <span className={s.cardIndex}>{index(i)}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
        <div className={s.examples} data-reveal>
          <div>
            <p className={s.label}>
              {base.pain.examplesLabel} · {v.industryShortName}
            </p>
            <ul className={s.exampleList}>
              {v.pain.examples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </div>
          <p className={s.highlight}>{v.pain.highlight}</p>
        </div>
      </section>

      {/* 04 — La lógica antes de la garantía */}
      <section className={s.soft} aria-labelledby="idea-title">
        <div className={`${s.container} ${s.section} ${s.ideaLayout}`}>
          <div className={s.ideaCopy}>
            <Heading id="idea-title" eyebrow={base.idea.eyebrow} title={base.idea.title} lead={base.idea.lead} />
            <div className={s.math} data-reveal>
              <div className={s.mathRow}>
                <span className={s.mathNum}>100</span>
                <div>
                  <p className={s.label}>{base.idea.rows[0]}</p>
                  <div className={s.bar}>
                    <i style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
              <div className={s.mathRow}>
                <span className={s.mathNum}>X</span>
                <div>
                  <p className={s.label}>{base.idea.rows[1]}</p>
                  <div className={s.bar}>
                    <i className={s.barSales} style={{ width: '24%' }} />
                  </div>
                </div>
              </div>
              <div className={s.mathRow}>
                <span className={s.mathNum} aria-hidden="true" />
                <div>
                  <p className={s.label}>{base.idea.rows[2]}</p>
                  <div className={`${s.bar} ${s.barLost}`}>
                    <i className={s.barRecovered} style={{ width: '14%' }} />
                  </div>
                  <p className={s.recovered}>↑ {base.idea.recovered}</p>
                </div>
              </div>
            </div>
            <p className={s.conclusion} data-reveal>
              {base.idea.conclusion}
            </p>
            <p className={s.footnote}>{base.idea.note}</p>
          </div>
          <figure className={s.ideaImage} data-reveal>
            <Image
              src={ideaImage.src}
              alt={ideaImage.alt}
              fill
              sizes="(min-width: 900px) 42vw, 100vw"
              style={{ objectPosition: ideaImage.position }}
            />
          </figure>
        </div>
      </section>

      {/* 05 — El sistema */}
      <section className={`${s.container} ${s.section}`} id="como-funciona" aria-labelledby="system-title">
        <Heading id="system-title" eyebrow={base.system.eyebrow} title={base.system.title} lead={base.system.lead} />
        <ol className={s.steps} data-reveal>
          {base.system.steps.map((step, i) => (
            <li className={i >= 5 ? s.stepHuman : ''} style={order(i)} key={step.title}>
              <span className={s.stepNum}>{index(i)}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className={s.principle} data-reveal>
          <p>{base.system.principle}</p>
          <div className={s.actions}>
            <Cta ctx={ctx} cta="system">
              {base.cta.primary}
            </Cta>
            <a className={s.textLink} href="#garantia">
              {base.system.secondary}
              <Icon name="arrow-right" size={17} strokeWidth={2} />
            </a>
          </div>
        </div>
      </section>

      {/* 06 — Conversación simulada */}
      <section className={s.soft} aria-labelledby="chat-title">
        <div className={`${s.container} ${s.section} ${s.split}`}>
          <div>
            <Heading id="chat-title" eyebrow={base.conversation.eyebrow} title={base.conversation.title} />
            <p className={s.footnote}>{v.conversation.note ?? base.conversation.disclaimer}</p>
          </div>
          <Conversation
            title="Alex"
            subtitle={`Asistente · ${v.industryShortName}`}
            messages={v.conversation.messages}
            outcome={v.conversation.outcome}
          />
        </div>
      </section>

      {/* 07 — Qué hace el sistema */}
      <section className={`${s.container} ${s.section}`} aria-labelledby="features-title">
        <Heading id="features-title" eyebrow={base.features.eyebrow} title={base.features.title} />
        <div className={s.features} data-reveal>
          {base.features.cards.map((card, i) => (
            <article key={card.title}>
              <Icon name={featureIcons[i]} size={22} strokeWidth={2} />
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
          <QualificationFormCta ctx={ctx} cta="features" className={s.featureCta}>
            <span>{base.cta.primary}</span>
            <Icon name="arrow-right" size={22} strokeWidth={2} />
          </QualificationFormCta>
        </div>
        <div className={s.useCases} data-reveal>
          <p className={s.label}>
            {base.features.useCasesLabel} · {v.industryShortName}
          </p>
          <ul>
            {v.useCases.map((useCase) => (
              <li key={useCase}>{useCase}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* 08 — Momento humano */}
      <section className={s.soft} aria-labelledby="human-title">
        <div className={`${s.container} ${s.section} ${s.split}`}>
          <Heading id="human-title" eyebrow={base.human.eyebrow} title={base.human.title} lead={base.human.lead} />
          <div className={s.handoff} data-reveal>
            <Chain steps={base.human.chain} focus={2} />
            <div className={s.alert}>
              <p className={s.label}>
                <i aria-hidden="true" />
                {base.human.alertLabel}
              </p>
              <b>{base.human.alertTitle}</b>
              <p>{v.alert}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 09 — Inteligencia artificial */}
      <section className={`${s.container} ${s.section} ${s.split}`} aria-labelledby="ai-title">
        <div>
          <Heading id="ai-title" eyebrow={base.ai.eyebrow} title={base.ai.title} lead={base.ai.lead} />
          <p className={s.stance} data-reveal>
            {base.ai.stance}
          </p>
        </div>
        <div className={s.contrast} data-reveal>
          {base.ai.contrast.map((item, i) => (
            <div className={i === 1 ? s.contrastOn : ''} key={item.label}>
              <p className={s.label}>{item.label}</p>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 10 — Por qué puede generar crecimiento */}
      <section className={s.soft} aria-labelledby="growth-title">
        <div className={`${s.container} ${s.section}`}>
          <Heading id="growth-title" eyebrow={base.growth.eyebrow} title={base.growth.title} />
          <div className={s.pillars}>
            {base.growth.blocks.map((block) => (
              <article key={block.title} data-reveal>
                <h3>
                  <em>Más</em> {block.title}
                </h3>
                <p>{block.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 11 — La garantía */}
      <section className={`${s.container} ${s.section}`} id="garantia" aria-labelledby="guarantee-title">
        <div className={s.guarantee} data-reveal data-hide-sticky>
          <p className={s.guaranteeNumber} aria-hidden="true">
            <small>Hasta</small>20%
          </p>
          <div>
            <p className={s.eyebrow}>{base.guarantee.eyebrow}</p>
            <h2 id="guarantee-title">
              <span>{base.guarantee.title[0]}</span>
              <em>{base.guarantee.title[1]}</em>
            </h2>
            <p className={s.lead}>{base.guarantee.lead}</p>
            <p className={s.legal}>{base.guarantee.note}</p>
            <div className={s.actions}>
              <Cta ctx={ctx} cta="guarantee" className={s.ctaWide}>
                {base.cta.qualify}
              </Cta>
            </div>
          </div>
        </div>
        <h3 className={s.subheading}>{base.guarantee.reasonsTitle}</h3>
        <div className={`${s.cards} ${s.cards3}`}>
          {base.guarantee.reasons.map((reason, i) => (
            <article className={s.card} key={reason.title} data-reveal>
              <span className={s.cardIndex}>{index(i)}</span>
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 12 — No todos califican */}
      <section className={s.soft} aria-labelledby="qualify-title">
        <div className={`${s.container} ${s.section} ${s.split}`}>
          <div data-hide-sticky>
            <Heading id="qualify-title" eyebrow={base.qualify.eyebrow} title={base.qualify.title} lead={base.qualify.lead} />
            <Cta ctx={ctx} cta="qualify" className={s.ctaWide}>
              {base.cta.qualify}
            </Cta>
            <p className={s.micro}>{base.qualify.microcopy}</p>
          </div>
          <div className={s.criteria} data-reveal>
            <p className={s.label}>{base.qualify.criteriaLabel}</p>
            <ul>
              {base.qualify.criteria.map((criterion) => (
                <li key={criterion}>
                  <Icon name="check" size={18} strokeWidth={2.5} />
                  {criterion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 13 — Credibilidad */}
      <section className={`${s.container} ${s.section} ${s.split}`} aria-labelledby="trust-title">
        <Heading id="trust-title" eyebrow={base.trust.eyebrow} title={base.trust.title} lead={base.trust.lead} />
        <ul className={s.points} data-reveal>
          {base.trust.points.map((point, i) => (
            <li key={point}>
              <span>{index(i)}</span>
              {point}
            </li>
          ))}
        </ul>
      </section>

      {/* 14 — Casos */}
      <section className={s.soft} id="casos" aria-labelledby="cases-title">
        <div className={`${s.container} ${s.section}`}>
          <Heading id="cases-title" eyebrow={base.cases.eyebrow} title={base.cases.title} />
          <div className={`${s.cards} ${v.cases.length === 3 ? s.cards3 : s.cards2}`} data-reveal data-view-event="case_view">
            {v.cases.map((item) => (
              <article className={`${s.card} ${s.case}`} key={item.client}>
                <span className={s.cardIndex}>{item.industry}</span>
                <h3>{item.client}</h3>
                <dl>
                  {(['problem', 'work', 'result'] as const).map((key) => (
                    <Fragment key={key}>
                      <dt>{base.cases.labels[key]}</dt>
                      <dd>{item[key]}</dd>
                    </Fragment>
                  ))}
                </dl>
              </article>
            ))}
          </div>
          <p className={s.footnote}>{base.cases.note}</p>
        </div>
      </section>

      {/* 15 — FAQ */}
      <section className={`${s.container} ${s.section} ${s.split} ${s.faqLayout}`} id="preguntas" aria-labelledby="faq-title">
        <Heading id="faq-title" eyebrow={base.faq.eyebrow} title={base.faq.title} />
        <div className={s.faqs} data-reveal>
          {faqs.map((faq) => (
            <details key={faq.q}>
              <summary>
                {faq.q}
                <span className={s.faqPlus} aria-hidden="true" />
              </summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 16 — CTA final */}
      <section className={`${s.container} ${s.final}`} aria-labelledby="final-title" data-reveal data-hide-sticky>
        <p className={s.eyebrow}>{base.final.eyebrow}</p>
        <h2 id="final-title">{base.final.title}</h2>
        <p className={s.lead}>{base.final.lead}</p>
        <Cta ctx={ctx} cta="final" className={s.ctaWide}>
          {base.cta.final}
        </Cta>
        <p className={s.micro}>{base.final.microcopy}</p>
        <Chain steps={base.final.next} />
      </section>

      <footer className={`${s.container} ${s.footer}`} data-hide-sticky>
        <p>{base.hero.legal}</p>
        <div>
          <span>
            © {new Date().getFullYear()} Cluster Media · {base.footer.tagline}
          </span>
          <nav aria-label="Legal">
            <Link href="/privacidad">Privacidad</Link>
            <Link href="/terminos">Términos y condiciones</Link>
          </nav>
        </div>
      </footer>

      {/* CTA fijo en móvil: aparece al pasar el hero y se retira cuando hay otro CTA en pantalla */}
      <div className={s.sticky}>
        <Cta ctx={ctx} cta="sticky">
          {base.cta.sticky}
        </Cta>
      </div>
    </div>
  );
}
