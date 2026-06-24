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
  role: { zh: string; en: string };
  timeframe: string;
  services: { zh: string[]; en: string[] };
  detail: {
    intro: { zh: string; en: string };
    sections: {
      title: { zh: string; en: string };
      body: { zh: string; en: string };
    }[];
    outcome: { zh: string; en: string };
  };
  tags: string[];
  cover: string;
  images?: string[];
  videos?: {
    src: string;
    poster?: string;
    title?: { zh: string; en: string };
  }[];
};
