'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { SUPPORTED_LOCALES } from '@/lib/locales';

export async function setLocaleCookie(locale: string) {
  if (!(SUPPORTED_LOCALES as string[]).includes(locale)) return;
  const store = await cookies();
  store.set('locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  revalidatePath('/', 'layout');
}