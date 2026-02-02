/**
 * Project status types
 */
export type ProjectStatus = "inDev" | "released" | "planning";

/**
 * Project data displayed on listing pages
 */
export interface Project {
  title: string;
  status: ProjectStatus;
  subtitle: string;
  desc: string[];
  tech: string[];
}

/**
 * Icon for profile metadata
 */
export interface IconMeta {
  icon: string;
  alt: string;
  content: string;
  href?: string;
}

/**
 * Education entry for about page
 */
export interface Education {
  name: string;
  location: string;
  role: string;
  period: string;
  desc: string[];
}

/**
 * Certificate entry for about page
 */
export interface Certificate {
  date: string;
  name: string;
  issuer: string;
}

/**
 * Club activity entry for about page
 */
export interface Club {
  period: string;
  name: string;
  topic: string;
  role: string;
  href?: string;
}

/**
 * Award entry for about page
 */
export interface Award {
  date: string;
  name: string;
  award: string;
}

/**
 * About page content
 */
export interface AboutPageContent {
  name: string;
  profileImage: string;
  shortDesc: string;
  iconsMeta: IconMeta[];
  educations: Education[];
  certificates: Certificate[];
  papers: string[];
  clubs: Club[];
  awards: Award[];
}

/**
 * Intro/hero section content
 */
export interface IntroContent {
  title: string;
  subtitle: string;
  desc: string[];
}
