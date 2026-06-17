import { NextResponse } from 'next/server';
import { site } from '@/lib/site';

export const runtime = 'nodejs';
export const maxDuration = 40;

type AuditStatus = 'ok' | 'warning' | 'critical';

type AuditItem = {
  title: string;
  detail: string;
  impact?: string;
  effort?: string;
  status?: AuditStatus;
};

type SeoAuditResult = {
  score: number;
  summary: string;
  quickWins: string[];
  priorities: AuditItem[];
  technical: AuditItem[];
  content: AuditItem[];
  localSeo: AuditItem[];
  conversion: AuditItem[];
  nextSteps: string[];
};

type PageSnapshot = {
  url: string;
  finalUrl: string;
  status: number;
  loadTimeMs: number;
  title: string;
  metaDescription: string;
  canonical: string;
  h1s: string[];
  h2s: string[];
  wordCount: number;
  images: number;
  imagesMissingAlt: number;
  internalLinks: number;
  externalLinks: number;
  textSample: string;
};

class PublicError extends Error {
  constructor(
    message: string,
    public status = 400
  ) {
    super(message);
  }
}

const DEFAULT_MODEL = 'openrouter/free';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const rawUrl = typeof body?.url === 'string' ? body.url.trim() : '';
    const businessType =
      typeof body?.businessType === 'string'
        ? body.businessType.trim().slice(0, 140)
        : '';

    if (!rawUrl) {
      throw new PublicError('Ingresa una URL para auditar.');
    }

    const targetUrl = normalizeAuditUrl(rawUrl);
    const page = await fetchTargetPage(targetUrl);
    const snapshot = extractSnapshot(
      page.html,
      targetUrl.toString(),
      page.finalUrl,
      page.status,
      page.loadTimeMs
    );

    const audit = await generateAudit(snapshot, businessType);

    return NextResponse.json({
      ...audit,
      snapshot: {
        url: snapshot.url,
        finalUrl: snapshot.finalUrl,
        status: snapshot.status,
        loadTimeMs: snapshot.loadTimeMs,
        title: snapshot.title,
        metaDescription: snapshot.metaDescription,
        h1Count: snapshot.h1s.length,
        wordCount: snapshot.wordCount,
        images: snapshot.images,
        imagesMissingAlt: snapshot.imagesMissingAlt,
      },
    });
  } catch (error) {
    if (error instanceof PublicError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('SEO audit failed', error);
    return NextResponse.json(
      {
        error:
          'No se pudo completar la auditoria. Intenta de nuevo o prueba con otra URL.',
      },
      { status: 500 }
    );
  }
}

function normalizeAuditUrl(value: string) {
  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(value)
    ? value
    : `https://${value}`;
  let url: URL;

  try {
    url = new URL(withProtocol);
  } catch {
    throw new PublicError('La URL no tiene un formato valido.');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new PublicError('Solo se pueden auditar URLs http o https.');
  }

  if (isBlockedHost(url.hostname)) {
    throw new PublicError('No se puede auditar esa direccion.');
  }

  url.hash = '';
  return url;
}

function isBlockedHost(hostname: string) {
  const host = hostname.toLowerCase();

  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host === '0.0.0.0' ||
    host === '[::1]' ||
    host === '::1'
  ) {
    return true;
  }

  const ipv4 = host.match(/^(\d{1,3}\.){3}\d{1,3}$/);
  if (!ipv4) return false;

  const parts = host.split('.').map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return true;
  }

  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  );
}

async function fetchTargetPage(url: URL) {
  const controller = new AbortController();
  const started = Date.now();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml,text/plain;q=0.8,*/*;q=0.5',
        'User-Agent': `${site.name.replace(/\s+/g, '')}SeoAudit/1.0 (+${site.url})`,
      },
    });

    const contentType = response.headers.get('content-type') ?? '';
    if (
      !contentType.includes('text/html') &&
      !contentType.includes('application/xhtml+xml') &&
      !contentType.includes('text/plain')
    ) {
      throw new PublicError('La URL no parece devolver una pagina HTML.', 422);
    }

    const html = await response.text();
    if (!response.ok) {
      throw new PublicError(
        `La pagina respondio con estado ${response.status}.`,
        422
      );
    }

    return {
      html: html.slice(0, 250000),
      finalUrl: response.url || url.toString(),
      status: response.status,
      loadTimeMs: Date.now() - started,
    };
  } catch (error) {
    if (error instanceof PublicError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new PublicError('La pagina tardo demasiado en responder.', 408);
    }
    throw new PublicError('No se pudo leer la pagina indicada.', 422);
  } finally {
    clearTimeout(timeout);
  }
}

function extractSnapshot(
  html: string,
  url: string,
  finalUrl: string,
  status: number,
  loadTimeMs: number
): PageSnapshot {
  const withoutScripts = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ');

  const text = decodeEntities(withoutScripts.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

  const links = Array.from(html.matchAll(/<a\b[^>]*>/gi));
  const images = Array.from(html.matchAll(/<img\b[^>]*>/gi));
  const base = new URL(finalUrl);

  let internalLinks = 0;
  let externalLinks = 0;

  for (const link of links) {
    const href = readAttr(link[0], 'href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      continue;
    }

    try {
      const linkUrl = new URL(href, base);
      if (linkUrl.hostname === base.hostname) internalLinks += 1;
      else externalLinks += 1;
    } catch {
      // Ignore malformed hrefs.
    }
  }

  return {
    url,
    finalUrl,
    status,
    loadTimeMs,
    title: firstMatchText(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i),
    metaDescription: findMetaContent(html, 'description'),
    canonical: findCanonical(html),
    h1s: findHeadings(withoutScripts, 1),
    h2s: findHeadings(withoutScripts, 2),
    wordCount: text ? text.split(/\s+/).length : 0,
    images: images.length,
    imagesMissingAlt: images.filter((image) => {
      const alt = readAttr(image[0], 'alt');
      return !alt.trim();
    }).length,
    internalLinks,
    externalLinks,
    textSample: text.slice(0, 5000),
  };
}

async function generateAudit(snapshot: PageSnapshot, businessType: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new PublicError(
      'Falta configurar OPENROUTER_API_KEY en el servidor.',
      500
    );
  }

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const localChecks = buildLocalChecks(snapshot);
  const payload = {
    businessType: businessType || 'No especificado',
    ...snapshot,
    textSample: snapshot.textSample.slice(0, 4500),
    localChecks,
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': site.url,
      'X-OpenRouter-Title': site.name,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 1800,
      messages: [
        {
          role: 'system',
          content:
            'Eres un consultor SEO senior para negocios hispanos. Devuelve solo JSON valido, sin markdown. Prioriza hallazgos accionables, conversion, SEO local y claridad comercial.',
        },
        {
          role: 'user',
          content: `Audita esta pagina con los datos extraidos por el servidor. Responde en espanol con este schema exacto:
{
  "score": 0-100,
  "summary": "resumen breve",
  "quickWins": ["accion concreta"],
  "priorities": [{"title":"", "detail":"", "impact":"Alto|Medio|Bajo", "effort":"Bajo|Medio|Alto"}],
  "technical": [{"title":"", "detail":"", "status":"ok|warning|critical"}],
  "content": [{"title":"", "detail":"", "status":"ok|warning|critical"}],
  "localSeo": [{"title":"", "detail":"", "status":"ok|warning|critical"}],
  "conversion": [{"title":"", "detail":"", "status":"ok|warning|critical"}],
  "nextSteps": ["siguiente paso"]
}

Datos:
${JSON.stringify(payload, null, 2)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('OpenRouter error', response.status, detail.slice(0, 500));
    throw new PublicError(
      `OpenRouter respondio con estado ${response.status}.`,
      502
    );
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new PublicError('OpenRouter no devolvio contenido para la auditoria.', 502);
  }

  return normalizeAudit(parseJsonContent(content), snapshot);
}

function buildLocalChecks(snapshot: PageSnapshot): AuditItem[] {
  const titleLength = snapshot.title.length;
  const descriptionLength = snapshot.metaDescription.length;
  const loadSeconds = (snapshot.loadTimeMs / 1000).toFixed(1);

  return [
    {
      title: 'Titulo SEO',
      detail: snapshot.title
        ? `${titleLength} caracteres: ${snapshot.title}`
        : 'No se encontro etiqueta title.',
      status: !snapshot.title
        ? 'critical'
        : titleLength > 65 || titleLength < 25
          ? 'warning'
          : 'ok',
    },
    {
      title: 'Meta descripcion',
      detail: snapshot.metaDescription
        ? `${descriptionLength} caracteres: ${snapshot.metaDescription}`
        : 'No se encontro meta description.',
      status: !snapshot.metaDescription
        ? 'critical'
        : descriptionLength > 165 || descriptionLength < 70
          ? 'warning'
          : 'ok',
    },
    {
      title: 'H1',
      detail:
        snapshot.h1s.length === 1
          ? `1 H1 encontrado: ${snapshot.h1s[0]}`
          : `${snapshot.h1s.length} H1 encontrados.`,
      status:
        snapshot.h1s.length === 1
          ? 'ok'
          : snapshot.h1s.length === 0
            ? 'critical'
            : 'warning',
    },
    {
      title: 'Contenido visible',
      detail: `${snapshot.wordCount} palabras detectadas.`,
      status:
        snapshot.wordCount >= 450
          ? 'ok'
          : snapshot.wordCount >= 250
            ? 'warning'
            : 'critical',
    },
    {
      title: 'Imagenes con alt',
      detail: `${snapshot.imagesMissingAlt} de ${snapshot.images} imagenes sin texto alternativo.`,
      status:
        snapshot.images === 0 || snapshot.imagesMissingAlt === 0
          ? 'ok'
          : snapshot.imagesMissingAlt <= 2
            ? 'warning'
            : 'critical',
    },
    {
      title: 'Respuesta del sitio',
      detail: `Estado ${snapshot.status}; lectura en ${loadSeconds}s.`,
      status:
        snapshot.status >= 200 && snapshot.status < 300 && snapshot.loadTimeMs < 3500
          ? 'ok'
          : 'warning',
    },
  ];
}

function normalizeAudit(value: unknown, snapshot: PageSnapshot): SeoAuditResult {
  const localChecks = buildLocalChecks(snapshot);
  const fallbackScore = calculateLocalScore(snapshot);
  const parsed = isRecord(value) ? value : {};

  return {
    score: clampScore(Number(parsed.score) || fallbackScore),
    summary:
      typeof parsed.summary === 'string' && parsed.summary.trim()
        ? parsed.summary.trim()
        : 'Auditoria generada con senales tecnicas basicas de la pagina.',
    quickWins: normalizeStringArray(parsed.quickWins).slice(0, 5),
    priorities: normalizeItems(parsed.priorities).slice(0, 5),
    technical: normalizeItems(parsed.technical, localChecks).slice(0, 6),
    content: normalizeItems(parsed.content).slice(0, 5),
    localSeo: normalizeItems(parsed.localSeo).slice(0, 5),
    conversion: normalizeItems(parsed.conversion).slice(0, 5),
    nextSteps: normalizeStringArray(parsed.nextSteps).slice(0, 5),
  };
}

function parseJsonContent(content: string) {
  const clean = content
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(clean);
  } catch {
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(clean.slice(start, end + 1));
    }
    throw new PublicError('La respuesta de OpenRouter no fue JSON valido.', 502);
  }
}

function calculateLocalScore(snapshot: PageSnapshot) {
  let score = 100;
  if (!snapshot.title) score -= 16;
  if (snapshot.title && (snapshot.title.length < 25 || snapshot.title.length > 65)) {
    score -= 6;
  }
  if (!snapshot.metaDescription) score -= 16;
  if (
    snapshot.metaDescription &&
    (snapshot.metaDescription.length < 70 || snapshot.metaDescription.length > 165)
  ) {
    score -= 6;
  }
  if (snapshot.h1s.length === 0) score -= 14;
  if (snapshot.h1s.length > 1) score -= 7;
  if (snapshot.wordCount < 250) score -= 12;
  if (snapshot.wordCount >= 250 && snapshot.wordCount < 450) score -= 6;
  if (snapshot.images > 0) {
    score -= Math.min(10, snapshot.imagesMissingAlt * 2);
  }
  if (snapshot.loadTimeMs > 3500) score -= 8;
  return clampScore(score);
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string' && !!item.trim())
    .map((item) => item.trim());
}

function normalizeItems(value: unknown, fallback: AuditItem[] = []) {
  if (!Array.isArray(value)) return fallback;

  const items = value
    .filter(isRecord)
    .map((item) => ({
      title: typeof item.title === 'string' ? item.title.trim() : '',
      detail: typeof item.detail === 'string' ? item.detail.trim() : '',
      impact: typeof item.impact === 'string' ? item.impact.trim() : undefined,
      effort: typeof item.effort === 'string' ? item.effort.trim() : undefined,
      status: isAuditStatus(item.status) ? item.status : undefined,
    }))
    .filter((item) => item.title && item.detail);

  return items.length ? items : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAuditStatus(value: unknown): value is AuditStatus {
  return value === 'ok' || value === 'warning' || value === 'critical';
}

function firstMatchText(html: string, regex: RegExp) {
  const match = html.match(regex);
  return match ? cleanText(match[1]) : '';
}

function findHeadings(html: string, level: 1 | 2) {
  const matches = Array.from(
    html.matchAll(new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`, 'gi'))
  );

  return matches
    .map((match) => cleanText(match[1]))
    .filter(Boolean)
    .slice(0, 8);
}

function findMetaContent(html: string, name: string) {
  const tags = Array.from(html.matchAll(/<meta\b[^>]*>/gi));
  for (const tag of tags) {
    const metaName = readAttr(tag[0], 'name').toLowerCase();
    const property = readAttr(tag[0], 'property').toLowerCase();

    if (metaName === name || property === name || property === `og:${name}`) {
      return cleanText(readAttr(tag[0], 'content'));
    }
  }

  return '';
}

function findCanonical(html: string) {
  const tags = Array.from(html.matchAll(/<link\b[^>]*>/gi));
  for (const tag of tags) {
    if (readAttr(tag[0], 'rel').toLowerCase() === 'canonical') {
      return readAttr(tag[0], 'href');
    }
  }

  return '';
}

function readAttr(tag: string, attr: string) {
  const pattern = new RegExp(
    `${attr}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`,
    'i'
  );
  const match = tag.match(pattern);
  return decodeEntities(match?.[2] ?? match?.[3] ?? match?.[4] ?? '');
}

function cleanText(value: string) {
  return decodeEntities(value.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeEntities(value: string) {
  const named: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity: string) => {
    const lower = entity.toLowerCase();
    if (lower in named) return named[lower];

    if (lower.startsWith('#x')) {
      return String.fromCodePoint(Number.parseInt(lower.slice(2), 16));
    }

    if (lower.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(lower.slice(1), 10));
    }

    return `&${entity};`;
  });
}
