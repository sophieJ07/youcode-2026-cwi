import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

const SUPPORTED = ['en', 'fr', 'ar', 'es'];

export default getRequestConfig(async () => {
  const store = await cookies();
  const raw = store.get('locale')?.value;
  const locale = SUPPORTED.includes(raw ?? '') ? raw! : 'en';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});