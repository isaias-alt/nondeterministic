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

/**
 * Spanish translations. They carry only text (title, description, body);
 * dates, cover, series and order are read from the English entry, so metadata
 * cannot drift. `.strict()` makes a stray `draft`, `pubDate` or `cover` in a
 * Spanish file a build error instead of a value that is silently ignored.
 * See src/lib/content.ts for how entries pair with their English source.
 */
const postsEs = defineCollection({
  loader: glob({
    pattern: '**/index.es.{md,mdx}',
    base: './src/content/posts',
    generateId: slugFromParentFolder
  }),
  schema: z.strictObject({
    title: z.string(),
    description: z.string()
  })
});

const seriesEs = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/series-es' }),
  schema: z.strictObject({
    title: z.string(),
    description: z.string()
  })
});

export const collections = { posts, series, postsEs, seriesEs };
