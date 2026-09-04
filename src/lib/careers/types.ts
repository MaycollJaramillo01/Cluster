export const CAREERS_JOB_SLUGS = ['editor-de-video'] as const;
export type CareersJobSlug = (typeof CAREERS_JOB_SLUGS)[number];

export const PIPELINE_STATUSES = [
  'new',
  'screening',
  'interview',
  'test',
  'offer',
  'hired',
] as const;

export const PARKED_STATUSES = ['hold', 'rejected', 'archived'] as const;

export const APPLICATION_STATUSES = [
  ...PIPELINE_STATUSES,
  ...PARKED_STATUSES,
] as const;

export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];
export type ParkedStatus = (typeof PARKED_STATUSES)[number];
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const LEGACY_STATUS_MAP: Record<string, ApplicationStatus> = {
  reviewing: 'screening',
  contacted: 'interview',
};

export type ApplicationAssetField = 'portfolio' | 'cv';

export type ApplicationAsset = {
  id: string;
  field: ApplicationAssetField;
  originalName: string;
  mimeType: string;
  size: number;
  pathname: string;
  url?: string;
};

export type ApplicationNote = {
  id: string;
  createdAt: string;
  author: string;
  text: string;
};

export type ApplicationEventType = 'status' | 'note' | 'rating' | 'followup' | 'tag';

export type ApplicationEvent = {
  id: string;
  createdAt: string;
  type: ApplicationEventType;
  actor: string;
  text: string;
  from?: string;
  to?: string;
};

export type Application = {
  id: string;
  jobSlug: CareersJobSlug;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  whatsapp: string;
  country: string;
  salaryUsd: string;
  portfolioUrl: string;
  linkedin: string;
  files: ApplicationAsset[];
  status: ApplicationStatus;
  rating: number;
  tags: string[];
  notes: ApplicationNote[];
  events: ApplicationEvent[];
  nextAction: string;
  nextActionAt: string;
  rejectionReason: string;
};

export type ApplicationPatchInput = {
  status?: string;
  rating?: number;
  tags?: string[];
  nextAction?: string;
  nextActionAt?: string;
  rejectionReason?: string;
  note?: { author?: string; text: string };
  actor?: string;
};

export const MAX_PORTFOLIO_FILES = 8;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 60 * 1024 * 1024;
export const MAX_TAGS = 12;
export const MAX_NOTE_CHARS = 4000;

export const ALLOWED_PORTFOLIO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-m4v',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
] as const;

export const ALLOWED_CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
] as const;

export function isCareersJobSlug(value: string): value is CareersJobSlug {
  return (CAREERS_JOB_SLUGS as readonly string[]).includes(value);
}

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return (APPLICATION_STATUSES as readonly string[]).includes(value);
}

export function coerceStatus(value: string): ApplicationStatus | null {
  const mapped = LEGACY_STATUS_MAP[value] ?? value;
  return isApplicationStatus(mapped) ? mapped : null;
}

export function publicAssetUrl(applicationId: string, fileId: string) {
  return `/api/careers/files/${applicationId}/${fileId}`;
}

export type UserRole = 'owner' | 'member';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export type PublicUser = {
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};
