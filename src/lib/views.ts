import type { ImageMetadata } from 'astro';
import type { render } from 'astro:content';

/**
 * Resolved view data for the shared page templates in src/templates. The
 * templates never see a collection entry: the Spanish pages build these from
 * `postsEs` plus the English entry, the English pages from `posts` alone.
 */

export interface PostListItem {
	/** Slug, shared by both languages. */
	id: string;
	href: string;
	title: string;
	description: string;
	pubDate: Date;
	seriesTitle?: string;
}

export interface PostView {
	id: string;
	title: string;
	description: string;
	pubDate: Date;
	updatedDate?: Date;
	cover?: ImageMetadata;
	/** Raw markdown of the page's own language, for reading time. */
	body: string;
	/** Repo path of the file to edit. */
	filePath: string;
	Content: Awaited<ReturnType<typeof render>>['Content'];
}

export interface SeriesCard {
	href: string;
	title: string;
	description: string;
	cover: ImageMetadata;
	count: number;
}

export interface SeriesPostItem {
	href: string;
	title: string;
	description: string;
}

export interface SeriesView {
	title: string;
	description: string;
	cover: ImageMetadata;
	posts: SeriesPostItem[];
}
