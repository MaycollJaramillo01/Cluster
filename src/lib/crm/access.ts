'use server';

import { redirect } from 'next/navigation';
import { clearSession, dashboardSession } from './session';

export async function dashboardUnlocked() {
  return (await dashboardSession()) !== null;
}

export async function logout() {
  await clearSession();
  redirect('/dashboard/login');
}
