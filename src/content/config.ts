import { defineCollection, z } from 'astro:content';

const log = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    substackUrl: z.string().url().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { log };
