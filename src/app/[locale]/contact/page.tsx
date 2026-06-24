import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <>
      <SiteHeader />
      <div className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="border-t border-foreground/20 pt-5 text-[clamp(4rem,14vw,12rem)] font-medium leading-[0.78] tracking-normal">
          {t("title")}
        </h1>
        <p className="mt-8 text-xl text-foreground/60">{t("hint")}</p>

        <ul className="mt-14 grid gap-8 text-2xl md:grid-cols-2">
          <li className="border-t border-foreground/20 pt-5">
            <span className="block text-xs uppercase tracking-[0.18em] text-foreground/45">
              {t("email")}
            </span>
            <a
              href="mailto:liangisrhys@163.com"
              className="hover:underline underline-offset-4"
            >
              liangisrhys@163.com
            </a>
          </li>
          <li className="border-t border-foreground/20 pt-5">
            <span className="block text-xs uppercase tracking-[0.18em] text-foreground/45">
              {t("phone")}
            </span>
            <a href="tel:+8613002912581" className="hover:underline underline-offset-4">
              +86 130 0291 2581
            </a>
          </li>
        </ul>
      </div>
      <SiteFooter />
    </>
  );
}
