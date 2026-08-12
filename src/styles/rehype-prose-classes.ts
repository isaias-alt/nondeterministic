import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';

/**
 * Assigns Tailwind utility classes to the tags markdown compiles to.
 * These elements come from the markdown pipeline, not an Astro template, so
 * there's no other way to reach them with Tailwind's class-based styling.
 */
export function rehypeProseClasses() {
	return (tree: Root) => {
		visit(tree, 'element', (node: Element, _index, parent) => {
			switch (node.tagName) {
				case 'p':
					addClass(node, 'mb-[22px] font-inter text-[17px] leading-[1.72] text-prose-body');
					break;
				case 'h2':
					addClass(
						node,
						"mt-11 mb-4 font-archivo text-2xl font-bold tracking-[-0.02em] text-bone before:content-['#_'] before:font-mono before:text-xl before:font-normal before:text-steel-text"
					);
					break;
				case 'h3':
					addClass(
						node,
						'mt-9 mb-3.5 font-archivo text-xl font-bold tracking-[-0.02em] text-bone'
					);
					break;
				case 'ul':
				case 'ol':
					addClass(node, 'mb-[22px] pl-[1.4em] font-inter text-[17px] leading-[1.72] text-prose-body');
					break;
				case 'a':
					addClass(
						node,
						'text-steel-text no-underline border-b border-steel-dim hover:border-steel'
					);
					break;
				case 'blockquote':
					addClass(node, 'mb-6 border-l-2 border-steel pl-5 italic text-fog');
					break;
				case 'img':
					addClass(node, 'my-8 block h-auto max-w-full rounded-[3px] border border-line');
					break;
				case 'code':
					if (parent && parent.type === 'element' && parent.tagName !== 'pre') {
						addClass(
							node,
							'rounded-[3px] border border-line bg-surface px-1.5 py-0.5 font-mono text-[0.86em] text-steel-text'
						);
					}
					break;
			}
		});
	};
}

function addClass(node: Element, classes: string) {
	const existing = node.properties.className;
	const existingClasses = Array.isArray(existing) ? existing.map(String) : [];
	node.properties.className = [...existingClasses, ...classes.split(' ')];
}
