export interface Project {
  title: string;
  status: string;
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
