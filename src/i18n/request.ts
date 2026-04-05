import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { SUPPORTED_LOCALES } from '@/lib/locales';

export default getRequestConfig(async () => {
  const store = await cookies();
  const raw = store.get('locale')?.value;
  const locale = (SUPPORTED_LOCALES as string[]).includes(raw ?? '') ? raw! : 'en';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});