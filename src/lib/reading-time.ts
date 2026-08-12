const WORDS_PER_MINUTE = 200;

/** Reading time estimated from raw markdown, never stored in frontmatter. */
export function estimateReadingMinutes(markdown: string): number {
	const words = markdown
		.replace(/```[\s\S]*?```/g, '')
		.replace(/`[^`]*`/g, '')
		.replace(/!?\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/[#>*_~`-]/g, ' ')
		.split(/\s+/)
		.filter(Boolean).length;

	return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
