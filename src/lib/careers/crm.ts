import {
  MAX_NOTE_CHARS,
  MAX_TAGS,
  coerceStatus,
  isCareersJobSlug,
  type Application,
  type ApplicationEvent,
  type ApplicationNote,
  type ApplicationPatchInput,
  type ApplicationStatus,
} from './types';

const CLOSED: ApplicationStatus[] = ['hired', 'rejected', 'archived'];

export function emptyCrmFields(now = new Date().toISOString()) {
  return {
    rating: 0,
    tags: [] as string[],
    notes: [] as ApplicationNote[],
    events: [] as ApplicationEvent[],
    nextAction: '',
    nextActionAt: '',
    rejectionReason: '',
    updatedAt: now,
  };
}

export function normalizeApplication(raw: Partial<Application> | null | undefined): Application | null {
  if (!raw || typeof raw !== 'object') return null;
  const id = String(raw.id ?? '').trim();
  const name = String(raw.name ?? '').trim();
  if (!id || !name) return null;

  const jobSlugRaw = String(raw.jobSlug ?? '');
  const jobSlug = isCareersJobSlug(jobSlugRaw) ? jobSlugRaw : 'editor-de-video';
  const status = coerceStatus(String(raw.status ?? 'new')) ?? 'new';
  const rating = clampRating(raw.rating);
  const createdAt = String(raw.createdAt ?? new Date().toISOString());

  return {
    id,
    jobSlug,
    createdAt,
    updatedAt: String(raw.updatedAt || createdAt),
    name,
    email: String(raw.email ?? '').trim(),
    whatsapp: String(raw.whatsapp ?? '').trim(),
    country: String(raw.country ?? '').trim(),
    salaryUsd: String(raw.salaryUsd ?? '').trim(),
    portfolioUrl: String(raw.portfolioUrl ?? '').trim(),
    linkedin: String(raw.linkedin ?? '').trim(),
    files: Array.isArray(raw.files) ? raw.files : [],
    status,
    rating,
    tags: sanitizeTags(raw.tags),
    notes: Array.isArray(raw.notes) ? raw.notes.filter((note) => note?.id && note.text) : [],
    events: Array.isArray(raw.events) ? raw.events.filter((event) => event?.id) : [],
    nextAction: String(raw.nextAction ?? '').trim(),
    nextActionAt: normalizeDate(raw.nextActionAt),
    rejectionReason: String(raw.rejectionReason ?? '').trim(),
  };
}

export function applyApplicationPatch(
  current: Application,
  patch: ApplicationPatchInput,
  makeId: () => string = () => crypto.randomUUID(),
): Application {
  const now = new Date().toISOString();
  const actor = String(patch.actor ?? '').trim() || 'Equipo';
  const next = normalizeApplication(current);
  if (!next) return current;

  const events = [...next.events];
  let changed = false;

  if (patch.status !== undefined) {
    const status = coerceStatus(patch.status);
    if (status && status !== next.status) {
      events.push({
        id: makeId(),
        createdAt: now,
        type: 'status',
        actor,
        text: '',
        from: next.status,
        to: status,
      });
      next.status = status;
      changed = true;
    }
  }

  if (patch.rating !== undefined) {
    const rating = clampRating(patch.rating);
    if (rating !== next.rating) {
      events.push({
        id: makeId(),
        createdAt: now,
        type: 'rating',
        actor,
        text: String(rating),
        from: String(next.rating),
        to: String(rating),
      });
      next.rating = rating;
      changed = true;
    }
  }

  if (patch.tags) {
    const tags = sanitizeTags(patch.tags);
    if (tags.join('\0') !== next.tags.join('\0')) {
      events.push({
        id: makeId(),
        createdAt: now,
        type: 'tag',
        actor,
        text: tags.join(', ') || '—',
      });
      next.tags = tags;
      changed = true;
    }
  }

  if (patch.nextAction !== undefined || patch.nextActionAt !== undefined) {
    const nextAction =
      patch.nextAction !== undefined ? String(patch.nextAction).trim() : next.nextAction;
    const nextActionAt =
      patch.nextActionAt !== undefined ? normalizeDate(patch.nextActionAt) : next.nextActionAt;
    if (nextAction !== next.nextAction || nextActionAt !== next.nextActionAt) {
      events.push({
        id: makeId(),
        createdAt: now,
        type: 'followup',
        actor,
        text: [nextAction, nextActionAt].filter(Boolean).join(' · ') || '—',
      });
      next.nextAction = nextAction;
      next.nextActionAt = nextActionAt;
      changed = true;
    }
  }

  if (patch.rejectionReason !== undefined) {
    const rejectionReason = String(patch.rejectionReason).trim();
    if (rejectionReason !== next.rejectionReason) {
      next.rejectionReason = rejectionReason;
      changed = true;
    }
  }

  const noteText = String(patch.note?.text ?? '').trim().slice(0, MAX_NOTE_CHARS);
  if (noteText) {
    const author = String(patch.note?.author ?? actor).trim() || actor;
    const note: ApplicationNote = {
      id: makeId(),
      createdAt: now,
      author,
      text: noteText,
    };
    next.notes = [note, ...next.notes];
    events.push({
      id: makeId(),
      createdAt: now,
      type: 'note',
      actor: author,
      text: noteText,
    });
    changed = true;
  }

  if (!changed) return next;
  next.events = events.slice(-80);
  next.updatedAt = now;
  return next;
}

export function isClosedStatus(status: ApplicationStatus) {
  return CLOSED.includes(status);
}

export function isFollowUpDue(application: Application, today = todayStamp()) {
  if (!application.nextActionAt || isClosedStatus(application.status)) return false;
  return application.nextActionAt <= today;
}

export function isFollowUpOverdue(application: Application, today = todayStamp()) {
  if (!application.nextActionAt || isClosedStatus(application.status)) return false;
  return application.nextActionAt < today;
}

export function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function clampRating(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(5, Math.round(n)));
}

function sanitizeTags(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const item of value) {
    const tag = String(item ?? '').trim().slice(0, 32);
    const key = tag.toLowerCase();
    if (!tag || seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
    if (tags.length >= MAX_TAGS) break;
  }
  return tags;
}

function normalizeDate(value: unknown) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? '';
}
