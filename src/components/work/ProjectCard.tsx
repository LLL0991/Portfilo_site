"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Project } from "@/types/project";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const locale = useLocale() as "zh" | "en";
  const t = useTranslations("work");

  return (
    <article className="group flex flex-col gap-4">
      <Link
        href="/work"
        className="relative block aspect-[4/3] overflow-hidden rounded-[2px] bg-foreground/8"
        aria-label={project.title[locale]}
      >
        <Image
          src={project.cover}
          alt={project.title[locale]}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </Link>
      <div className="space-y-3 border-t border-foreground/18 pt-4">
        <div className="flex items-center justify-between gap-4 font-mono text-xs text-foreground/45">
          <p>{project.year}</p>
          <p>{project.client}</p>
        </div>
        <h3 className="text-2xl font-medium leading-none">{project.title[locale]}</h3>
        <p className="text-sm leading-relaxed text-foreground/62">
          {project.summary[locale]}
        </p>
        <p className="text-xs uppercase tracking-[0.16em] text-accent">
          {t("comingSoon")}
        </p>
      </div>
    </article>
  );
}
