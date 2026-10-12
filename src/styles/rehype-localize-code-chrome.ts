import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';
import { t } from '../i18n/ui';

/**
 * The code block copy button is built by the Shiki transformer, which knows
 * nothing about the post's language. Spanish posts (index.es.md) get their
 * label here; English files are left untouched. The "copied" label rides
 * along as `data-code-copied` for the click handler in PostPage.astro.
 */
export function rehypeLocalizeCodeChrome() {
	return (tree: Root, file: { path?: string }) => {
		if (!/\.es\.mdx?$/.test(file.path ?? '')) return;

		visit(tree, 'element', (node: Element) => {
			if (node.tagName !== 'button' || !('data-code-copy' in node.properties)) return;
			node.properties['data-code-copied'] = t('es', 'post.copied');
			node.children = [{ type: 'text', value: t('es', 'post.copy') }];
		});
	};
}
