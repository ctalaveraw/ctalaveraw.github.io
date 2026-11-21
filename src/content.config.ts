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
    aboutMore: z.array(z.string()).default([]),
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
    linkLabel: z.enum(['View repository', 'View merged PR']),
    order: z.number(),
  }),
});

const experience = defineCollection({
  loader: markdown('experience'),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    period: z.string(),
    workType: z.string(),
    stack: z.array(z.string()),
    order: z.number(),
    current: z.boolean().default(false),
    description: z.string().optional(),
  }),
});

const labNotes = defineCollection({
  loader: markdown('lab-notes'),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.iso.date(),
    status: z.enum(['verified', 'investigated', 'planned']),
    areas: z.array(z.string()).min(1),
    order: z.number(),
    evidence: z
      .array(
        z.object({
          label: z.string(),
          url: z.url(),
        }),
      )
      .min(1),
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
  labNotes,
  contacts,
};
