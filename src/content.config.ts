import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const markdown = (directory: string) =>
  glob({
    base: `./src/content/${directory}`,
    pattern: '**/*.md',
  });

const hero = defineCollection({
  loader: markdown('hero'),
  schema: z.object({
    role: z.string(),
    username: z.string(),
    hostname: z.string(),
    bio: z.string(),
    skills: z.record(z.string(), z.array(z.string())),
  }),
});

const projects = defineCollection({
  loader: markdown('projects'),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    stack: z.array(z.string()),
    icon: z.string(),
    link: z.url(),
    order: z.number(),
  }),
});

const experience = defineCollection({
  loader: markdown('experience'),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    period: z.string(),
    stack: z.array(z.string()),
    order: z.number(),
    current: z.boolean().default(false),
    description: z.string().optional(),
  }),
});

const contacts = defineCollection({
  loader: markdown('contacts'),
  schema: z.object({
    heading: z.string(),
    links: z.array(
      z.object({
        label: z.string(),
        url: z.url(),
        icon: z.string().optional(),
      }),
    ),
  }),
});

export const collections = {
  hero,
  projects,
  experience,
  contacts,
};
