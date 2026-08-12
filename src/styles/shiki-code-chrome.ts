import type { ShikiTransformer } from 'shiki';
import type { Element } from 'hast';

function appendClass(node: Element, classes: string) {
	const existing = node.properties.className;
	const existingClasses = Array.isArray(existing) ? existing.map(String) : [];
	node.properties.className = [...existingClasses, ...classes.split(' ')];
}

/**
 * Wraps Shiki's <pre> output with the terminal chrome from section 3.4: a
 * bar showing the language and a copy button, both above the code body.
 * Styling is Tailwind utility classes; `data-code-block`/`data-code-copy`
 * are separate hooks for the click handler in [slug].astro, kept apart from
 * styling classes on purpose.
 */
export function codeChromeTransformer(): ShikiTransformer {
	return {
		name: 'concrete-code-chrome',
		pre(node) {
			appendClass(node, 'm-0 overflow-x-auto py-4 px-[18px]');
			return node;
		},
		code(node) {
			appendClass(node, 'font-mono text-[13.5px] leading-[1.75]');
			return node;
		},
		root(hast) {
			const pre = hast.children[0];
			if (pre?.type !== 'element' || pre.tagName !== 'pre') return hast;

			const lang = this.options.lang;

			const bar: Element = {
				type: 'element',
				tagName: 'div',
				properties: {
					className: ['flex', 'items-center', 'justify-between', 'border-b', 'border-line', 'bg-surface-2', 'px-3.5', 'py-2']
				},
				children: [
					{
						type: 'element',
						tagName: 'span',
						properties: { className: ['font-mono', 'text-[11px]', 'tracking-[0.04em]', 'text-fog'] },
						children: [{ type: 'text', value: lang }]
					},
					{
						type: 'element',
						tagName: 'button',
						properties: {
							className: [
								'cursor-pointer',
								'border-0',
								'bg-transparent',
								'font-mono',
								'text-[11px]',
								'text-steel-dim-text',
								'transition-colors',
								'duration-150',
								'hover:text-steel-text'
							],
							type: 'button',
							'data-code-copy': ''
						},
						children: [{ type: 'text', value: 'copy' }]
					}
				]
			};

			const wrapper: Element = {
				type: 'element',
				tagName: 'div',
				properties: {
					className: ['mb-6', 'overflow-hidden', 'rounded-[5px]', 'border', 'border-line', 'bg-surface'],
					'data-code-block': ''
				},
				children: [bar, pre]
			};

			hast.children = [wrapper];
			return hast;
		}
	};
}
