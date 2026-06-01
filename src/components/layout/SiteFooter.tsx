import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-foreground/10 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 text-sm text-foreground/50">
        <p>{t("rights", { year })}</p>
      </div>
    </footer>
  );
}
