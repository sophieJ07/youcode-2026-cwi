'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const SUPPORTED = ['en', 'fr', 'ar', 'es'];

export async function setLocaleCookie(locale: string) {
  if (!SUPPORTED.includes(locale)) return;
  const store = await cookies();
  store.set('locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  revalidatePath('/', 'layout');
}