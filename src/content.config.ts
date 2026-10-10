import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file } from 'astro/loaders';

const link = z.object({ label: z.string(), url: z.url() });
const people = defineCollection({
  loader: file('src/content/people.json'),
  schema: z.object({ name: z.string(), role: z.string(), group: z.enum(['Faculty', 'Students', 'Research assistants', 'Visitors and research assistants', 'Alumni']), order: z.number().default(99), links: z.array(link).default([]) }).refine(
    person => person.group !== 'Students' || ['PhD student', 'MPhil student'].includes(person.role),
    { message: 'Core members must be PhD or MPhil students.', path: ['role'] },
  ),
});
const collaborators = defineCollection({
  loader: file('src/content/collaborators.json'),
  schema: z.object({ name: z.string(), affiliation: z.string(), order: z.number().default(99), links: z.array(link).default([]) }),
});
const publications = defineCollection({
  loader: file('src/content/publications.json'),
  schema: z.object({ title: z.string(), name: z.string(), summary: z.string(), authors: z.string(), venue: z.string(), year: z.number().int(), featured: z.boolean().default(false), order: z.number().default(99), image: z.string(), imageAlt: z.string(), imageFit: z.enum(['cover', 'contain']).default('cover'), links: z.array(link).min(1) }),
});
export const collections = { people, collaborators, publications };
