export const PODCAST_BUSINESS_CATEGORIES = [
  'Construcción',
  'Comercio',
  'Restaurantes',
  'Servicios profesionales',
  'Tecnología',
  'Salud',
  'Educación',
  'Belleza',
  'Otros',
] as const;

export const PODCAST_BUSINESS_STAGES = [
  'Idea o en construcción',
  'Iniciando operaciones',
  'Negocio establecido',
] as const;

export const PODCAST_DESCRIPTION_MAX = 300;
export const PODCAST_OFFER_MAX = 300;
export const PODCAST_LOGO_MAX_BYTES = 2 * 1024 * 1024;

const PODCAST_LOGO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_LIMITS = {
  nombre: 120,
  email: 254,
  telefono: 40,
  historia: 900,
  empresa: 160,
  ciudad: 80,
  departamento: 80,
  redesSociales: 300,
  sitioWeb: 300,
} as const;

export type EditorialProfile = {
  nombre: string;
  email: string;
  telefono: string;
  historia: string;
  sinEmpresa: boolean;
  empresa: string;
  categoria: string;
  ciudad: string;
  departamento: string;
  descripcion: string;
  productos: string;
  redesSociales: string;
  sitioWeb: string;
  etapa: string;
  consentimientoDatos: true;
  aceptaOportunidades: boolean;
  logotipo: string;
};

export const EDITORIAL_FIELD_LABELS: Record<keyof EditorialProfile, string> = {
  nombre: 'Nombre',
  email: 'Correo',
  telefono: 'WhatsApp',
  historia: 'Historia',
  sinEmpresa: 'Todavía no tiene empresa',
  empresa: 'Empresa o emprendimiento',
  categoria: 'Categoría',
  ciudad: 'Ciudad',
  departamento: 'Departamento',
  descripcion: 'A qué se dedica',
  productos: 'Productos o servicios',
  redesSociales: 'Redes sociales',
  sitioWeb: 'Sitio web',
  etapa: 'Etapa del emprendimiento',
  consentimientoDatos: 'Consentimiento de datos',
  aceptaOportunidades: 'Acepta oportunidades de Cluster',
  logotipo: 'Logotipo',
};

function read(value: unknown) {
  return String(value ?? '').trim();
}

function checked(value: unknown) {
  return value === true || value === 'true' || value === 'on' || value === '1' || value === 'sí' || value === 'si';
}

function isCategory(value: string) {
  return (PODCAST_BUSINESS_CATEGORIES as readonly string[]).includes(value);
}

function isStage(value: string) {
  return (PODCAST_BUSINESS_STAGES as readonly string[]).includes(value);
}

export function isPodcastLogoType(type: string) {
  return (PODCAST_LOGO_TYPES as readonly string[]).includes(type);
}

export function podcastLogoContentType(file: { type: string; name: string }) {
  if (isPodcastLogoType(file.type)) return file.type;
  if (/\.png$/i.test(file.name)) return 'image/png';
  if (/\.webp$/i.test(file.name)) return 'image/webp';
  return 'image/jpeg';
}

export function podcastLogoError(file: { type: string; name: string; size: number }) {
  if (!file.size) return null;
  if (file.size > PODCAST_LOGO_MAX_BYTES) return 'logo_too_large' as const;
  const type = file.type === 'application/octet-stream' ? '' : file.type;
  const allowed = isPodcastLogoType(type) || (!type && /\.(jpe?g|png|webp)$/i.test(file.name));
  if (!allowed) return 'invalid_logo_type' as const;
  return null;
}

export function editorialLeadFromInput(input: Record<string, unknown>) {
  const nombre = read(input.nombre);
  const email = read(input.email).toLowerCase();
  const telefono = read(input.telefono);
  const historia = read(input.historia);
  const sinEmpresa = checked(input.sinEmpresa);
  const empresa = read(input.empresa);
  const categoria = read(input.categoria);
  const ciudad = read(input.ciudad);
  const departamento = read(input.departamento);
  const descripcion = read(input.descripcion);
  const productos = read(input.productos);
  const redesSociales = read(input.redesSociales);
  const sitioWeb = read(input.sitioWeb);
  const etapa = read(input.etapa);
  const digits = telefono.replace(/\D/g, '');

  if (!nombre || !email || !telefono || !historia || !ciudad || !departamento || !descripcion || !productos || (!sinEmpresa && !empresa)) {
    return { ok: false as const, error: 'missing_required_fields' };
  }
  if (!EMAIL_PATTERN.test(email)) return { ok: false as const, error: 'invalid_email' };
  if (digits.length < 8 || digits.length > 15) return { ok: false as const, error: 'invalid_phone' };
  if (!isCategory(categoria)) return { ok: false as const, error: 'invalid_category' };
  if (!isStage(etapa)) return { ok: false as const, error: 'invalid_stage' };
  if (descripcion.length > PODCAST_DESCRIPTION_MAX) return { ok: false as const, error: 'description_too_long' };
  if (productos.length > PODCAST_OFFER_MAX) return { ok: false as const, error: 'offer_too_long' };
  if (!checked(input.consentimientoDatos)) return { ok: false as const, error: 'consent_required' };

  const limited: Record<string, string> = {
    nombre,
    email,
    telefono,
    historia,
    empresa,
    ciudad,
    departamento,
    redesSociales,
    sitioWeb,
  };
  for (const [key, max] of Object.entries(FIELD_LIMITS) as [keyof typeof FIELD_LIMITS, number][]) {
    if (limited[key].length > max) return { ok: false as const, error: 'field_too_long' };
  }

  const data: EditorialProfile = {
    nombre,
    email,
    telefono,
    historia,
    sinEmpresa,
    empresa,
    categoria,
    ciudad,
    departamento,
    descripcion,
    productos,
    redesSociales,
    sitioWeb,
    etapa,
    consentimientoDatos: true,
    aceptaOportunidades: checked(input.aceptaOportunidades),
    logotipo: '',
  };

  return { ok: true as const, data };
}
