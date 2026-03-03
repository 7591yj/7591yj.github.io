export type ProjectStatus =
  | "released"
  | "in development"
  | "planned"
  | "prototype"
  | "paused"
  | "archived";

export interface Project {
  title: string;
  status: ProjectStatus;
  subtitle: string;
  desc: string[];
  tech: string[];
  tags: string[];
  images?: string[];
  slug: string;
  href?: string;
  current?: boolean;
  category?: "software" | "personal";
}
