import type { Metadata } from "next";
import { cookies } from "next/headers";
import { KioskWellnessFlow } from "@/components/kiosk/kiosk-wellness-flow";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("KioskPage");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function KioskHomePage() {
  const store = await cookies();
  const locale = store.get('locale')?.value ?? 'en';
  return <KioskWellnessFlow locale={locale} />;
}
