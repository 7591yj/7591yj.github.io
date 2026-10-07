import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { defaultLocale } from "./i18n/ui";

// Default-locale entries own shared metadata; translations contain only localized fields.

const postSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.string(),
  tags: z.array(z.string()).optional(),
});

const projectSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  year: z.number(),
  status: z.enum([
    "released",
    "in development",
    "planned",
    "prototype",
    "paused",
    "archived",
  ]),
  current: z.boolean().optional(),
  tech: z.array(z.string()).default([]),
  thumbnail: z.string().optional(),
  images: z.array(z.string()).optional(),
  link: z.string().optional(),
  links: z
    .array(z.object({ label: z.string().optional(), href: z.url() }))
    .optional(),
});

const postTranslationSchema = z.strictObject({
  title: z.string(),
  description: z.string().optional(),
});

const projectTranslationSchema = z.strictObject({
  title: z.string(),
  subtitle: z.string(),
});

function source(section: string) {
  return glob({
    pattern: `*/${defaultLocale}.mdx`,
    base: `./src/content/${section}`,
    generateId: ({ entry }) => entry.split("/")[0],
    retainBody: false,
    deferRender: true,
  });
}

function translations(section: string) {
  return glob({
    pattern: ["*/*.mdx", `!*/${defaultLocale}.mdx`],
    base: `./src/content/${section}`,
    generateId: ({ entry }) => entry.replace(/\.mdx$/, ""),
    retainBody: false,
    deferRender: true,
  });
}

export const collections = {
  blog: defineCollection({ loader: source("blog"), schema: postSchema }),
  blogTranslations: defineCollection({
    loader: translations("blog"),
    schema: postTranslationSchema,
  }),
  projects: defineCollection({
    loader: source("projects"),
    schema: projectSchema,
  }),
  projectTranslations: defineCollection({
    loader: translations("projects"),
    schema: projectTranslationSchema,
  }),
};
