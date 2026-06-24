import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-foreground/10">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center px-4 text-sm text-foreground/50 sm:px-6 lg:px-8">
        <p>{t("rights", { year })}</p>
      </div>
    </footer>
  );
}
