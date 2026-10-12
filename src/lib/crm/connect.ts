import { getTokenResponse } from '@vercel/connect';

const CONNECTOR = 'neon/clustercrm';

let cachedUrl = '';
let cachedUntil = 0;

export async function connectionString() {
  if (cachedUrl && Date.now() < cachedUntil) return cachedUrl;

  try {
    const url = await fromConnect();
    if (url) return remember(url);
  } catch (error) {
    const fallback = envUrl();
    if (fallback) return fallback;
    const apiKey = envApiKey();
    if (apiKey) return remember(await uriFromNeonApi(apiKey));
    throw friendly(error);
  }

  return envUrl();
}

function remember(url: string) {
  cachedUrl = url;
  cachedUntil = Date.now() + 10 * 60 * 1000;
  return url;
}

function envUrl() {
  return (process.env.DATABASE_URL || process.env.POSTGRES_URL || '').trim();
}

function envApiKey() {
  const key = (process.env.NEON_API_KEY || '').trim();
  return key.startsWith('napi_') && key.length >= 20 ? key : '';
}

async function fromConnect() {
  const response = await getTokenResponse(CONNECTOR, { subject: { type: 'app' } }, { forceRefresh: true });
  const direct =
    findPostgresUrl(response.token) ||
    findPostgresUrl(response.metadata) ||
    findPostgresUrl(response.claims);
  if (direct) return direct;
  const token = response.token.trim();
  const apiKey = token.startsWith('napi_') && token.length >= 20 ? token : envApiKey();
  if (!apiKey) {
    throw new Error(
      `El conector neon/clustercrm tiene una clave de ${token.length} caracteres. En Vercel abre Connect, edita ese conector y pega la API key de Neon, que empieza por napi_. En local también puedes definir NEON_API_KEY.`,
    );
  }
  return uriFromNeonApi(apiKey);
}

function friendly(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/OIDC|VERCEL_OIDC_TOKEN|Unable to get authentication/i.test(message)) {
    return new Error('Falta VERCEL_OIDC_TOKEN. En local corre vercel env pull. En Vercel el token llega solo.');
  }
  return error instanceof Error ? error : new Error(message);
}

async function uriFromNeonApi(apiKey: string) {
  const headers = { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' };
  const projects = await listProjects(headers);
  const list = projects.projects || [];
  const project = list.find((item) => /cluster/i.test(item.name)) || list[0];
  if (!project) throw new Error('Neon no devolvió ningún proyecto.');

  const branches = await neonJson<{ branches?: { id: string; primary?: boolean; default?: boolean }[] }>(
    `https://console.neon.tech/api/v2/projects/${project.id}/branches`,
    headers,
  );
  const branch = (branches.branches || []).find((item) => item.primary || item.default) || branches.branches?.[0];
  if (!branch) throw new Error('Neon no devolvió una rama.');

  const databases = await neonJson<{ databases?: { name: string; owner_name?: string }[] }>(
    `https://console.neon.tech/api/v2/projects/${project.id}/branches/${branch.id}/databases`,
    headers,
  );
  const database = databases.databases?.[0];
  if (!database) throw new Error('Neon no devolvió una base.');

  const params = new URLSearchParams({
    branch_id: branch.id,
    database_name: database.name,
    role_name: database.owner_name || database.name,
    pooled: 'true',
  });
  const uri = await neonJson<{ uri?: string }>(
    `https://console.neon.tech/api/v2/projects/${project.id}/connection_uri?${params}`,
    headers,
  );
  if (!uri.uri) throw new Error('Neon no devolvió la cadena de conexión.');
  return uri.uri;
}

async function listProjects(headers: Record<string, string>) {
  const configured = (process.env.NEON_ORG_ID || '').trim();
  if (configured) {
    return neonJson<{ projects?: { id: string; name: string }[] }>(
      `https://console.neon.tech/api/v2/projects?org_id=${encodeURIComponent(configured)}`,
      headers,
    );
  }

  const response = await fetch('https://console.neon.tech/api/v2/projects', { headers, cache: 'no-store' });
  if (response.status === 400) {
    const body = await response.text();
    if (/org_id is required/i.test(body)) {
      const orgs = await neonJson<{ organizations?: { id: string }[] }>(
        'https://console.neon.tech/api/v2/users/me/organizations',
        headers,
      );
      const org = orgs.organizations?.[0];
      if (!org) throw new Error('Neon pidió una organización y no devolvió ninguna.');
      return neonJson<{ projects?: { id: string; name: string }[] }>(
        `https://console.neon.tech/api/v2/projects?org_id=${encodeURIComponent(org.id)}`,
        headers,
      );
    }
    throw new Error('Neon respondió 400 al pedir la base.');
  }
  if (!response.ok) throw new Error(`Neon respondió ${response.status} al pedir la base.`);
  return (await response.json()) as { projects?: { id: string; name: string }[] };
}

async function neonJson<T>(url: string, headers: Record<string, string>) {
  const response = await fetch(url, { headers, cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Neon respondió ${response.status} al pedir la base.`);
  }
  return (await response.json()) as T;
}

function findPostgresUrl(value: unknown, depth = 0): string {
  if (depth > 4 || value == null) return '';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^postgres(ql)?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return findPostgresUrl(JSON.parse(trimmed) as unknown, depth + 1);
      } catch {
        return '';
      }
    }
    return '';
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const built = buildFromParts(record);
    if (built) return built;
    for (const nested of Object.values(record)) {
      const found = findPostgresUrl(nested, depth + 1);
      if (found) return found;
    }
  }
  return '';
}

function buildFromParts(record: Record<string, unknown>) {
  const host = text(record.host || record.hostname || record.pghost || record.PGHOST);
  const user = text(record.user || record.role || record.pguser || record.PGUSER);
  const password = text(record.password || record.pgpassword || record.PGPASSWORD);
  const database = text(record.database || record.dbname || record.pgdatabase || record.PGDATABASE);
  if (!host || !user || !password || !database) return '';
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}/${database}?sslmode=require`;
}

function text(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}
