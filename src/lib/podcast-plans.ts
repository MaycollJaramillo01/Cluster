export const PODCAST_PARTICIPANT_PLANS = {
  entrepreneur: {
    id: 'entrepreneur',
    label: 'Emprendedor',
    detail: 'Para personas que están construyendo su proyecto.',
    amount: 30000,
    display: '$300',
    originalDisplay: '$600',
  },
  company: {
    id: 'company',
    label: 'Empresas, sociedades o multinacionales',
    detail: 'Para marcas con trayectoria, equipo y operación consolidada.',
    amount: 60000,
    display: '$600',
    originalDisplay: '',
  },
} as const;

export type PodcastParticipantPlanId = keyof typeof PODCAST_PARTICIPANT_PLANS;
export type PodcastParticipantPlan = (typeof PODCAST_PARTICIPANT_PLANS)[PodcastParticipantPlanId];

export const podcastParticipantPlanList: PodcastParticipantPlan[] = [
  PODCAST_PARTICIPANT_PLANS.entrepreneur,
  PODCAST_PARTICIPANT_PLANS.company,
];

export function resolvePodcastParticipantPlan(value: unknown): PodcastParticipantPlan | null {
  if (value === 'entrepreneur' || value === 'company') return PODCAST_PARTICIPANT_PLANS[value];
  return null;
}
