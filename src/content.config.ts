import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    draft: z.boolean().default(false),
    devto_id: z.number().optional(),
    devto_hash: z.string().optional(),
    hashnode_id: z.string().optional(),
    hashnode_hash: z.string().optional(),
    medium_id: z.string().optional(),
  }),
});

export const collections = { articles };
