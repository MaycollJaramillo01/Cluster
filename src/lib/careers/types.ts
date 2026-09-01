export const CAREERS_JOB_SLUGS = ['editor-de-video'] as const;
export type CareersJobSlug = (typeof CAREERS_JOB_SLUGS)[number];

export const APPLICATION_STATUSES = [
  'new',
  'reviewing',
  'contacted',
  'archived',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

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

export type Application = {
  id: string;
  jobSlug: CareersJobSlug;
  createdAt: string;
  name: string;
  email: string;
  whatsapp: string;
  country: string;
  salaryUsd: string;
  portfolioUrl: string;
  linkedin: string;
  files: ApplicationAsset[];
  status: ApplicationStatus;
};

export const MAX_PORTFOLIO_FILES = 8;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 60 * 1024 * 1024;

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

export function publicAssetUrl(applicationId: string, fileId: string) {
  return `/api/careers/files/${applicationId}/${fileId}`;
}
