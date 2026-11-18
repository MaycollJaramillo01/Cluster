import { createHash } from 'crypto';

// Video de una clase listo para incrustar. Solo se llama cuando la persona ya tiene acceso a la clase.
//
// Bunny Stream (recomendado para contenido de pago): en la lección se pega "bunny:<id del video>"
// o la URL de Bunny (iframe.mediadelivery.net/embed/<biblioteca>/<video>). Con BUNNY_STREAM_TOKEN_KEY
// cargada, el enlace va firmado y vence a las 6 horas: copiarlo no sirve para verlo después ni fuera del sitio.
// Para que la firma se exija hay que activar "Token authentication" en la biblioteca de Bunny.
//
// YouTube y Vimeo se siguen aceptando, pero su enlace funciona fuera de la academia.

const BUNNY_HOSTS = /^https:\/\/(?:iframe|player)\.mediadelivery\.net\/(?:embed|play)\/(\d+)\/([0-9a-f-]{36})/i;
const BUNNY_ID = /^bunny:([0-9a-f-]{36})$/i;
const TOKEN_HOURS = 6;

export function bunnyVideo(url: string) {
  const value = url.trim();
  const short = value.match(BUNNY_ID);
  if (short) return { library: process.env.BUNNY_STREAM_LIBRARY_ID?.trim() || '', id: short[1].toLowerCase() };
  const full = value.match(BUNNY_HOSTS);
  if (full) return { library: full[1], id: full[2].toLowerCase() };
  return null;
}

// Firma de Bunny para el reproductor incrustado: SHA256_HEX(clave + id del video + vencimiento).
export function bunnyToken(key: string, videoId: string, expires: number) {
  return createHash('sha256').update(`${key}${videoId}${expires}`).digest('hex');
}

export function lessonEmbed(url: string, now = Date.now()) {
  if (!url) return '';
  const bunny = bunnyVideo(url);
  if (bunny) {
    if (!bunny.library) return '';
    const base = `https://iframe.mediadelivery.net/embed/${bunny.library}/${bunny.id}`;
    const key = process.env.BUNNY_STREAM_TOKEN_KEY?.trim();
    if (!key) return `${base}?preload=false`;
    const expires = Math.floor(now / 1000) + TOKEN_HOURS * 3600;
    return `${base}?token=${bunnyToken(key, bunny.id, expires)}&expires=${expires}&preload=false`;
  }
  if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]?.split('?')[0]}`;
  if (url.includes('watch?v=')) return `https://www.youtube.com/embed/${url.split('watch?v=')[1]?.split('&')[0]}`;
  if (url.includes('vimeo.com/')) return `https://player.vimeo.com/video/${url.split('vimeo.com/')[1]?.split('?')[0]}`;
  return '';
}
