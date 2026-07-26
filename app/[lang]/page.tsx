import { notFound } from "next/navigation";
import { TailorForm } from "@/components/tailor-form";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return <TailorForm locale={lang} dict={getDictionary(lang)} />;
}
