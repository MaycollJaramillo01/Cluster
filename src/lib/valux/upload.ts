import { get, put } from '@vercel/blob';

function token() {
  return (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN || '').trim();
}

export async function storedFile(formData: FormData, fileKey: string, urlKey?: string, strictUpload = false) {
  const pasted = urlKey ? String(formData.get(urlKey) ?? '').trim() : '';
  const file = formData.get(fileKey);
  if (!(file instanceof File) || file.size === 0) return pasted || null;
  const key = token();
  if (!key || file.size > 8 * 1024 * 1024) {
    if (strictUpload) throw new Error('No se pudo subir el archivo');
    return pasted || null;
  }
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 80) || 'archivo';
  try {
    const blob = await put(`academia/${crypto.randomUUID()}-${safe}`, file, {
      access: 'public',
      token: key,
      contentType: file.type || undefined,
    });
    return blob.url;
  } catch (error) {
    if (strictUpload) throw error;
    return pasted || null;
  }
}

const privatePrefix = 'privado:';
const privatePath = /^academia\/materiales\/[0-9a-f-]{36}-[a-zA-Z0-9._-]+$/;
const privateToken = () => process.env.ACADEMIA_PRIVATE_BLOB_READ_WRITE_TOKEN?.trim();

export function isPrivateAcademiaAsset(value: string) {
  return value.startsWith(privatePrefix) && privatePath.test(value.slice(privatePrefix.length));
}

function assetUrl(value: string, origin: string) {
  if (!/^https?:\/\//i.test(value) && !(value.startsWith('/') && !value.startsWith('//') && !value.includes('\\'))) return null;
  try {
    const url = new URL(value, origin);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url : null;
  } catch {
    return null;
  }
}

export async function storedPrivateAsset(formData: FormData, fileKey: string, urlKey: string) {
  const file = formData.get(fileKey);
  if (!(file instanceof File) || file.size === 0) {
    const value = String(formData.get(urlKey) ?? '').trim();
    if (value && !assetUrl(value, 'https://www.cluster.marketing')) throw new Error('Enlace de material inválido');
    return value || null;
  }
  const key = privateToken();
  if (!key || file.size > 8 * 1024 * 1024) throw new Error('No se pudo subir el material al almacenamiento privado');
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 80) || 'archivo';
  const pathname = `academia/materiales/${crypto.randomUUID()}-${safe}`;
  await put(pathname, file, { access: 'private', token: key, contentType: 'application/octet-stream' });
  return `${privatePrefix}${pathname}`;
}

const noStore = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };

// Se invoca solo después de comprobar permisos para el recurso o producto.
export async function deliverAcademiaAsset(value: string, origin: string) {
  if (value.startsWith(privatePrefix)) {
    const pathname = value.slice(privatePrefix.length);
    const key = privateToken();
    if (!privatePath.test(pathname)) return new Response(null, { status: 404, headers: noStore });
    if (!key) return new Response(null, { status: 503, headers: noStore });
    const blob = await get(pathname, { access: 'private', token: key }).catch(() => undefined);
    if (!blob || blob.statusCode !== 200) return new Response(null, { status: blob === undefined ? 503 : 404, headers: noStore });
    const filename = pathname.slice('academia/materiales/'.length + 37);
    return new Response(blob.stream, {
      headers: { ...noStore, 'Content-Type': 'application/octet-stream', 'Content-Disposition': `attachment; filename="${filename}"` },
    });
  }
  // Los enlaces de terceros y archivos legacy siguen bajo las reglas de su proveedor.
  const url = assetUrl(value, origin);
  return url
    ? new Response(null, { status: 302, headers: { ...noStore, Location: url.href } })
    : new Response(null, { status: 404, headers: noStore });
}
