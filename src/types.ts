export interface Project {
  title: string;
  status: "released" | "inDev";
  subtitle: string;
  desc: string[];
  tech: string[];
  tags: string[];
  slug?: string;
  href?: string;
  current?: boolean;
}
