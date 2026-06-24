import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ProjectCard } from "@/components/work/ProjectCard";
import { getProjects } from "@/lib/projects";

type WorkPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function WorkPage({ params }: WorkPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "work" });
  const projects = getProjects();

  return (
    <>
      <SiteHeader />
      <div className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-20 sm:px-6 lg:px-8">
        <header className="mb-14 grid gap-8 border-t border-foreground/20 pt-5 md:grid-cols-[0.45fr_1fr] md:items-end">
        <h1 className="text-[clamp(4rem,14vw,12rem)] font-medium leading-[0.78] tracking-normal">
          {t("title")}
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-foreground/62">
          {t("description")}
        </p>
        </header>

        <div className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
