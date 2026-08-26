'use client';

import { Section, SectionHeading } from '@/components/ui/Section';
import { FAQ } from '@/components/blocks/FAQ';
import { ConversionCalculator } from './ConversionCalculator';
import { ContactBlock } from './ContactBlock';
import { LandingChrome } from './LandingChrome';
import { LandingHeroVideo } from '@/components/landings/LandingHeroVideo';
import { LandingNavChrome } from '@/components/landings/LandingNavChrome';
import { LandingDemoVideoSection } from '@/components/landings/LandingDemoVideoSection';
import { LandingProblemSection } from '@/components/landings/LandingProblemSection';
import { LandingSolutionSection } from '@/components/landings/LandingSolutionSection';
import { LandingCaseStudiesSection } from '@/components/landings/LandingCaseStudiesSection';
import { LandingHowItWorks } from '@/components/landings/LandingHowItWorks';
import { LandingPricingSection } from '@/components/landings/LandingPricingSection';
import { LandingNeedsQuiz } from '@/components/landings/LandingNeedsQuiz';
import {
  LandingSoundUnlockBanner,
  LandingVideoSyncProvider,
} from '@/components/landings/LandingVideoSync';
import { clinicasQuizQuestions } from '@/lib/landings/quiz';
import type { CountryConfig } from '@/lib/clinicas-esteticas/types';
import { countryCodes, countries } from '@/lib/clinicas-esteticas/countries';
import {
  benefits,
  calculatorNudge,
  caseStudySlugs,
  faqs,
  heroCopy,
  howItWorks,
  pricingBullets,
  problems,
  sections,
} from '@/lib/clinicas-esteticas/content';
import { landingMedia } from '@/lib/landings/media';
import { trackEvent } from '@/lib/clinicas-esteticas/tracking';

type Props = {
  country: CountryConfig;
};

export function ClinicasEsteticasLanding({ country }: Props) {
  const waMsg = `Hola Cluster Media, vi la landing de clínicas estéticas (${country.name}) y quiero hablar sobre el sistema de conversión.`;

  const trackWa = (source: string) =>
    trackEvent('WhatsAppClick', { country: country.code, source });
  const trackCal = (source: string) =>
    trackEvent('ScheduleStart', { country: country.code, source });

  const countryLinks = countryCodes.map((code) => ({
    code,
    name: countries[code].name,
    path: countries[code].path,
  }));

  return (
    <LandingVideoSyncProvider enabled>
      <div className="clinicas-landing pt-[76px]">
      <LandingChrome country={country} />

      <LandingNavChrome
        verticalLabel="Clínicas estéticas"
        verticalPath="/clinicas-esteticas"
        countryName={country.name}
        countries={countryLinks}
        activeCode={country.code}
      />

      <LandingHeroVideo
        {...heroCopy}
        backgroundSrc={landingMedia.clinicas.heroBackground}
        posterSrc={landingMedia.clinicas.heroPoster}
        sideVideoSrc={landingMedia.clinicas.sideVideo}
        sidePosterSrc={landingMedia.clinicas.sidePoster}
        whatsappMessage={waMsg}
        onWhatsApp={() => trackWa('hero')}
        onSchedule={() => trackCal('hero')}
      />

      <LandingDemoVideoSection
        eyebrow={sections.video!.eyebrow}
        title={sections.video!.title}
        description={sections.video!.description}
        videoSrc={landingMedia.clinicas.demoVideo}
        posterSrc={landingMedia.clinicas.demoPoster}
      />

      <LandingSoundUnlockBanner />

      <LandingProblemSection copy={sections.problem} problems={problems} />

      <LandingSolutionSection
        copy={sections.solution}
        benefits={benefits}
        imageSrc={landingMedia.clinicas.solutionImage}
        imageAlt="Recepción de clínica estética atendiendo pacientes"
      />

      <LandingCaseStudiesSection copy={sections.cases} slugs={caseStudySlugs} />

      <LandingHowItWorks copy={sections.steps} steps={howItWorks} />

      <Section tone="dark" id="calculadora" density="compact">
        <SectionHeading
          eyebrow="Calculadora"
          title="¿Cuánto revenue podrías recuperar?"
          description="Estima el impacto de mejorar citas, asistencia y cierre. Opcional — no es requisito para contactarnos."
          align="center"
        />
        <div className="mt-8">
          <ConversionCalculator country={country} />
        </div>
        <LandingNeedsQuiz
          vertical="clinicas"
          countryName={country.name}
          countryCode={country.code}
          questions={clinicasQuizQuestions}
          nudge={calculatorNudge}
          whatsappBase={waMsg}
          onTrack={(name, payload) =>
            trackEvent(name as 'QuizStart', { country: country.code, ...payload })
          }
          onWhatsApp={(source) => trackWa(source)}
          onSchedule={(source) => trackCal(source)}
        />
      </Section>

      <LandingPricingSection
        copy={sections.pricing}
        bullets={pricingBullets}
        whatsappMessage={waMsg}
        onWhatsApp={() => trackWa('diagnostico')}
        onSchedule={() => trackCal('diagnostico')}
      />

      <Section tone="soft" id="contacto" density="compact">
        <SectionHeading
          eyebrow={sections.contact.eyebrow}
          title={sections.contact.title}
          description={sections.contact.description}
          align="center"
          titleClass="text-4xl sm:text-5xl lg:text-6xl"
        />
        <div className="mx-auto mt-8 max-w-2xl">
          <ContactBlock country={country} />
        </div>
      </Section>

      <Section tone="light" id="faq" density="compact">
        <SectionHeading eyebrow="FAQ" title="Preguntas frecuentes" align="center" />
        <div className="mx-auto mt-8 max-w-3xl">
          <FAQ items={[...faqs]} />
        </div>
      </Section>
      </div>
    </LandingVideoSyncProvider>
  );
}
