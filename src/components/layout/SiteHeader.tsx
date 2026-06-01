"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const navItems = [
  { href: "/work", key: "work" as const },
  { href: "/about", key: "about" as const },
  { href: "/contact", key: "contact" as const },
];

export function SiteHeader() {
  const t = useTranslations("nav");
  const tLocale = useTranslations("locale");
  const locale = useLocale();
  const pathname = usePathname();

  const otherLocale = locale === "zh" ? "en" : "zh";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-foreground/15 bg-background/72 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-medium uppercase tracking-[0.18em]">
          L!ang Dai
        </Link>

        <nav className="flex items-center gap-4 text-xs uppercase tracking-[0.14em] sm:gap-6">
          {navItems.map(({ href, key }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={key}
                href={href}
                className={
                  active
                    ? "text-accent"
                    : "text-foreground/60 transition-colors hover:text-foreground"
                }
              >
                {t(key)}
              </Link>
            );
          })}

          <Link
            href={pathname}
            locale={otherLocale}
            className="border border-foreground/20 px-2.5 py-1 text-[11px] text-foreground/70 transition-colors hover:border-accent hover:text-accent"
          >
            {tLocale(otherLocale)}
          </Link>
        </nav>
      </div>
    </header>
  );
}
