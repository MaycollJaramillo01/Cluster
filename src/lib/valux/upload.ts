import { put } from '@vercel/blob';

function token() {
  return (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN || '').trim();
}

export async function storedFile(formData: FormData, fileKey: string, urlKey?: string) {
  const pasted = urlKey ? String(formData.get(urlKey) ?? '').trim() : '';
  const file = formData.get(fileKey);
  if (!(file instanceof File) || file.size === 0 || file.size > 8 * 1024 * 1024) return pasted || null;
  const key = token();
  if (!key) return pasted || null;
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 80) || 'archivo';
  try {
    const blob = await put(`academia/${crypto.randomUUID()}-${safe}`, file, {
      access: 'public',
      token: key,
      contentType: file.type || undefined,
    });
    return blob.url;
  } catch {
    return pasted || null;
  }
}
