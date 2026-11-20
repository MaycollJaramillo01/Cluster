export const CURRENCY = 'HNL';
export const USD_HNL_RATE = 27;

export function usdToHnlCents(cents: number) {
  return Math.round(cents * USD_HNL_RATE);
}

export function hnlToUsdCents(cents: number) {
  return Math.round(cents / USD_HNL_RATE);
}

export function academyMoney(cents: number) {
  return new Intl.NumberFormat('es-HN', { style: 'currency', currency: CURRENCY, currencyDisplay: 'narrowSymbol' }).format((Number(cents) || 0) / 100);
}

export function splitCents(amountCents: number, commissionPercent: number) {
  const amount = Math.max(0, Math.round(amountCents));
  const rate = Math.min(100, Math.max(0, commissionPercent)) / 100;
  const fee = Math.round(amount * rate);
  return { amount, fee, seller: amount - fee };
}

export function periodYm(date = new Date()) {
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Tegucigalpa' }).slice(0, 7);
}

export function previousYm(period: string) {
  const [year, month] = period.split('-').map(Number);
  return month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, '0')}`;
}

export function payoutDueAt(period: string) {
  const [year, month] = period.split('-').map(Number);
  return new Date(year, month, 10, 23, 59, 59);
}

export function slugify(value: string) {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72);
  return slug || 'entrada';
}
