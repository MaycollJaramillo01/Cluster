import fs from 'fs';
import path from 'path';

export type BrandManual = {
  slug: string;
  name: string;
  fileName: string;
  href: string;
  coverHref?: string;
};

const MANUALS_DIR = path.join(process.cwd(), 'public/assets/brand-manuals');
const COVER_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

function humanizeFileName(base: string) {
  return base
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b([a-zÁÉÍÓÚÑáéíóúñ])/gi, (char) => char.toUpperCase());
}

function findCover(files: string[], base: string) {
  const lowerBase = base.toLowerCase();
  for (const ext of COVER_EXTENSIONS) {
    const match = files.find(
      (file) => file.toLowerCase() === `${lowerBase}${ext}`,
    );
    if (match) {
      return `/assets/brand-manuals/${encodeURIComponent(match)}`;
    }
  }
  return undefined;
}

/** Lee automáticamente todos los PDF en public/assets/brand-manuals. */
export function getBrandManuals(): BrandManual[] {
  if (!fs.existsSync(MANUALS_DIR)) return [];

  const files = fs.readdirSync(MANUALS_DIR).filter((file) => !file.startsWith('.'));
  const pdfs = files
    .filter((file) => file.toLowerCase().endsWith('.pdf'))
    .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

  return pdfs.map((fileName) => {
    const base = fileName.replace(/\.pdf$/i, '');
    return {
      slug: base
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      name: humanizeFileName(base),
      fileName,
      href: `/assets/brand-manuals/${encodeURIComponent(fileName)}`,
      coverHref: findCover(files, base),
    };
  });
}
