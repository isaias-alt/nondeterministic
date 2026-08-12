// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';
import rehypeExternalLinks from 'rehype-external-links';
import { unified } from '@astrojs/markdown-remark';

import concreteTheme from './src/styles/shiki-concrete-theme.ts';
import { codeChromeTransformer } from './src/styles/shiki-code-chrome.ts';
import { rehypeProseClasses } from './src/styles/rehype-prose-classes.ts';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.lucasco.dev',
  adapter: vercel(),

  markdown: {
    shikiConfig: {
      theme: concreteTheme,
      transformers: [codeChromeTransformer()]
    },
    processor: unified({
      rehypePlugins: [
        rehypeProseClasses,
        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]
      ]
    })
  },

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()]
});