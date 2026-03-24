import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";

const posts = defineCollection({
  name: "posts",
  directory: "src/routes/(post)",
  include: "**/*.mdx",
  parser: 'frontmatter-only',
  schema: z.object({
    date: z.codec(z.string(), z.date(), {
      decode: (isoString) => new Date(isoString),
      encode: (date) => date.toISOString(),
    }),
    title: z.string(),
    categories: z.array(z.string()).optional().nullable(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    toc: z.boolean().optional(),
    author: z.string().optional(),
  }),
});

const appMdx = defineCollection({
  name: "appMdx",
  directory: "src/routes/(app)",
  include: "*/index.mdx",
  parser: 'frontmatter-only',
  schema: z.object({
    date: z.codec(z.string(), z.date(), {
      decode: (isoString) => new Date(isoString),
      encode: (date) => date.toISOString(),
    }),
    title: z.string(),
    categories: z.array(z.string()).optional().nullable(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    toc: z.boolean().optional(),
    author: z.string().optional(),
  }),
  transform: (doc) => ({
    ...doc,
    _meta: {
      ...doc._meta,
      path: doc._meta.directory,
    },
  }),
});

const appRoutes = defineCollection({
  name: "appRoutes",
  directory: "src/routes/(app)",
  include: "*/meta.json",
  parser: 'json',
  schema: z.object({
    date: z.codec(z.string(), z.date(), {
      decode: (isoString) => new Date(isoString),
      encode: (date) => date.toISOString(),
    }),
    title: z.string(),
    categories: z.array(z.string()).optional().nullable(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    toc: z.boolean().optional(),
    author: z.string().optional(),
  }),
  transform: (doc) => ({
    ...doc,
    _meta: {
      ...doc._meta,
      path: doc._meta.directory,
    },
  }),
});

export default defineConfig({
  content: [posts, appMdx, appRoutes],
});
