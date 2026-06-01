import { getTranslations, setRequestLocale } from "next-intl/server";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "about" });

  return (
    <div className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="border-t border-foreground/20 pt-5 text-[clamp(4rem,14vw,12rem)] font-medium leading-[0.78] tracking-normal">
        {t("title")}
      </h1>
      <p className="mt-10 max-w-3xl text-2xl leading-snug text-foreground/70">
        {t("intro")}
      </p>
      <p className="mt-6 text-sm text-foreground/45">{t("location")}</p>
    </div>
  );
}
