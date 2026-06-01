import projectsData from "@/content/projects/index.json";
import type { Project, ProjectCategory } from "@/types/project";

const projects = projectsData as Project[];

export function getProjects(): Project[] {
  return projects;
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getProjectsByCategory(
  category: ProjectCategory | "all",
): Project[] {
  if (category === "all") return projects;
  return projects.filter((p) => p.category === category);
}
