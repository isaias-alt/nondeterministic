import { getRelativeLocaleUrl } from 'astro:i18n';
import type { Locale } from '../i18n/ui';

/**
 * Every internal URL goes through here so English (unprefixed) and Spanish
 * (/es/) links are built one way, always with a trailing slash.
 */

export const homeUrl = (lang: Locale) => getRelativeLocaleUrl(lang);
export const postUrl = (lang: Locale, slug: string) => getRelativeLocaleUrl(lang, slug);
export const seriesIndexUrl = (lang: Locale) => getRelativeLocaleUrl(lang, 'series');
export const seriesUrl = (lang: Locale, id: string) => getRelativeLocaleUrl(lang, `series/${id}`);

/** Path of the generated OG card (the .png route lives outside the locale tree). */
export const postOgPath = (lang: Locale, slug: string) =>
	lang === 'en' ? `/og/${slug}.png` : `/og/${lang}/${slug}.png`;
export const homeOgPath = (lang: Locale) =>
	lang === 'en' ? '/og/home.png' : `/og/${lang}/home.png`;
