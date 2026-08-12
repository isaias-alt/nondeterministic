import type { APIRoute } from 'astro';
import { ImageResponse } from '@vercel/og';
import { readFile } from 'node:fs/promises';
import { createElement } from 'react';
import sharp from 'sharp';

// Mirrors the copy on the homepage (src/pages/index.astro) - same title,
// same tagline, never invented separately.
const HOME_TITLE = 'nondeterministic';
const HOME_TAGLINE =
	'Notes on building software. Frontend, backend, and the decisions in between. No guarantees on output order.';

const archivoBold = readFile(
	new URL('../../../node_modules/@fontsource/archivo/files/archivo-latin-800-normal.woff', import.meta.url)
);
const jetbrainsMono = readFile(
	new URL(
		'../../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff',
		import.meta.url
	)
);
const interRegular = readFile(
	new URL('../../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff', import.meta.url)
);
// Satori/resvg render images most reliably as PNG, so the source .webp avatar
// is transcoded once at module load instead of embedded as-is.
const avatarDataUri = readFile(new URL('../../../public/me.webp', import.meta.url))
	.then((buf) => sharp(buf).resize(112, 112, { fit: 'cover' }).png().toBuffer())
	.then((png) => `data:image/png;base64,${png.toString('base64')}`);

export const GET: APIRoute = async () => {
	const [archivoData, monoData, interData, avatar] = await Promise.all([
		archivoBold,
		jetbrainsMono,
		interRegular,
		avatarDataUri
	]);

	const element = createElement(
		'div',
		{
			style: {
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				backgroundColor: '#0E1012',
				padding: '64px'
			}
		},
		createElement(
			'div',
			{ style: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center' } },
			createElement(
				'div',
				{ style: { display: 'flex', alignItems: 'center', gap: 14 } },
				createElement(
					'div',
					{ style: { fontFamily: 'JetBrains Mono', fontSize: 22, color: '#8A9099' } },
					'by'
				),
				createElement('img', {
					src: avatar,
					width: 56,
					height: 56,
					style: { borderRadius: '50%', border: '2px solid #23282D' }
				})
			)
		),
		createElement(
			'div',
			{ style: { display: 'flex', flexDirection: 'column', gap: 24 } },
			createElement(
				'div',
				{
					style: {
						display: 'flex',
						fontFamily: 'Archivo',
						fontWeight: 800,
						fontSize: 72,
						lineHeight: 1,
						color: '#E8E6E1'
					}
				},
				HOME_TITLE,
				createElement('span', { style: { color: '#5B7A99' } }, '.')
			),
			createElement(
				'div',
				{
					style: {
						fontFamily: 'Inter',
						fontSize: 28,
						lineHeight: 1.5,
						color: '#8A9099',
						maxWidth: 820
					}
				},
				HOME_TAGLINE
			)
		),
		createElement('div', { style: { width: 56, height: 3, backgroundColor: '#5B7A99' } })
	);

	return new ImageResponse(element, {
		width: 1200,
		height: 630,
		fonts: [
			{ name: 'Archivo', data: archivoData, weight: 800, style: 'normal' },
			{ name: 'JetBrains Mono', data: monoData, weight: 500, style: 'normal' },
			{ name: 'Inter', data: interData, weight: 400, style: 'normal' }
		]
	});
};
