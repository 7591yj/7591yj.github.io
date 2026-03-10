import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const postSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const projectSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  status: z.string().optional(),
  current: z.boolean().optional(),
  category: z.string().optional(),
  tech: z.array(z.string()).default([]),
  images: z.array(z.string()).optional(),
});

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.mdx",
    base: "./src/pages/blog",
    retainBody: false,
  }),
  schema: postSchema,
});

const blogJa = defineCollection({
  loader: glob({
    pattern: "**/*.mdx",
    base: "./src/pages/ja/blog",
    retainBody: false,
  }),
  schema: postSchema,
});

const projects = defineCollection({
  loader: glob({
    pattern: "**/*.mdx",
    base: "./src/pages/projects",
    retainBody: false,
  }),
  schema: projectSchema,
});

const projectsJa = defineCollection({
  loader: glob({
    pattern: "**/*.mdx",
    base: "./src/pages/ja/projects",
    retainBody: false,
  }),
  schema: projectSchema,
});

export const collections = { blog, blogJa, projects, projectsJa };
