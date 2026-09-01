import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const optionalDate = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z.coerce.date().optional(),
);

const optionalString = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z.string().optional(),
);

const posts = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/posts",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: optionalDate,
    kind: z.enum(["blog", "thought"]),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    image: optionalString,
  }),
});

export const collections = { posts };
