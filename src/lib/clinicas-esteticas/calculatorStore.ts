const CALC_KEY = 'cm_clinicas_calculator';

export function getClinicasCalculatorSnapshot() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CALC_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function saveClinicasCalculatorSnapshot(data: Record<string, unknown>) {
  try {
    sessionStorage.setItem(CALC_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}
