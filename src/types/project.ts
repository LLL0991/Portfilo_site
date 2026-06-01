export type ProjectCategory =
  | "display"
  | "brand"
  | "illustration"
  | "motion"
  | "personal";

export type Project = {
  slug: string;
  category: ProjectCategory;
  featured: boolean;
  year: number;
  client?: string;
  title: { zh: string; en: string };
  summary: { zh: string; en: string };
  tags: string[];
  cover: string;
};
