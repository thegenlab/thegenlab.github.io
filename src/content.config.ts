import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file } from 'astro/loaders';

const link = z.object({ label: z.string(), url: z.url() });
const people = defineCollection({
  loader: file('src/content/people.json'),
  schema: z.object({ name: z.string(), role: z.string(), group: z.enum(['Faculty', 'Students', 'Research assistants', 'Alumni']), initials: z.string(), bio: z.string(), order: z.number().default(99), links: z.array(link).default([]) }),
});
const publications = defineCollection({
  loader: file('src/content/publications.json'),
  schema: z.object({ title: z.string(), name: z.string(), summary: z.string(), authors: z.string(), venue: z.string(), year: z.number().int(), featured: z.boolean().default(false), order: z.number().default(99), image: z.string(), imageAlt: z.string(), imageFit: z.enum(['cover', 'contain']).default('cover'), links: z.array(link).min(1) }),
});
const news = defineCollection({
  loader: file('src/content/news.json'),
  schema: z.object({ title: z.string(), date: z.coerce.date(), description: z.string(), url: z.url().optional() }),
});
export const collections = { people, publications, news };
