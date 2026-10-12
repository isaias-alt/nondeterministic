// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';
import rehypeExternalLinks from 'rehype-external-links';
import { unified } from '@astrojs/markdown-remark';

import concreteTheme from './src/styles/shiki-concrete-theme.ts';
import { codeChromeTransformer } from './src/styles/shiki-code-chrome.ts';
import { rehypeProseClasses } from './src/styles/rehype-prose-classes.ts';
import { rehypeLocalizeCodeChrome } from './src/styles/rehype-localize-code-chrome.ts';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.lucasco.dev',
  build: { inlineStylesheets: 'always' },
  adapter: vercel(),

  // English is the default locale and stays unprefixed. Spanish lives under
  // /es/. No `fallback`: untranslated posts get no Spanish page at all.
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false }
  },

  markdown: {
    shikiConfig: {
      theme: concreteTheme,
      transformers: [codeChromeTransformer()]
    },
    processor: unified({
      rehypePlugins: [
        rehypeProseClasses,
        rehypeLocalizeCodeChrome,
        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]
      ]
    })
  },

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    sitemap({
      // The only source of hreflang: pages with a counterpart get reciprocal
      // alternates, pages without one get none. The HTML has no alternates.
      i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es' } },
      serialize(item) {
        // The integration does not emit x-default. It points at the English
        // page. `serialize` can run more than once per item, so guard it.
        const links = item.links ?? [];
        const english = links.find((link) => link.lang === 'en');
        if (english && !links.some((link) => link.lang === 'x-default')) {
          links.push({ url: english.url, lang: 'x-default' });
        }
        return item;
      }
    })
  ]
});