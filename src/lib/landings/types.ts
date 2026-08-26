export type LandingProblem = {
  title: string;
  text: string;
};

export type LandingBenefit = {
  title: string;
  text: string;
  highlight?: string;
};

export type LandingStep = {
  n: string;
  title: string;
  text: string;
};

export type LandingHeroContent = {
  eyebrow: string;
  /** Plain headline fallback when headlineNodes is not used */
  headline: string;
  /** Optional highlight phrase rendered in accent inside the H1 */
  headlineHighlight?: string;
  subheadline: string;
  /** Stat / promise under CTAs (can include HTML via separate nodes in component) */
  impactStat: string;
  impactStatHighlight?: string;
  calculatorLinkLabel: string;
  sideCaption?: string;
};

export type LandingSectionCopy = {
  problem: { eyebrow: string; title: string; description: string };
  solution: { eyebrow: string; title: string; description: string };
  cases: { eyebrow: string; title: string; description: string };
  steps: { eyebrow: string; title: string; description: string };
  pricing: { eyebrow: string; title: string; description: string };
  contact: { eyebrow: string; title: string; description: string };
  video?: { eyebrow: string; title: string; description: string };
};
