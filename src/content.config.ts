import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Post slugs come from the folder name that holds `index.md` (the segment
 * right before it), never from the `_standalone`/`series/<slug>` bucketing
 * above it - see prompt.md section 4.3.
 */
function slugFromParentFolder({ entry }: { entry: string }): string {
  const segments = entry.split('/');
  return segments.at(-2) ?? entry;
}

const posts = defineCollection({
  loader: glob({
    pattern: '**/index.{md,mdx}',
    base: './src/content/posts',
    generateId: slugFromParentFolder
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      draft: z.boolean().default(false),
      cover: image().optional(),
      series: reference('series').optional(),
      order: z.number().optional()
    })
});

const series = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/series' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      cover: image(),
      pubDate: z.coerce.date()
    })
});

export const collections = { posts, series };
