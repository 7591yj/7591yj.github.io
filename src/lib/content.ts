import { getCollection, type CollectionEntry } from "astro:content";
import { getRelativeLocaleUrl } from "astro:i18n";
import { defaultLocale, type Locale } from "@/i18n/ui";

type Section = "blog" | "projects";

const translationCollections = {
  blog: "blogTranslations",
  projects: "projectTranslations",
} as const;

type TranslationCollection = (typeof translationCollections)[Section];

export interface LocalizedEntry<S extends Section> {
  slug: string;
  locale: Locale;
  url: string;
  /** Source data with the locale's translated fields applied. */
  data: CollectionEntry<S>["data"];
  /** The entry whose body is rendered for this locale. */
  source: CollectionEntry<S> | CollectionEntry<TranslationCollection>;
  /** Changes when the rendered body or any data shown on the page changes. */
  digest: string;
}

export type BlogPostEntry = LocalizedEntry<"blog">;
export type ProjectEntry = LocalizedEntry<"projects">;

// Entries only appear in a locale once they have been translated into it.
async function getLocalized<S extends Section>(
  section: S,
  locale: Locale,
): Promise<LocalizedEntry<S>[]> {
  const sources = (await getCollection(section)) as CollectionEntry<S>[];
  const url = (slug: string) =>
    getRelativeLocaleUrl(locale, `/${section}/${slug}`);

  if (locale === defaultLocale) {
    return sources.map((entry) => ({
      slug: entry.id,
      locale,
      url: url(entry.id),
      data: entry.data,
      source: entry,
      digest: String(entry.digest),
    }));
  }

  const bySlug = new Map(sources.map((entry) => [entry.id, entry]));
  const translations = await getCollection(
    translationCollections[section],
    ({ id }) => id.endsWith(`/${locale}`),
  );

  return translations.map((translation) => {
    const slug = translation.id.split("/")[0];
    const base = bySlug.get(slug);

    if (!base) {
      throw new Error(
        `src/content/${section}/${translation.id}.mdx has no ${defaultLocale}.mdx next to it`,
      );
    }

    const overrides = Object.fromEntries(
      Object.entries(translation.data).filter(([, value]) => value != null),
    );

    return {
      slug,
      locale,
      url: url(slug),
      data: { ...base.data, ...overrides },
      source: translation,
      digest: `${base.digest}:${translation.digest}`,
    };
  });
}

export async function getBlogPosts(locale: Locale): Promise<BlogPostEntry[]> {
  const posts = await getLocalized("blog", locale);
  return posts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );
}

export function getProjects(locale: Locale): Promise<ProjectEntry[]> {
  return getLocalized("projects", locale);
}

function toPaths<E extends LocalizedEntry<Section>>(entries: E[]) {
  return entries.map((entry) => ({
    params: { slug: entry.slug },
    props: { entry },
    cacheKey: entry.digest,
  }));
}

export async function getBlogPaths(locale: Locale) {
  return toPaths(await getBlogPosts(locale));
}

export async function getProjectPaths(locale: Locale) {
  return toPaths(await getProjects(locale));
}
