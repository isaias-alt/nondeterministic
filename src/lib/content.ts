import { getCollection, render, type CollectionEntry } from 'astro:content';
import { defaultLocale, locales, type Locale } from '../i18n/ui';
import { homeUrl, postUrl, seriesIndexUrl, seriesUrl } from './urls';
import type { PostListItem, PostView, SeriesCard, SeriesView } from './views';

type EnglishPost = CollectionEntry<'posts'>;
type CollectionName = 'posts' | 'series' | 'postsEs' | 'seriesEs';

const collectionCache = new Map<CollectionName, Promise<unknown>>();

/**
 * Every page and the nav's language switcher read the same collections, so a
 * build loads each once. The dev server skips the cache to see live edits.
 */
function loadCollection<C extends CollectionName>(name: C): Promise<CollectionEntry<C>[]> {
	if (!import.meta.env.PROD) return getCollection(name);
	let entries = collectionCache.get(name);
	if (!entries) {
		entries = getCollection(name);
		collectionCache.set(name, entries);
	}
	return entries as Promise<CollectionEntry<C>[]>;
}

/**
 * An English post is public unless it is a draft in a production build. The
 * dev server shows drafts. This is the single publish rule: every Spanish
 * page derives from it through its English source, so a translation goes
 * live exactly when its English post does.
 */
const isPublished = (post: EnglishPost) => !import.meta.env.PROD || !post.data.draft;

const dirname = (filePath: string | undefined) => (filePath ?? '').replace(/\/[^/]*$/, '');

export interface Translation {
	slug: string;
	/** Spanish entry: title, description and body only. */
	t: CollectionEntry<'postsEs'>;
	/** English source of truth: dates, cover, series and order. */
	en: EnglishPost;
}

/**
 * Published translations. A Spanish file pairs with the index.md that sits in
 * the same folder. One with no English sibling is an authoring mistake and
 * fails the build rather than being skipped; one whose English post is an
 * unpublished draft is simply left out.
 */
async function getTranslations(): Promise<Translation[]> {
	const [spanish, english] = await Promise.all([loadCollection('postsEs'), loadCollection('posts')]);
	const englishByDir = new Map(english.map((post) => [dirname(post.filePath), post]));

	const translations: Translation[] = [];
	for (const t of spanish) {
		const en = englishByDir.get(dirname(t.filePath));
		if (!en) {
			throw new Error(
				`${t.filePath} has no English source: expected an index.md in the same folder.`
			);
		}
		if (isPublished(en)) translations.push({ slug: en.id, t, en });
	}
	return translations;
}

export async function getTranslatedPost(slug: string): Promise<Translation | undefined> {
	return (await getTranslations()).find((translation) => translation.slug === slug);
}

async function getPublishedPosts(): Promise<EnglishPost[]> {
	return (await loadCollection('posts')).filter(isPublished);
}

async function getSeriesTitles(lang: Locale): Promise<Map<string, string>> {
	if (lang === 'en') {
		const all = await loadCollection('series');
		return new Map(all.map((series) => [series.id, series.data.title]));
	}
	const all = await loadCollection('seriesEs');
	return new Map(all.map((series) => [series.id, series.data.title]));
}

interface PostRecord {
	slug: string;
	/** Entry that supplies the text: the English post, or its Spanish translation. */
	entry: EnglishPost | CollectionEntry<'postsEs'>;
	/** English source of truth: dates, cover, series and order. */
	en: EnglishPost;
}

/** Posts that exist in `lang`, in collection order. */
async function getPostRecords(lang: Locale): Promise<PostRecord[]> {
	if (lang === 'en') {
		return (await getPublishedPosts()).map((en) => ({ slug: en.id, entry: en, en }));
	}
	return (await getTranslations()).map(({ slug, t, en }) => ({ slug, entry: t, en }));
}

const newestFirst = (a: PostRecord, b: PostRecord) =>
	b.en.data.pubDate.valueOf() - a.en.data.pubDate.valueOf();

export async function getPostSlugs(lang: Locale): Promise<string[]> {
	return (await getPostRecords(lang)).map((record) => record.slug);
}

export async function getPostListItems(lang: Locale): Promise<PostListItem[]> {
	const [records, seriesTitles] = await Promise.all([getPostRecords(lang), getSeriesTitles(lang)]);
	return records.sort(newestFirst).map(({ slug, entry, en }) => {
		const seriesId = en.data.series?.id;
		return {
			id: slug,
			href: postUrl(lang, slug),
			title: entry.data.title,
			description: entry.data.description,
			pubDate: en.data.pubDate,
			seriesTitle: seriesId ? seriesTitles.get(seriesId) : undefined
		};
	});
}

export async function getPostView(lang: Locale, slug: string): Promise<PostView> {
	const record = (await getPostRecords(lang)).find((r) => r.slug === slug);
	if (!record) throw new Error(`No ${lang} post for slug "${slug}".`);

	const { entry, en } = record;
	const { Content } = await render(entry);
	return {
		id: slug,
		title: entry.data.title,
		description: entry.data.description,
		pubDate: en.data.pubDate,
		updatedDate: en.data.updatedDate,
		cover: en.data.cover,
		body: entry.body ?? '',
		filePath: entry.filePath ?? '',
		Content
	};
}

interface SeriesRecord {
	id: string;
	title: string;
	description: string;
	cover: SeriesCard['cover'];
	posts: PostRecord[];
}

/**
 * Series that have a page in `lang`: at least one post there, and for Spanish
 * a seriesEs entry (with its English counterpart). Posts are in `order`.
 */
async function getSeriesRecords(lang: Locale): Promise<SeriesRecord[]> {
	const [english, records] = await Promise.all([loadCollection('series'), getPostRecords(lang)]);
	const englishById = new Map(english.map((series) => [series.id, series]));

	let titles: Map<string, { title: string; description: string }>;
	if (lang === 'en') {
		titles = new Map(english.map((s) => [s.id, { title: s.data.title, description: s.data.description }]));
	} else {
		const spanish = await loadCollection('seriesEs');
		for (const s of spanish) {
			if (!englishById.has(s.id)) {
				throw new Error(`${s.filePath} has no English source: expected src/content/series/${s.id}.md.`);
			}
		}
		titles = new Map(spanish.map((s) => [s.id, { title: s.data.title, description: s.data.description }]));
	}

	const result: SeriesRecord[] = [];
	for (const [id, text] of titles) {
		const cover = englishById.get(id)!.data.cover;
		const posts = records
			.filter((record) => record.en.data.series?.id === id)
			.sort((a, b) => (a.en.data.order ?? 0) - (b.en.data.order ?? 0));
		if (posts.length > 0) result.push({ id, ...text, cover, posts });
	}
	return result;
}

export async function getSeriesIds(lang: Locale): Promise<string[]> {
	return (await getSeriesRecords(lang)).map((series) => series.id);
}

export async function getSeriesCards(lang: Locale): Promise<SeriesCard[]> {
	return (await getSeriesRecords(lang)).map((series) => ({
		href: seriesUrl(lang, series.id),
		title: series.title,
		description: series.description,
		cover: series.cover,
		count: series.posts.length
	}));
}

export async function getSeriesView(lang: Locale, id: string): Promise<SeriesView> {
	const series = (await getSeriesRecords(lang)).find((s) => s.id === id);
	if (!series) throw new Error(`No ${lang} series "${id}".`);
	return {
		title: series.title,
		description: series.description,
		cover: series.cover,
		posts: series.posts.map(({ slug, entry }) => ({
			href: postUrl(lang, slug),
			title: entry.data.title,
			description: entry.data.description
		}))
	};
}

/**
 * URL of the other language's version of the page at `pathname`, for the
 * language switcher. Falls back to that language's home when the page has no
 * counterpart (an untranslated post, a series with no Spanish page).
 */
export async function getAlternateUrl(pathname: string): Promise<{ lang: Locale; href: string }> {
	const segments = pathname.split('/').filter(Boolean);
	const current = locales.find((l) => l !== defaultLocale && l === segments[0]) ?? defaultLocale;
	if (current !== defaultLocale) segments.shift();
	const lang = locales.find((l) => l !== current)!;

	const [first, second] = segments;
	if (segments.length === 0) return { lang, href: homeUrl(lang) };
	if (segments.length === 1 && first === 'series') return { lang, href: seriesIndexUrl(lang) };
	if (segments.length === 2 && first === 'series') {
		const exists = (await getSeriesIds(lang)).includes(second);
		return { lang, href: exists ? seriesUrl(lang, second) : homeUrl(lang) };
	}
	if (segments.length === 1) {
		const exists = (await getPostSlugs(lang)).includes(first);
		return { lang, href: exists ? postUrl(lang, first) : homeUrl(lang) };
	}
	return { lang, href: homeUrl(lang) };
}
