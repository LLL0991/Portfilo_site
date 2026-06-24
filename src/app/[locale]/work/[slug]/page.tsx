import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Link } from "@/i18n/navigation";
import { getProjectBySlug, getProjects } from "@/lib/projects";

type ProjectPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

type Locale = "zh" | "en";

const categoryTone = {
  display: "text-[#7ef3f0]",
  brand: "text-[#d9fb5a]",
  illustration: "text-[#ff61ce]",
  motion: "text-[#ff382e]",
  personal: "text-[#fff4e4]",
};

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {};
  }

  const localized = locale as Locale;

  return {
    title: `${project.title[localized]} — Liang Dai`,
    description: project.summary[localized],
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const localized = locale as Locale;
  const t = await getTranslations({ locale, namespace: "work" });
  const tone = categoryTone[project.category];

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-background text-foreground">
      <article className="mx-auto w-full max-w-[1500px] px-4 pb-20 pt-20 sm:px-6 lg:px-8">
        <Link
          href="/work"
          className="mb-8 inline-flex border border-foreground/20 px-3 py-2 text-xs uppercase tracking-[0.16em] text-foreground/62 transition-colors hover:border-accent hover:text-accent"
        >
          {t("back")}
        </Link>

        <header className="grid gap-8 border-t border-[#ff382e]/70 pt-5 lg:grid-cols-[0.58fr_0.42fr] lg:items-end">
          <div>
            <p className={`mb-4 font-mono text-xs uppercase tracking-[0.18em] ${tone}`}>
              {project.category} / {project.year}
            </p>
            <h1 className="max-w-[960px] text-[clamp(3.4rem,10vw,9.8rem)] font-semibold leading-[0.82] tracking-normal">
              {project.title[localized]}
            </h1>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-foreground/64 lg:justify-self-end">
            {project.detail.intro[localized]}
          </p>
        </header>

        <section className="mt-10 grid gap-5 lg:grid-cols-[0.66fr_0.34fr]">
          <div className="relative min-h-[360px] overflow-hidden rounded-[3px] border border-foreground/14 bg-foreground/8 sm:min-h-[520px]">
            <Image
              src={project.cover}
              alt={project.title[localized]}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(32,32,31,0.1),rgba(32,32,31,0.58))]" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-[#7ef3f0]/70 bg-background/72 px-2 py-1 font-mono text-[11px] text-[#7ef3f0] backdrop-blur"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <aside className="grid content-between gap-6 border border-[#ff382e]/70 p-5 [clip-path:polygon(0_0,100%_0,86%_12%,86%_74%,100%_88%,100%_100%,0_100%)]">
            <div>
              <p className="mb-8 text-xs uppercase tracking-[0.18em] text-[#ff382e]">
                {t("overview")}
              </p>
              <dl className="grid gap-5 text-sm">
                <div>
                  <dt className="mb-1 font-mono text-xs uppercase text-foreground/42">
                    Client
                  </dt>
                  <dd>{project.client}</dd>
                </div>
                <div>
                  <dt className="mb-1 font-mono text-xs uppercase text-foreground/42">
                    Timeline
                  </dt>
                  <dd>{project.timeframe}</dd>
                </div>
                <div>
                  <dt className="mb-1 font-mono text-xs uppercase text-foreground/42">
                    {t("role")}
                  </dt>
                  <dd>{project.role[localized]}</dd>
                </div>
              </dl>
            </div>

            <div>
              <p className="mb-3 font-mono text-xs uppercase text-foreground/42">
                {t("services")}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.services[localized].map((service) => (
                  <span
                    key={service}
                    className="border border-foreground/18 px-2 py-1 text-xs text-foreground/70"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-[0.32fr_0.68fr]">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#7ef3f0]">
            01 / Process notes
          </p>
          <div className="grid gap-8 md:grid-cols-2">
            {project.detail.sections.map((section, index) => (
              <section key={section.title.en} className="border-t border-foreground/18 pt-4">
                <p className="mb-8 font-mono text-xs text-foreground/40">
                  0{index + 1}
                </p>
                <h2 className="text-3xl font-medium leading-none">
                  {section.title[localized]}
                </h2>
                <p className="mt-5 text-base leading-relaxed text-foreground/62">
                  {section.body[localized]}
                </p>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-6 border-y border-[#ff382e]/60 py-8 lg:grid-cols-[0.32fr_0.68fr]">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#ff382e]">
            {t("outcome")}
          </p>
          <p className="max-w-4xl text-[clamp(1.8rem,4vw,4.2rem)] font-medium leading-[0.98] tracking-normal text-foreground">
            {project.detail.outcome[localized]}
          </p>
        </section>
      </article>
      </main>
      <SiteFooter />
    </>
  );
}
